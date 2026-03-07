"use client";
import { motion, useMotionValue } from "framer-motion";

export default function InteractiveLogo() {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const offsetX = e.clientX - window.innerWidth / 2;
        const offsetY = e.clientY - window.innerHeight / 2;
        x.set(offsetX / 12);
        y.set(offsetY / 12);
    };

    return (
        <div
            className="min-h-screen bg-white text-black flex flex-col justify-center items-center relative z-20 cursor-none"
            onMouseMove={handleMouseMove}
        >
            {/* Interactive SC logo shape */}
            <motion.div
                style={{ x, y }}
                className="relative mb-8"
            >
                <svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Outer hexagon */}
                    <motion.path
                        d="M100 10 L180 55 L180 145 L100 190 L20 145 L20 55 Z"
                        stroke="black"
                        strokeWidth="2"
                        fill="none"
                        style={{ x: useMotionValue(0), y: useMotionValue(0) }}
                    />
                    {/* Inner geometry — S shape abstraction */}
                    <motion.path
                        d="M70 70 Q100 60 120 80 Q140 100 100 110 Q60 120 80 140 Q100 155 130 130"
                        stroke="black"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        style={{ x: useMotionValue(0), y: useMotionValue(0) }}
                    />
                    {/* C shape */}
                    <motion.circle
                        cx="100"
                        cy="100"
                        r="50"
                        stroke="black"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="220 94"
                        strokeDashoffset="47"
                        strokeLinecap="round"
                    />
                    {/* Dot */}
                    <circle cx="100" cy="100" r="4" fill="black" />
                </svg>
            </motion.div>

            <motion.h2
                style={{ x: useMotionValue(0), y: useMotionValue(0) }}
                className="text-5xl md:text-7xl font-serif tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                SecondCortex
            </motion.h2>

            <motion.p
                className="mt-4 text-sm tracking-[0.3em] uppercase text-gray-500"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                Your AI-Powered Development Companion
            </motion.p>
        </div>
    );
}
