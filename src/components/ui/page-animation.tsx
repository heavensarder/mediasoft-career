"use client";

import { motion } from "framer-motion";

interface PageAnimationProps {
    children: React.ReactNode;
    className?: string;
}

export default function PageAnimation({ children, className = "" }: PageAnimationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for "apple-like" smoothness
            }}
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    );
}
