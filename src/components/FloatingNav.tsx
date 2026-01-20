"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Briefcase, Home, Users, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingNav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "#hero", icon: Home },
    { name: "Positions", href: "#open-positions", icon: Briefcase },
    { name: "Values", href: "#values", icon: Heart },
    { name: "Culture", href: "#culture", icon: Users },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-center px-4",
        isScrolled ? "py-4" : "py-6"
      )}
    >
      <nav
        className={cn(
          "w-full max-w-5xl flex items-center justify-between p-2 rounded-full transition-all duration-300 border",
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-lg border-white/20"
            : "bg-white/60 backdrop-blur-sm border-white/10"
        )}
      >
        {/* Logo */}
        <div className="pl-4 pr-2">
            <Link href="/" onClick={(e) => handleScrollTo(e, "#hero")}>
                <Image 
                    src="https://mediasoftbd.com/wp-content/uploads/2025/06/mediasoft-logo.png"
                    alt="MediaSoft Data Systems"
                    width={140}
                    height={40}
                    className="h-8 w-auto object-contain"
                />
            </Link>
        </div>

        {/* Nav Items - Desktop */}
        <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
            <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleScrollTo(e, item.href)}
                className="group"
            >
                <Button
                variant="ghost"
                size="sm"
                className="rounded-full px-3 text-slate-600 hover:text-[#00ADE7] hover:bg-slate-50/50 transition-all text-sm font-medium"
                >
                {item.name}
                </Button>
            </Link>
            ))}
        </div>
        
        {/* Call to Action */}
        <div className="pl-2 pr-1">
            <Link 
                href="#open-positions" 
                onClick={(e) => handleScrollTo(e, "#open-positions")}
            >
            <Button 
                size="sm"
                className="rounded-full bg-[#00ADE7] hover:bg-[#0095c8] text-white shadow-md transition-all px-6 h-9"
            >
                Apply Now
            </Button>
            </Link>
        </div>
      </nav>
    </div>
  );
}
