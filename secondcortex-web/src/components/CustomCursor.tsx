"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener("mousemove", updateMousePosition);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, [isVisible]);

    return (
        <motion.div
            className="fixed top-0 left-0 w-6 h-6 bg-white mix-blend-difference z-[9999] pointer-events-none"
            animate={{
                x: mousePosition.x - 12,
                y: mousePosition.y - 12,
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.5,
            }}
            transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
        />
    );
}
