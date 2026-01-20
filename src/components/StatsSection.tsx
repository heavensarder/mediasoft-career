"use client";

import { useEffect, useState, useRef } from "react";
import { Users, Smile, GraduationCap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Hook for Count Up Animation
function useCountUp(end: number, duration: number = 2000) {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!hasStarted) return;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = timestamp - startTimeRef.current;
            const percentage = Math.min(progress / duration, 1);

            // Easing function (easeOutExpo)
            const easeOut = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

            const currentCount = Math.floor(easeOut(percentage) * end);

            if (countRef.current !== currentCount) {
                countRef.current = currentCount;
                setCount(currentCount);
            }

            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration, hasStarted]);

    return { count, start: () => setHasStarted(true) };
}

interface StatCardProps {
    icon: React.ElementType;
    value: string;
    label: string;
    color: string;
    bg: string;
    delay: number;
}

function StatCard({ icon: Icon, value, label, color, bg, delay }: StatCardProps) {
    // Extract number for animation if possible
    const numValue = parseInt(value.replace(/\D/g, ""));
    const suffix = value.replace(/[0-9]/g, "");
    const { count, start } = useCountUp(isNaN(numValue) ? 0 : numValue);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    start();
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [start]);

    return (
        <div
            ref={ref}
            className={cn(
                "premium-glass-card group relative overflow-hidden text-center hover:scale-105 transition-all duration-500",
                "flex flex-col items-center justify-center gap-4 py-8"
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background Decor */}
            <div className={cn(
                "absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 transition-all duration-700 group-hover:scale-150",
                bg.replace("bg-", "bg-") // Ensure background color usage
            )} />

            <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2 transition-all duration-500 group-hover:rotate-12 shadow-sm",
                bg, color
            )}>
                <Icon className="w-8 h-8" />
            </div>

            <div className="space-y-1 z-10">
                <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 group-hover:from-[#00ADE7] group-hover:to-blue-600 transition-all duration-500">
                        {isNaN(numValue) ? value : `${count}${suffix}`}
                    </span>
                </h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
}

export function StatsSection() {
    const stats = [
        { label: "Female Employee", value: "25%", icon: Users, color: "text-[#00ADE7]", bg: "bg-slate-50" },
        { label: "Friendly Environment", value: "100%", icon: Smile, color: "text-[#00ADE7]", bg: "bg-slate-50" },
        { label: "Learning Opportunities", value: "Unlimited", icon: GraduationCap, color: "text-[#00ADE7]", bg: "bg-slate-50" },
        { label: "Significant Projects", value: "80+", icon: Trophy, color: "text-[#00ADE7]", bg: "bg-slate-50" },
    ];

    return (
        <section className="py-20 bg-slate-50 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((stat, i) => (
                        <StatCard key={i} {...stat} delay={i * 100} />
                    ))}
                </div>
            </div>
        </section>
    );
}
