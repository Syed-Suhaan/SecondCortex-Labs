"use client";
import { useEffect, useRef } from "react";

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const ring = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };

        const animate = () => {
            if (dotRef.current) {
                dotRef.current.style.left = `${mouse.current.x}px`;
                dotRef.current.style.top = `${mouse.current.y}px`;
            }
            ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
            ring.current.y += (mouse.current.y - ring.current.y) * 0.15;
            if (ringRef.current) {
                ringRef.current.style.left = `${ring.current.x}px`;
                ringRef.current.style.top = `${ring.current.y}px`;
            }
            requestAnimationFrame(animate);
        };

        // Hover expansion for interactive elements
        const addHoverListeners = () => {
            document
                .querySelectorAll("button, a, .mem-entry, .suggestion-chip, .agent-card, input")
                .forEach((el) => {
                    el.addEventListener("mouseenter", () => {
                        if (dotRef.current) {
                            dotRef.current.style.width = "20px";
                            dotRef.current.style.height = "20px";
                        }
                        if (ringRef.current) {
                            ringRef.current.style.width = "52px";
                            ringRef.current.style.height = "52px";
                            ringRef.current.style.borderColor = "rgba(255,255,255,0.7)";
                        }
                    });
                    el.addEventListener("mouseleave", () => {
                        if (dotRef.current) {
                            dotRef.current.style.width = "12px";
                            dotRef.current.style.height = "12px";
                        }
                        if (ringRef.current) {
                            ringRef.current.style.width = "36px";
                            ringRef.current.style.height = "36px";
                            ringRef.current.style.borderColor = "rgba(255,255,255,0.4)";
                        }
                    });
                });
        };

        document.addEventListener("mousemove", onMove);
        animate();

        // Delay to let DOM render
        const timer = setTimeout(addHoverListeners, 1000);

        return () => {
            document.removeEventListener("mousemove", onMove);
            clearTimeout(timer);
        };
    }, []);

    return (
        <>
            {/* Dot */}
            <div
                ref={dotRef}
                className="fixed pointer-events-none z-[9999]"
                style={{
                    width: 12,
                    height: 12,
                    background: "#fff",
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    transition: "width 0.2s, height 0.2s, background 0.2s",
                    mixBlendMode: "screen",
                }}
            />
            {/* Ring */}
            <div
                ref={ringRef}
                className="fixed pointer-events-none z-[9998]"
                style={{
                    width: 36,
                    height: 36,
                    border: "1px solid rgba(255,255,255,0.4)",
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    transition: "all 0.12s ease",
                }}
            />
        </>
    );
}
