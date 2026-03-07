"use client";
import { motion } from "framer-motion";

interface FadeInSectionProps {
    children: React.ReactNode;
    className?: string;
}

export default function FadeInSection({ children, className = "" }: FadeInSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`min-h-screen flex flex-col justify-center items-center text-center px-6 z-10 relative ${className}`}
        >
            {children}
        </motion.div>
    );
}
