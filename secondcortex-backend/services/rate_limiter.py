"""
Global Gemini Rate Limiter — prevents 429 errors by throttling API calls
and providing retry-with-backoff when rate limits are hit.
"""

from __future__ import annotations

import logging
import time
import threading
from functools import wraps

logger = logging.getLogger("secondcortex.rate_limiter")

# ── Simple Token Bucket Rate Limiter ─────────────────────────────

class RateLimiter:
    """Thread-safe token bucket rate limiter for Gemini API calls."""

    def __init__(self, max_calls_per_minute: int = 12, max_retries: int = 2):
        self.max_calls = max_calls_per_minute
        self.max_retries = max_retries
        self._call_timestamps: list[float] = []
        self._lock = threading.Lock()

    def _cleanup_old_timestamps(self) -> None:
        """Remove timestamps older than 60 seconds."""
        cutoff = time.time() - 60.0
        self._call_timestamps = [t for t in self._call_timestamps if t > cutoff]

    def wait_if_needed(self) -> None:
        """Block until we're under the rate limit."""
        with self._lock:
            self._cleanup_old_timestamps()

            if len(self._call_timestamps) >= self.max_calls:
                # Wait until the oldest call falls outside the window
                oldest = self._call_timestamps[0]
                wait_time = 60.0 - (time.time() - oldest) + 0.5
                if wait_time > 0:
                    logger.warning(
                        "Rate limit reached (%d/%d calls in last 60s). "
                        "Waiting %.1fs before next call.",
                        len(self._call_timestamps), self.max_calls, wait_time
                    )
                    # Release lock while sleeping
                    self._lock.release()
                    time.sleep(wait_time)
                    self._lock.acquire()
                    self._cleanup_old_timestamps()

            self._call_timestamps.append(time.time())

    def record_429(self) -> None:
        """Called when a 429 is received — aggressively back off."""
        with self._lock:
            # Clear recent timestamps and add a large cooldown
            logger.warning("429 received — entering 30s cooldown.")
            self._call_timestamps = [time.time()] * self.max_calls


# ── Global singleton ─────────────────────────────────────────────

_global_limiter = RateLimiter(max_calls_per_minute=12, max_retries=2)


def get_rate_limiter() -> RateLimiter:
    """Return the global rate limiter instance."""
    return _global_limiter


def rate_limited_call(func, *args, **kwargs):
    """
    Execute a function with rate limiting and retry-on-429.
    Works with synchronous OpenAI client calls.
    """
    limiter = _global_limiter

    for attempt in range(limiter.max_retries + 1):
        limiter.wait_if_needed()

        try:
            return func(*args, **kwargs)
        except Exception as exc:
            exc_str = str(exc)

            # Check if it's a 429 rate limit error
            if "429" in exc_str or "RESOURCE_EXHAUSTED" in exc_str:
                limiter.record_429()

                if attempt < limiter.max_retries:
                    backoff = (attempt + 1) * 15  # 15s, 30s
                    logger.warning(
                        "Gemini 429 error (attempt %d/%d). Retrying in %ds...",
                        attempt + 1, limiter.max_retries + 1, backoff
                    )
                    time.sleep(backoff)
                    continue
                else:
                    logger.error("Gemini 429 error — all retries exhausted.")
                    raise
            else:
                # Non-rate-limit error — don't retry
                raise
