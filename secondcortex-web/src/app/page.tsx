"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Terminal lines data ─────────────────────────────────────
const TERMINAL_LINES = [
  { type: "cmd", prompt: "~", text: "cortex resurrect --branch feat/auth" },
  { type: "out", text: "⟳  Scanning vector store..." },
  { type: "out", text: "✓  Found 3 matching snapshots" },
  { type: "out", text: "" },
  { type: "out", text: "   Proposed Action Plan:" },
  { type: "highlight", text: "   1. Open auth/jwt_handler.py" },
  { type: "highlight", text: "   2. Restore 4 tabs from last session" },
  { type: "highlight", text: "   3. Switch to branch: feat/auth" },
  { type: "out", text: "" },
  { type: "warn", text: "⚠  Simulator: 1 unstashed file detected" },
  { type: "out", text: "   → auth/routes.py (modified)" },
  { type: "out", text: "" },
  { type: "cmd", prompt: "~", text: "Confirm? [y/N] y" },
  { type: "success", text: "✓  Workspace resurrected in 94ms" },
];

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // ── CURSOR ──────────────────────────────────────────────
  useEffect(() => {
    const cursor = document.getElementById("cursor");
    const ring = document.getElementById("cursor-ring");
    if (!cursor || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0;

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    document.addEventListener("mousemove", onMove);

    const animCursor = () => {
      cursor.style.left = mx + "px";
      cursor.style.top = my + "px";
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(animCursor);
    };
    animCursor();

    // Hover expansion
    const setupHover = () => {
      document.querySelectorAll("button, a, .mem-entry, .suggestion-chip, .agent-card").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          cursor.style.width = "20px"; cursor.style.height = "20px";
          ring.style.width = "52px"; ring.style.height = "52px";
          ring.style.borderColor = "rgba(255,255,255,0.7)";
        });
        el.addEventListener("mouseleave", () => {
          cursor.style.width = "12px"; cursor.style.height = "12px";
          ring.style.width = "36px"; ring.style.height = "36px";
          ring.style.borderColor = "rgba(255,255,255,0.4)";
        });
      });
    };
    const t = setTimeout(setupHover, 500);

    return () => {
      document.removeEventListener("mousemove", onMove);
      clearTimeout(t);
    };
  }, []);

  // ── NEURAL CANVAS ───────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    interface N { x: number; y: number; vx: number; vy: number; r: number }
    const nodes: N[] = [];

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fill();
      });
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach((b) => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255,255,255,${0.1 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);

  // ── TERMINAL TYPEWRITER ─────────────────────────────────
  useEffect(() => {
    const tb = terminalRef.current;
    if (!tb) return;
    let li = 0;
    let cancelled = false;

    const typeNext = () => {
      if (cancelled || li >= TERMINAL_LINES.length) return;
      const line = TERMINAL_LINES[li];

      if (line.type === "cmd") {
        const el = document.createElement("div");
        el.className = "t-line";
        const id = `tl${li}`;
        el.innerHTML = `<span class="t-prompt">${line.prompt} $</span><span class="t-cmd" id="${id}"></span>`;
        tb.appendChild(el);
        const span = document.getElementById(id);
        let c = 0;
        const t = setInterval(() => {
          if (cancelled) { clearInterval(t); return; }
          c++;
          if (span) span.textContent = line.text.slice(0, c);
          if (c >= line.text.length) { clearInterval(t); li++; setTimeout(typeNext, 400); }
        }, 30);
      } else {
        const el = document.createElement("div");
        const cls: Record<string, string> = { out: "t-out", highlight: "t-out t-highlight", warn: "t-out t-warn", success: "t-out t-success" };
        el.className = cls[line.type] || "t-out";
        el.textContent = line.text;
        tb.appendChild(el);
        li++;
        setTimeout(typeNext, 120);
      }
      tb.scrollTop = tb.scrollHeight;
    };

    const timeout = setTimeout(typeNext, 1800);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, []);

  // ── COUNTER ANIMATION ───────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          if (e.target.classList.contains("stats-bar")) {
            document.querySelectorAll("[data-target]").forEach((el) => {
              const target = parseInt((el as HTMLElement).dataset.target || "");
              if (isNaN(target)) return;
              const suffix = (el as HTMLElement).dataset.suffix || "";
              let start = 0;
              const dur = 1600;
              const step = (ts: number) => {
                if (!start) start = ts;
                const p = Math.min((ts - start) / dur, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(ease * target) + suffix;
                if (p < 1) requestAnimationFrame(step);
              };
              requestAnimationFrame(step);
            });
          }
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div id="cursor" />
      <div id="cursor-ring" />

      {/* NAV */}
      <nav>
        <div className="nav-logo">Second<span>Cortex</span></div>
        <ul className="nav-links">
          <li><a href="#how">Architecture</a></li>
          <li><a href="#agents">Agents</a></li>
          <li><a href="#memory">Memory</a></li>
          <li><a href="#security">Security</a></li>
        </ul>
        <button className="nav-cta">Install Extension →</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <canvas ref={canvasRef} id="neural-canvas" />
        <div className="hero-content">
          <div className="hero-eyebrow">VS Code Extension · Multi-Agent AI · Vector Memory</div>
          <h1 className="hero-title">
            Your IDE<br />
            <em>never</em><br />
            forgets.
          </h1>
          <p className="hero-sub">
            SecondCortex is a persistent AI memory layer for VS Code — it captures your workspace context as you code,
            stores it as searchable vector embeddings, and lets you restore any past session with a natural language command.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-large">Install on VS Code</button>
            <button className="btn-secondary btn-large">Read the Docs</button>
          </div>
        </div>

        <div className="hero-terminal">
          <div className="terminal-window">
            <div className="terminal-bar">
              <div className="t-dot red" />
              <div className="t-dot yellow" />
              <div className="t-dot green" />
              <span className="terminal-title">cortex — secondcortex-backend</span>
            </div>
            <div className="terminal-body" ref={terminalRef} />
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {["Planner Agent", "Retriever Agent", "Executor Agent", "Simulator Sub-Agent", "ChromaDB Vector Store", "MCP Server", "Semantic Firewall", "Shadow Graph", "JWT Auth", "Azure Deployment", "FastAPI Backend", "GPT-4o", "Groq / Llama-3.1",
            "Planner Agent", "Retriever Agent", "Executor Agent", "Simulator Sub-Agent", "ChromaDB Vector Store", "MCP Server", "Semantic Firewall", "Shadow Graph", "JWT Auth", "Azure Deployment", "FastAPI Backend", "GPT-4o", "Groq / Llama-3.1",
          ].map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-bar reveal">
        <div className="stat-item">
          <div className="stat-num" data-target="3" data-suffix="">0</div>
          <div className="stat-label">Core Agents</div>
        </div>
        <div className="stat-item">
          <div className="stat-num" data-target="1536" data-suffix="">0</div>
          <div className="stat-label">Embedding Dimensions</div>
        </div>
        <div className="stat-item">
          <div className="stat-num" data-target="11" data-suffix="">0</div>
          <div className="stat-label">Technical Pivots Shipped</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">~sub-second</div>
          <div className="stat-label">Context Retrieval</div>
        </div>
      </div>
    </>
  );
}
