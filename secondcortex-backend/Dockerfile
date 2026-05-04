# ── Stage 1: Dependencies ─────────────────────────────────────
FROM python:3.12-slim AS base

WORKDIR /app

# Install system deps for chromadb (requires gcc for some wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libffi-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Application ──────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Copy installed packages from build stage
COPY --from=base /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=base /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Expose Azure App Service's default container port plus the local backend port.
EXPOSE 80 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import os, urllib.request; port = os.environ.get('PORT') or os.environ.get('WEBSITES_PORT') or '80'; urllib.request.urlopen(f'http://localhost:{port}/health')" || exit 1

# Run with gunicorn + uvicorn workers for production.
# Azure App Service defaults custom containers to port 80 unless PORT/WEBSITES_PORT is set.
# Send access/error logs to stdout/stderr so Azure App Service Log Stream can show them.
CMD ["sh", "-c", "exec gunicorn -w ${GUNICORN_WORKERS:-2} -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:${PORT:-${WEBSITES_PORT:-80}} --timeout ${GUNICORN_TIMEOUT:-120} --access-logfile - --error-logfile -"]
