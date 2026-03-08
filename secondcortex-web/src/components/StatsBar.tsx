"use client";
import { useEffect, useRef, useState } from "react";

interface Stat {
    target: number | null;
    label: string;
    suffix?: string;
    staticText?: string;
}

const STATS: Stat[] = [
    { target: 3, label: "Core Agents" },
    { target: 1536, label: "Embedding Dimensions" },
    { target: 11, label: "Technical Pivots Shipped" },
    { target: null, label: "Context Retrieval", staticText: "~sub-second" },
];

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [value, setValue] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const animated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !animated.current) {
                    animated.current = true;
                    const duration = 1600;
                    const start = performance.now();

                    const step = (ts: number) => {
                        const progress = Math.min((ts - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setValue(Math.round(eased * target));
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [target]);

    return (
        <div ref={ref} className="text-5xl font-extrabold text-white leading-none mb-2 tabular-nums">
            {value}{suffix}
        </div>
    );
}

export default function StatsBar() {
    return (
        <div className="relative z-[2] flex border-t border-b border-white/[0.08] overflow-hidden">
            {STATS.map((stat, i) => (
                <div
                    key={i}
                    className="flex-1 py-8 px-10 border-r border-white/[0.08] last:border-r-0 relative overflow-hidden transition-colors hover:bg-white/[0.02]"
                >
                    {stat.target !== null ? (
                        <AnimatedNumber target={stat.target} suffix={stat.suffix} />
                    ) : (
                        <div className="text-5xl font-extrabold text-white leading-none mb-2">
                            {stat.staticText}
                        </div>
                    )}
                    <div className="font-mono text-[11px] text-white/40 tracking-[0.12em] uppercase">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
