"use client";
import { Button } from "@/components/ui/button";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

export default function StickyFooter() {
    const { scrollYProgress } = useScroll();
    const [progress, setProgress] = useState(0);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        setProgress(Math.round(latest * 100));
    });

    return (
        <div className="fixed bottom-0 left-0 w-full p-5 px-8 flex justify-between items-center text-xs tracking-[0.2em] uppercase text-white mix-blend-difference z-50">
            <div className="hidden md:block font-mono opacity-70">
                SecondCortex • v2.0
            </div>
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    className="rounded-full bg-white text-black hover:bg-gray-200 border-none px-5 text-[11px] tracking-widest cursor-none"
                >
                    Get Started
                </Button>
                <Button
                    variant="outline"
                    className="rounded-full bg-white text-black hover:bg-gray-200 border-none px-5 text-[11px] tracking-widest cursor-none"
                >
                    Documentation
                </Button>
            </div>
            <div className="hidden md:block font-mono opacity-70">
                {progress}%
            </div>
        </div>
    );
}
