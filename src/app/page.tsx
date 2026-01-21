import Link from "next/link";
import { getActiveJobs } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Heart,
  Zap,
  GraduationCap,
  Trophy,
  Smile,
  Globe,
  Monitor,
  Award,
  ChevronRight,
  Briefcase
} from "lucide-react";
import Image from "next/image";
import { FloatingNav } from "@/components/FloatingNav";
import { getBrandingSettings } from "@/lib/settings-actions";
import { JobList } from "@/components/JobList";
import { StatsSection } from "@/components/StatsSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ImageSliderSection } from "@/components/home/ImageSliderSection";

import { Metadata } from 'next';
import { getPageSeo } from '@/lib/seo-actions';

export async function generateMetadata(): Promise<Metadata> {
  const [seo, branding] = await Promise.all([
    getPageSeo('home'),
    getBrandingSettings()
  ]);

  return {
    title: seo?.title || "Home - MediaSoft Career",
    description: seo?.description || "Find your dream job at MediaSoft.",
    keywords: seo?.keywords?.split(',').map((k: string) => k.trim()) || [],
    openGraph: {
       images: seo?.ogImage ? [{ url: seo.ogImage }] : (branding.logoPath ? [{ url: branding.logoPath }] : []),
    }
  };
}

export default async function Home() {
  const jobs = await getActiveJobs();
  const settings = await getBrandingSettings();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#00ADE7]/20">
      <FloatingNav logoPath={settings.logoPath} logoRedirectUrl={settings.logoRedirectUrl} />
      {/* 1. Hero Section - Light & Airy */}
      <section id="hero" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://i.postimg.cc/Zq0mccxw/career-hero-background.webp"
            alt="MediaSoft Office"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <Badge className="mb-6 bg-white text-black border-none px-4 py-1.5 text-sm font-semibold uppercase tracking-wider shadow-sm flex items-center gap-2 mx-auto w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            We are Hiring
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-8 tracking-tight">
            Build the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ADE7] to-blue-400">
              Future
            </span>{" "}
            With Us
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Join a team of visionaries, creators, and innovators. We are
            crafting the next generation of digital experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="#open-positions"
              className="
      h-14 px-10 text-md rounded-full 
      bg-gradient-to-r from-[#00ADE7] to-[#0066ff]
      text-white font-bold tracking-wide 
      hover:from-[#0095c8] hover:to-[#0052cc]
      transition-all duration-300 
      shadow-lg shadow-blue-500/30 
      hover:scale-105 hover:shadow-blue-500/50
      flex items-center justify-center
    "
            >
              View Open Positions
            </Link>
          </div>


        </div>
      </section>

      {/* 2. Active Job List Section */}
      <section id="open-positions" className="py-24 bg-slate-50 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Ready to take the next step in your career? Browse our current
              openings and find the perfect fit for your skills.
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm p-16 rounded-3xl text-center borderBorder border-dashed border-slate-300 max-w-2xl mx-auto">
              <div className="mb-6 bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Briefcase className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                No Openings Right Now
              </h3>
              <p className="text-slate-500 text-lg">
                We are not actively hiring for any roles at the moment. However,
                we are always looking for talent. Feel free to send us your
                resume!
              </p>
            </div>
          ) : (
            <JobList jobs={jobs} />
          )}
        </div>
      </section>

      {/* 3. New Stats Section */}
      <StatsSection />

      {/* 4. Image Slider Section */}
      <ImageSliderSection />

      {/* 4. Video Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-slate-900 z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ADE7]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="mb-6 bg-slate-800 text-[#00ADE7] border-slate-700 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider">
            Life at MediaSoft
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-8">See What It's Like</h2>

          <div className="max-w-4xl mx-auto aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 relative bg-black">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/A5hUTPU5EXo"
              title="Life at MediaSoft"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>
      </section>

      {/* 5. Benefits / Values Section */}
      <BenefitsSection />

      {/* 6. Culture Content Section */}
      <section id="culture" className="py-24 bg-slate-50 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://i.postimg.cc/ZqJBK1Zy/career-section-img.webp"
                  alt="Team Collaboration"
                  width={800}
                  height={600}
                  className="w-full object-cover"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs animate-bounce md:animate-none">
                <div className="bg-[#E0F7FF] p-3 rounded-full">
                  <Users className="w-6 h-6 text-[#00ADE7]" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Join our community
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    100+ Team Members
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">
                Our Culture
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                More Than Just a <br className="hidden md:block" />
                <span className="text-[#00ADE7]">Workplace</span>
              </h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                At our company, we don't just write code; we create solutions.
                Our culture is built on trust, autonomy, and a shared passion
                for excellence. We provide the tools you need to succeed and the
                freedom to innovate.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Continuous Learning & Development",
                  "Inclusive & Diverse Team",
                  "Regular Team Retreats & Events",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-slate-700 font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#E0F7FF] flex items-center justify-center shrink-0">
                      <ChevronRight className="w-4 h-4 text-[#00ADE7]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="border-[#00ADE7] text-[#00ADE7] hover:bg-[#E0F7FF] hover:text-[#00ADE7] h-12 px-8 rounded-full"
                asChild
              >
                <Link href="https://mediasoftbd.com/about-us/" target="_blank" rel="noopener noreferrer">
                  Learn More About Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* 7. Copyright Footer */}
      <footer className="bg-black py-8 text-center text-white/50 text-sm">
        <div className="container mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} <a href="https://www.mediasoftbd.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#00ADE7] transition-colors">Mediasoft Data Systems Limited</a>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
