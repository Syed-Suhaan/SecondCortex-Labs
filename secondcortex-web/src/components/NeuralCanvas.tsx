"use client";
import { useEffect, useRef } from "react";

interface CanvasNode {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
}

export default function NeuralCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<CanvasNode[]>([]);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Initialize nodes
        if (nodesRef.current.length === 0) {
            for (let i = 0; i < 60; i++) {
                nodesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: Math.random() * 2 + 1,
                });
            }
        }

        const draw = () => {
            const nodes = nodesRef.current;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            nodes.forEach((n) => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255,255,255,0.35)";
                ctx.fill();
            });

            // Draw connection lines
            nodes.forEach((a, i) => {
                nodes.slice(i + 1).forEach((b) => {
                    const d = Math.hypot(a.x - b.x, a.y - b.y);
                    if (d < 120) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(255,255,255,${0.1 * (1 - d / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            animRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 w-full h-full"
            style={{ opacity: 0.6 }}
        />
    );
}
