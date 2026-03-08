"use client";

const ITEMS = [
    "Planner Agent",
    "Retriever Agent",
    "Executor Agent",
    "Simulator Sub-Agent",
    "ChromaDB Vector Store",
    "MCP Server",
    "Semantic Firewall",
    "Shadow Graph",
    "JWT Auth",
    "Azure Deployment",
    "FastAPI Backend",
    "GPT-4o",
    "Groq / Llama-3.1",
];

export default function Ticker() {
    // Double items for seamless loop
    const allItems = [...ITEMS, ...ITEMS];

    return (
        <div className="border-t border-b border-white/[0.08] overflow-hidden py-[14px] bg-white/[0.01]">
            <div className="flex whitespace-nowrap animate-ticker">
                {allItems.map((item, i) => (
                    <span
                        key={i}
                        className="font-mono text-[11px] text-white/40 tracking-[0.1em] uppercase px-10 flex items-center gap-4"
                    >
                        {item}
                        <span className="text-white text-[8px]">◆</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
