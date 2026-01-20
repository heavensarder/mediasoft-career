"use client";

import { Trophy, Zap, Users, Award, Monitor, GraduationCap, Globe, Heart, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface BenefitCardProps {
    title: string;
    desc: string;
    icon: React.ElementType;
    delay: number;
}

function BenefitCard({ title, desc, icon: Icon, delay }: BenefitCardProps) {
    return (
        <div
            className="group relative p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110" />

            <div className="flex items-start gap-4 relative z-10">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 flex items-center justify-center text-[#00ADE7] shadow-sm transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#00ADE7] transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        {desc}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function BenefitsSection() {
    const benefits = [
        {
            title: "Career Growth",
            desc: "Advance your career with numerous opportunities for professional development and growth within Mediasoft.",
            icon: Trophy
        },
        {
            title: "Innovative Projects",
            desc: "Engage in cutting-edge projects that push the boundaries of technology and innovation.",
            icon: Zap
        },
        {
            title: "Collaborative Culture",
            desc: "Join a supportive team environment that values collaboration, creativity, and mutual respect.",
            icon: Users
        },
        {
            title: "Competitive Compensation",
            desc: "Benefit from attractive salary packages, performance bonuses, and comprehensive benefits.",
            icon: Award
        },
        {
            title: "Flexible Work Environment",
            desc: "Enjoy flexible working hours and remote work options to maintain a healthy work-life balance.",
            icon: Monitor
        },
        {
            title: "Continuous Learning",
            desc: "Access to extensive training programs, workshops, and mentorship to enhance your skills and knowledge.",
            icon: GraduationCap
        },
        {
            title: "Impactful Work",
            desc: "Make a real difference by contributing to projects that have a significant impact on our clients and the industry.",
            icon: Globe
        },
        {
            title: "Inclusive Culture",
            desc: "Be part of a diverse and inclusive workplace where all employees are valued and respected.",
            icon: Heart
        },
        {
            title: "Employee Wellbeing",
            desc: "Participate in health and wellness programs designed to support your overall wellbeing.",
            icon: Smile
        },
    ];

    return (
        <section id="values" className="py-24 bg-white relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-[80px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-sm font-bold text-[#00ADE7] tracking-widest uppercase mb-3">Why Join MediaSoft?</h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                        Growth, Innovation, and <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ADE7] to-blue-600"> Endless Possibilities</span>
                    </h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        We offer more than just a job. We offer a career path filled with meaningful work,
                        great people, and a culture that celebrates success.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((item, i) => (
                        <BenefitCard key={i} {...item} delay={i * 50} />
                    ))}
                </div>
            </div>
        </section>
    );
}
