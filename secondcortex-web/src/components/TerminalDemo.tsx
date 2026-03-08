"use client";
import { useEffect, useRef, useState } from "react";

interface TermLine {
    type: "cmd" | "out" | "highlight" | "warn" | "success";
    prompt?: string;
    text: string;
}

const TERMINAL_LINES: TermLine[] = [
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

const TYPE_COLORS: Record<string, string> = {
    out: "text-white/40",
    highlight: "text-white",
    warn: "text-[#a0a0a0]",
    success: "text-[#d4d4d4]",
};

export default function TerminalDemo() {
    const [renderedLines, setRenderedLines] = useState<
        Array<{ html: string; className: string }>
    >([]);
    const lineIdx = useRef(0);
    const bodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timeout = setTimeout(() => typeNext(), 1800);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const typeNext = () => {
        if (lineIdx.current >= TERMINAL_LINES.length) return;
        const line = TERMINAL_LINES[lineIdx.current];

        if (line.type === "cmd") {
            // Typewriter effect for commands
            let charIdx = 0;
            const id = `tl-${lineIdx.current}`;
            setRenderedLines((prev) => [
                ...prev,
                {
                    html: `<span class="text-[#d4d4d4] select-none">${line.prompt} $</span> <span id="${id}"></span>`,
                    className: "flex gap-[10px]",
                },
            ]);

            const interval = setInterval(() => {
                charIdx++;
                const span = document.getElementById(id);
                if (span) span.textContent = line.text.slice(0, charIdx);
                if (charIdx >= line.text.length) {
                    clearInterval(interval);
                    lineIdx.current++;
                    setTimeout(typeNext, 400);
                }
            }, 30);
        } else {
            setRenderedLines((prev) => [
                ...prev,
                {
                    html: line.text,
                    className: `pl-5 ${TYPE_COLORS[line.type] || "text-white/40"}`,
                },
            ]);
            lineIdx.current++;
            setTimeout(typeNext, 120);
        }

        // Auto-scroll
        setTimeout(() => {
            if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }, 50);
    };

    return (
        <div className="w-[480px] max-w-full">
            <div
                className="rounded-lg overflow-hidden border border-white/[0.08]"
                style={{
                    background: "rgba(14,14,14,0.98)",
                    boxShadow:
                        "0 40px 120px rgba(0,0,0,0.9), 0 0 60px rgba(255,255,255,0.02)",
                }}
            >
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/[0.08]">
                    <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f56]" />
                    <div className="w-[10px] h-[10px] rounded-full bg-[#ffbd2e]" />
                    <div className="w-[10px] h-[10px] rounded-full bg-[#27c93f]" />
                    <span className="ml-2 font-mono text-[11px] text-white/40">
                        cortex — secondcortex-backend
                    </span>
                </div>
                {/* Body */}
                <div
                    ref={bodyRef}
                    className="p-5 font-mono text-xs leading-[1.8] min-h-[300px] max-h-[350px] overflow-y-auto"
                >
                    {renderedLines.map((line, i) => (
                        <div
                            key={i}
                            className={line.className}
                            dangerouslySetInnerHTML={{ __html: line.html }}
                        />
                    ))}
                    <span className="inline-block w-2 h-[14px] bg-white align-text-bottom ml-[2px] animate-pulse" />
                </div>
            </div>
        </div>
    );
}
