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

function FloatingSquare({
    style,
    className,
    speed,
}: {
    style: React.CSSProperties;
    className: string;
    speed: [number];
}) {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, speed[0]]);

    return (
        <motion.div
            style={{ ...style, y }}
            className={`absolute bg-white/80 ${className}`}
        />
    );
}

export default function FloatingSquares() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {squares.map((sq, i) => (
                <FloatingSquare
                    key={i}
                    style={{
                        top: sq.top,
                        left: sq.left,
                        right: (sq as Record<string, unknown>).right as string | undefined,
                        opacity: sq.opacity,
                    }}
                    className={sq.size}
                    speed={sq.speed}
                />
            ))}
        </div>
    );
}
