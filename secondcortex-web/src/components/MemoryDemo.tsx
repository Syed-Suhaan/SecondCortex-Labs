"use client";
import { useState } from "react";

interface MemoryEntry {
    file: string;
    summary: string;
    branch: string;
    time: string;
}

interface MemoryResponse {
    label: string;
    text: string;
}

const ENTRIES: MemoryEntry[] = [
    { file: "auth/jwt_handler.py", summary: "Implemented RS256 JWT signing with 24h expiry and refresh token rotation.", branch: "feat/auth", time: "2h ago" },
    { file: "agents/retriever.py", summary: "Added cross-workspace semantic search with ChromaDB collection isolation per user_id.", branch: "feat/mcp", time: "5h ago" },
    { file: "security/firewall.ts", summary: "Semantic Firewall redacts API keys and secrets locally before upload.", branch: "feat/security", time: "1d ago" },
    { file: "agents/simulator.py", summary: "Pre-flight simulator generates conflict Safety Reports from git diff.", branch: "feat/simulator", time: "2d ago" },
    { file: "services/vector_db.py", summary: "VectorDB service wrapping ChromaDB with upsert and semantic search.", branch: "main", time: "3d ago" },
];

const RESPONSES: Record<string, MemoryResponse> = {
    "auth/jwt_handler.py": {
        label: "Retriever · Memory Match — auth/jwt_handler.py",
        text: "Branch: feat/auth · 2 hours ago\n\nContext: Implementing JWT authentication with RS256 signing algorithm. 24-hour access token expiry with refresh token rotation. Stored session in PostgreSQL-backed auth database.\n\nRelevant symbols: create_access_token(), verify_token(), refresh_token_endpoint()",
    },
    "agents/retriever.py": {
        label: "Retriever · Memory Match — agents/retriever.py",
        text: "Branch: feat/mcp · 5 hours ago\n\nContext: Cross-workspace semantic search added to Retriever Agent. ChromaDB collections isolated by user_id. Cosine similarity threshold set at 0.72 for high-signal results.\n\nRelevant symbols: search_memory(), upsert_snapshot(), cross_project_search()",
    },
    "security/firewall.ts": {
        label: "Retriever · Memory Match — security/firewall.ts",
        text: "Branch: feat/security · 1 day ago\n\nContext: Semantic Firewall built to detect and redact secrets before any snapshot leaves the local machine. Pattern matching for API keys, JWT tokens, passwords, env vars.\n\nRelevant symbols: FirewallRule, redactSecrets(), scanSnapshot()",
    },
    "agents/simulator.py": {
        label: "Retriever · Memory Match — agents/simulator.py",
        text: "Branch: feat/simulator · 2 days ago\n\nContext: Simulator Agent added as the 4th agent in the pipeline. Runs git status + diff before any resurrection to generate a SafetyReport. Blocks execution if destructive conflicts detected.\n\nRelevant symbols: run_preflight(), generate_safety_report(), check_unstashed_files()",
    },
    "services/vector_db.py": {
        label: "Retriever · Memory Match — services/vector_db.py",
        text: "Branch: main · 3 days ago\n\nContext: VectorDB service abstraction over ChromaDB. Per-user collection management, snapshot upsert with 1536d embeddings, and semantic similarity search with metadata filtering.\n\nRelevant symbols: VectorDBService, upsert_snapshot(), semantic_search(), get_or_create_collection()",
    },
};

const QUERY_MAP: Record<string, string> = {
    "jwt token flow": "auth/jwt_handler.py",
    "vector search logic": "agents/retriever.py",
    "where are secrets handled": "security/firewall.ts",
    "git branch conflicts": "agents/simulator.py",
    "rate limiting implementation": "services/vector_db.py",
};

const SUGGESTIONS = [
    "JWT token flow",
    "vector search logic",
    "where are secrets handled",
    "git branch conflicts",
    "rate limiting implementation",
];

export default function MemoryDemo() {
    const [activeFile, setActiveFile] = useState("auth/jwt_handler.py");
    const [queryValue, setQueryValue] = useState("");
    const [resultLabel, setResultLabel] = useState("Retriever · Memory Match — auth/jwt_handler.py");
    const [resultText, setResultText] = useState(RESPONSES["auth/jwt_handler.py"].text);
    const [fading, setFading] = useState(false);

    const showResult = (file: string) => {
        setActiveFile(file);
        const response = RESPONSES[file];
        if (response) {
            setFading(true);
            setTimeout(() => {
                setResultLabel(response.label);
                setResultText(response.text);
                setFading(false);
            }, 200);
        }
    };

    const fireQuery = (q: string) => {
        const match = QUERY_MAP[q.toLowerCase().trim()];
        if (match) {
            showResult(match);
        } else {
            setFading(true);
            setTimeout(() => {
                setResultLabel("Retriever · Semantic Search");
                setResultText(
                    `Searching vector store for: "${q}"\n\nRunning cosine similarity search across ${Math.floor(Math.random() * 800) + 200} stored snapshots...\n\nTop result: similarity score 0.${Math.floor(Math.random() * 15) + 80} — context match found in active workspace history.`
                );
                setFading(false);
            }, 300);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16">
            {/* Left: Memory Visualizer */}
            <div className="bg-[#111] border border-white/[0.08] p-8 min-h-[400px] relative overflow-hidden">
                <div className="font-mono text-[11px] text-white/40 tracking-[0.1em] uppercase mb-6 flex justify-between items-center">
                    <span>ChromaDB · User Namespace</span>
                    <span className="flex items-center gap-[6px] text-[#d4d4d4]">
                        <span className="w-[6px] h-[6px] rounded-full bg-[#d4d4d4] animate-pulse" />
                        LIVE
                    </span>
                </div>
                <div className="flex flex-col gap-3">
                    {ENTRIES.map((entry) => (
                        <div
                            key={entry.file}
                            onClick={() => showResult(entry.file)}
                            className={`p-[14px] px-4 border cursor-pointer transition-all relative overflow-hidden ${activeFile === entry.file
                                    ? "border-white/50 bg-white/[0.05]"
                                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                                }`}
                        >
                            <div className="font-mono text-xs text-white mb-1">{entry.file}</div>
                            <div className="text-xs text-white/40 leading-relaxed">{entry.summary}</div>
                            <div className="font-mono text-[10px] text-white/25 mt-[6px] flex gap-4">
                                <span>{entry.branch}</span>
                                <span>{entry.time}</span>
                            </div>
                            {activeFile === entry.file && (
                                <div className="absolute right-[14px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Query Panel */}
            <div className="flex flex-col gap-6">
                <div className="text-[22px] font-bold tracking-[-0.01em] leading-tight">
                    Ask your second cortex anything about your codebase.
                </div>
                <div className="font-mono text-xs text-white/40 leading-[1.7]">
                    Natural language semantic search across your entire development history — not just grep, but meaning.
                </div>

                {/* Query Input */}
                <div className="flex border border-white/[0.08] overflow-hidden focus-within:border-white/50 transition-colors">
                    <input
                        type="text"
                        value={queryValue}
                        onChange={(e) => setQueryValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fireQuery(queryValue)}
                        placeholder="How does authentication work in this project?"
                        className="flex-1 bg-transparent border-none outline-none py-[14px] px-4 font-mono text-[13px] text-white placeholder:text-white/40"
                    />
                    <button
                        onClick={() => fireQuery(queryValue)}
                        className="py-[14px] px-5 bg-white border-none text-[#080808] font-mono text-xs tracking-[0.08em] hover:opacity-85 transition-opacity"
                    >
                        SEARCH
                    </button>
                </div>

                {/* Suggestion Chips */}
                <div>
                    <div className="font-mono text-[11px] text-white/40 tracking-[0.08em] uppercase mb-[10px]">
                        Try asking:
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => {
                                    setQueryValue(s);
                                    fireQuery(s);
                                }}
                                className="py-[6px] px-3 border border-white/[0.08] font-mono text-[11px] text-white/40 hover:border-white/35 hover:text-white hover:bg-white/[0.05] transition-all"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Query Result */}
                <div className="bg-[#111] border border-white/[0.08] p-5 min-h-[80px] font-mono text-xs text-white leading-[1.7] transition-all relative overflow-hidden">
                    <div className="text-[10px] text-white tracking-[0.15em] uppercase mb-3 opacity-70">
                        {resultLabel}
                    </div>
                    <div
                        className={`text-white/40 whitespace-pre-line transition-opacity duration-200 ${fading ? "opacity-0" : "opacity-100"
                            }`}
                    >
                        {resultText}
                    </div>
                </div>
            </div>
        </div>
    );
}
