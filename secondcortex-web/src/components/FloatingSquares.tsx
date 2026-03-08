"use client";
import { motion, useScroll, useTransform } from "framer-motion";

const squares = [
    { top: "10%", left: "8%", size: "w-3 h-3", speed: [-400] as [number], opacity: 0.4 },
    { top: "25%", left: "85%", size: "w-5 h-5", speed: [-700] as [number], opacity: 0.3 },
    { top: "45%", left: "15%", size: "w-8 h-8", speed: [-500] as [number], opacity: 0.15 },
    { top: "60%", right: "12%", size: "w-4 h-4", speed: [-900] as [number], opacity: 0.25 },
    { top: "75%", left: "45%", size: "w-6 h-6", speed: [-350] as [number], opacity: 0.2 },
    { top: "35%", left: "55%", size: "w-2 h-2", speed: [-600] as [number], opacity: 0.35 },
    { top: "85%", left: "75%", size: "w-10 h-10", speed: [-450] as [number], opacity: 0.1 },
    { top: "15%", left: "40%", size: "w-4 h-4", speed: [-800] as [number], opacity: 0.2 },
];

const technicalTerms = [
    { text: "signal", top: "20%", left: "15%", speed: [-300] as [number] },
    { text: "context", top: "40%", right: "20%", speed: [-500] as [number] },
    { text: "structure", top: "60%", left: "10%", speed: [-400] as [number] },
    { text: "reasoning", top: "15%", right: "10%", speed: [-600] as [number] },
    { text: "state", top: "80%", left: "30%", speed: [-250] as [number] },
    { text: "relation", top: "45%", right: "40%", speed: [-450] as [number] },
    { text: "temporal", top: "70%", right: "15%", speed: [-550] as [number] },
];

function FloatingElement({
    children,
    style,
    speed,
}: {
    children: React.ReactNode;
    style: React.CSSProperties;
    speed: [number];
}) {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, speed[0]]);

    return (
        <motion.div
            style={{ ...style, y }}
            className="absolute"
        >
            {children}
        </motion.div>
    );
}

export default function FloatingSquares() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Background Squares */}
            {squares.map((sq, i) => (
                <FloatingElement
                    key={`sq-${i}`}
                    style={{
                        top: sq.top,
                        left: sq.left,
                        right: (sq as any).right,
                        opacity: sq.opacity,
                    }}
                    speed={sq.speed}
                >
                    <div className={`bg-white/80 ${sq.size}`} />
                </FloatingElement>
            ))}

            {/* Technical Typography Layer */}
            {technicalTerms.map((term, i) => (
                <FloatingElement
                    key={`term-${i}`}
                    style={{
                        top: term.top,
                        left: term.left,
                        right: (term as any).right,
                        opacity: 0.07, // Low contrast for mystery/premium feel
                    }}
                    speed={term.speed}
                >
                    <span className="text-[10px] uppercase tracking-[0.5em] font-mono text-white whitespace-nowrap">
                        {term.text}
                    </span>
                </FloatingElement>
            ))}
        </div>
    );
}
