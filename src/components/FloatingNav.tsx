"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Briefcase, Home, Users, Heart, Menu, FileText, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ... imports ...

interface FloatingNavProps {
  logoPath?: string | null;
}

export function FloatingNav({ logoPath }: FloatingNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    { name: "Blog", href: "https://mediasoftbd.com/blog/", icon: FileText, external: true },
    { name: "Contact Us", href: "https://mediasoftbd.com/contact-us-mediasoft-data-systems-for-best-point-of-sale-software/", icon: MessageSquare, external: true },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("http")) return; // Let external links just work naturally
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
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
          "w-full max-w-6xl flex items-center justify-between p-2 rounded-full transition-all duration-300 border", // Increased max-width for more items
          "bg-white shadow-md border-gray-200/50"
        )}
      >
        {/* Logo */}
        <div className="pl-4 pr-2">
          <Link href="/" onClick={(e) => handleScrollTo(e, "#hero")}>
            <Image
              src={logoPath || "https://mediasoftbd.com/wp-content/uploads/2025/06/mediasoft-logo.png"}
              alt="Company Logo"
              width={140}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Nav Items - Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              asChild
              className="rounded-full px-5 text-slate-600 hover:text-white hover:bg-[#00ADE7] transition-all text-sm font-bold cursor-pointer"
            >
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={(e) => !item.external && handleScrollTo(e, item.href)}
              >
                {item.name}
              </Link>
            </Button>
          ))}
        </div>

        {/* Call to Action (Desktop Only) */}
        <div className="pl-2 pr-1 hidden md:block">
          <Button
            size="sm"
            asChild
            className="
                !rounded-full 
                !bg-gradient-to-r from-[#00ADE7] to-[#0066ff] 
                hover:from-[#0095c8] hover:to-[#0052cc]
                !text-white 
                !border-none
                shadow-lg shadow-blue-500/30 
                hover:shadow-blue-500/50 
                transition-all duration-300 
                hover:scale-105 
                px-6 h-10 font-bold tracking-wide
                cursor-pointer
              "
          >
            <Link
              href="#open-positions"
              onClick={(e) => handleScrollTo(e, "#open-positions")}
            >
              Apply Now
            </Link>
          </Button>
        </div>



        {/* Mobile Menu Toggle (Right Aligned) */}
        <div className="md:hidden flex items-center">
          {isMounted ? (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-full hover:bg-slate-100/50 transition-all active:scale-95 group"
                >
                  <div className="flex flex-col gap-1.5 items-end justify-center w-6">
                    <span className="block h-0.5 w-6 bg-slate-800 rounded-full transition-all group-hover:w-4 group-hover:bg-[#00ADE7]"></span>
                    <span className="block h-0.5 w-4 bg-slate-800 rounded-full transition-all group-hover:w-6 group-hover:bg-[#00ADE7]"></span>
                    <span className="block h-0.5 w-5 bg-slate-800 rounded-full transition-all group-hover:w-3 group-hover:bg-[#00ADE7]"></span>
                  </div>
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:w-[400px] border-l border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl p-0"
              >
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative flex flex-col h-full z-10">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <Image
                      src={logoPath || "https://mediasoftbd.com/wp-content/uploads/2025/06/mediasoft-logo.png"}
                      alt="Company Logo"
                      width={130}
                      height={38}
                      className="h-8 w-auto object-contain"
                    />
                    {/* Close button is handled by SheetPrimitive.Close in sheet.tsx */}
                  </div>

                  {/* Menu Items */}
                  <div className="flex-1 flex flex-col justify-center px-6 gap-2">
                    {navItems.map((item, index) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        onClick={(e) => !item.external && handleScrollTo(e, item.href)}
                        className="group block"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div
                          className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-slate-50 border border-transparent hover:border-slate-100 group-hover:shadow-sm"
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-[#E0F7FF] group-hover:text-[#00ADE7]">
                            <item.icon className="h-6 w-6" />
                          </div>
                          <span className="text-xl font-bold text-slate-700 group-hover:text-[#00ADE7] transition-colors">
                            {item.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Footer CTA */}
                  <div className="p-6 bg-slate-50/50 backdrop-blur-sm border-t border-slate-100">
                    <p className="text-center text-sm text-slate-400 mb-4 font-medium">Ready to start your journey?</p>
                    <Button
                      asChild
                      className="w-full !rounded-xl !bg-gradient-to-r from-[#00ADE7] to-blue-500 !text-white !border-none shadow-lg shadow-blue-500/25 h-14 text-lg font-bold hover:shadow-blue-500/40 hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <Link
                        href="#open-positions"
                        onClick={(e) => handleScrollTo(e, "#open-positions")}
                      >
                        Apply Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full hover:bg-slate-100/50 transition-all active:scale-95 group"
            >
              <div className="flex flex-col gap-1.5 items-end justify-center w-6">
                <span className="block h-0.5 w-6 bg-slate-800 rounded-full transition-all group-hover:w-4 group-hover:bg-[#00ADE7]"></span>
                <span className="block h-0.5 w-4 bg-slate-800 rounded-full transition-all group-hover:w-6 group-hover:bg-[#00ADE7]"></span>
                <span className="block h-0.5 w-5 bg-slate-800 rounded-full transition-all group-hover:w-3 group-hover:bg-[#00ADE7]"></span>
              </div>
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
}
