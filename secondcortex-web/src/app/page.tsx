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

// ── Memory responses data ───────────────────────────────────
const RESPONSES: Record<string, { label: string; text: string }> = {
  "auth/jwt_handler.py": {
    label: "Retriever · Memory Match — auth/jwt_handler.py",
    text: `Branch: feat/auth · 2 hours ago\n\nContext: Implementing JWT authentication with RS256 signing algorithm. 24-hour access token expiry with refresh token rotation. Stored session in PostgreSQL-backed auth database.\n\nRelevant symbols: create_access_token(), verify_token(), refresh_token_endpoint()`,
  },
  "agents/retriever.py": {
    label: "Retriever · Memory Match — agents/retriever.py",
    text: `Branch: feat/mcp · 5 hours ago\n\nContext: Cross-workspace semantic search added to Retriever Agent. ChromaDB collections isolated by user_id. Cosine similarity threshold set at 0.72 for high-signal results.\n\nRelevant symbols: search_memory(), upsert_snapshot(), cross_project_search()`,
  },
  "security/firewall.ts": {
    label: "Retriever · Memory Match — security/firewall.ts",
    text: `Branch: feat/security · 1 day ago\n\nContext: Semantic Firewall built to detect and redact secrets before any snapshot leaves the local machine. Pattern matching for API keys, JWT tokens, passwords, env vars.\n\nRelevant symbols: FirewallRule, redactSecrets(), scanSnapshot()`,
  },
  "agents/simulator.py": {
    label: "Retriever · Memory Match — agents/simulator.py",
    text: `Branch: feat/simulator · 2 days ago\n\nContext: Simulator Agent added as the 4th agent in the pipeline. Runs git status + diff before any resurrection to generate a SafetyReport. Blocks execution if destructive conflicts detected.\n\nRelevant symbols: run_preflight(), generate_safety_report(), check_unstashed_files()`,
  },
  "services/vector_db.py": {
    label: "Retriever · Memory Match — services/vector_db.py",
    text: `Branch: main · 3 days ago\n\nContext: VectorDB service abstraction over ChromaDB. Per-user collection management, snapshot upsert with 1536d embeddings, and semantic similarity search with metadata filtering.\n\nRelevant symbols: VectorDBService, upsert_snapshot(), semantic_search(), get_or_create_collection()`,
  },
};

const QUERY_MAP: Record<string, string> = {
  "jwt token flow": "auth/jwt_handler.py",
  "vector search logic": "agents/retriever.py",
  "where are secrets handled": "security/firewall.ts",
  "git branch conflicts": "agents/simulator.py",
  "rate limiting implementation": "services/vector_db.py",
};

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [queryValue, setQueryValue] = useState("");
  const [activeEntry, setActiveEntry] = useState("auth/jwt_handler.py");
  const [resultLabel, setResultLabel] = useState("Retriever · Awaiting Query");
  const [resultText, setResultText] = useState("Click any memory entry or type a query to see semantic retrieval in action.");

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

  // ── MEMORY DEMO HANDLERS ──────────────────────────────────
  const selectEntry = useCallback((file: string) => {
    setActiveEntry(file);
    const r = RESPONSES[file];
    if (r) {
      setResultLabel(r.label);
      setResultText(r.text);
    }
  }, []);

  const fireQuery = useCallback((q: string) => {
    const match = QUERY_MAP[q.toLowerCase().trim()];
    if (match) {
      setActiveEntry(match);
      const r = RESPONSES[match];
      setResultLabel(r.label);
      setResultText(r.text);
    } else {
      setResultLabel("Retriever · Semantic Search");
      setResultText(
        `Searching vector store for: "${q}"\n\nRunning cosine similarity search across ${Math.floor(Math.random() * 800) + 200} stored snapshots...\n\nTop result: similarity score 0.${Math.floor(Math.random() * 15) + 80} — context match found in active workspace history.`
      );
    }
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

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="section-label">How it works</div>
        <div className="section-title">From keystroke to<br /><em>memory</em> in milliseconds.</div>
        <p className="section-desc reveal">IDE events are captured in the background, embedded into a vector store, and made searchable — so any agent or external tool can pull relevant context when you need it.</p>

        <div className="pipeline reveal">
          <div className="pipeline-track" />
          <div className="pipeline-nodes">
            <div className="pipeline-node">
              <div className="node-index">01</div>
              <div className="node-title">Capture</div>
              <div className="node-desc">The VS Code extension monitors every IDE event — open tabs, active files, terminal output, git state — with a debounced snapshot system.</div>
              <span className="node-tag">eventCapture.ts</span>
            </div>
            <div className="pipeline-node">
              <div className="node-index">02</div>
              <div className="node-title">Embed</div>
              <div className="node-desc">Snapshots are vectorized using text-embedding-3-small into 1536-dimensional space and stored in a persistent ChromaDB instance per user.</div>
              <span className="node-tag">vector_db.py</span>
            </div>
            <div className="pipeline-node">
              <div className="node-index">03</div>
              <div className="node-title">Retrieve</div>
              <div className="node-desc">When you trigger a session restore or ask a question, the Retriever searches your vector store by semantic similarity — returning the most relevant snapshots, including those from other repos.</div>
              <span className="node-tag">retriever.py</span>
            </div>
            <div className="pipeline-node">
              <div className="node-index">04</div>
              <div className="node-title">Execute</div>
              <div className="node-desc">After you confirm the Planner&apos;s proposed actions, the Executor applies them to your workspace — opening files, switching branches, running the Simulator sub-agent to check for git conflicts first.</div>
              <span className="node-tag">executor.py</span>
            </div>
          </div>
        </div>
      </section>

      {/* AGENTS */}
      <section id="agents" className="agents-section">
        <div className="section-label">The agents</div>
        <div className="section-title">Three agents.<br /><em>One pipeline.</em></div>

        <div className="agents-grid reveal">
          <div className="agent-card">
            <div className="agent-icon"><div className="agent-icon-inner" style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--cyan)", fontWeight: 500 }}>PLN</div></div>
            <div className="agent-name">Planner</div>
            <div className="agent-role">Task Decomposition</div>
            <div className="agent-desc">Takes a natural language request and breaks it into a structured, step-by-step action plan. Uses retrieved context from your memory to make decisions relevant to your actual codebase.</div>
          </div>
          <div className="agent-card">
            <div className="agent-icon"><div className="agent-icon-inner" style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--cyan)", fontWeight: 500 }}>RTV</div></div>
            <div className="agent-name">Retriever</div>
            <div className="agent-role">Semantic Memory Search</div>
            <div className="agent-desc">Searches your ChromaDB vector store using cosine similarity to surface relevant past context — open files, git branches, code summaries.</div>
          </div>
          <div className="agent-card">
            <div className="agent-icon"><div className="agent-icon-inner" style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--cyan)", fontWeight: 500 }}>EXC</div></div>
            <div className="agent-name">Executor</div>
            <div className="agent-role">Workspace Restoration</div>
            <div className="agent-desc">Applies the approved action plan to your VS Code workspace — opening files, switching branches, restoring terminal context.</div>
          </div>
        </div>
      </section>

      {/* MEMORY DEMO */}
      <section id="memory" className="memory-demo">
        <div className="section-label">Live Memory</div>
        <div className="section-title">Query your<br /><em>past work.</em></div>

        <div className="demo-split reveal">
          <div className="memory-visualizer">
            <div className="memory-header">
              <span>ChromaDB · User Namespace</span>
              <span className="mem-status">LIVE</span>
            </div>
            <div className="memory-entries">
              {[
                { file: "auth/jwt_handler.py", summary: "Implemented RS256 JWT signing with 24h expiry and refresh token rotation.", branch: "feat/auth", time: "2h ago" },
                { file: "agents/retriever.py", summary: "Added cross-workspace semantic search with ChromaDB collection isolation per user_id.", branch: "feat/mcp", time: "5h ago" },
                { file: "security/firewall.ts", summary: "Semantic Firewall redacts API keys and secrets locally before upload.", branch: "feat/security", time: "1d ago" },
              ].map((entry) => (
                <div
                  key={entry.file}
                  className={`mem-entry${activeEntry === entry.file ? " active" : ""}`}
                  onClick={() => selectEntry(entry.file)}
                >
                  <div className="mem-file">{entry.file}</div>
                  <div className="mem-summary">{entry.summary}</div>
                  <div className="mem-meta"><span>{entry.branch}</span><span>{entry.time}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="query-panel">
            <div className="query-title">Ask your second cortex anything about your codebase.</div>
            <div className="query-desc">Natural language semantic search across your entire development history.</div>

            <div className="query-input-wrap">
              <input
                className="query-input"
                type="text"
                placeholder="How does authentication work in this project?"
                value={queryValue}
                onChange={(e) => setQueryValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fireQuery(queryValue)}
              />
              <button className="query-btn" onClick={() => fireQuery(queryValue)}>SEARCH</button>
            </div>

            <div className="query-result">
              <div className="result-label">{resultLabel}</div>
              <div className="result-text">{resultText}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
