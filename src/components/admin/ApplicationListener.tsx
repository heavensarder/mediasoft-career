"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";

export default function ApplicationListener() {
  const router = useRouter();
  const [lastLatestId, setLastLatestId] = useState<number | null>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    async function checkNewApplications() {
      try {
        const res = await fetch("/api/admin/applications/check-new");
        if (!res.ok) return;

        const data = await res.json();
        
        // Initial load: just set the ID, don't notify
        if (isFirstRun.current) {
          setLastLatestId(data.latestId);
          isFirstRun.current = false;
          return;
        }

        // Subsequent checks: if ID changed and is greater, notify
        if (lastLatestId !== null && data.latestId > lastLatestId) {
          setLastLatestId(data.latestId);
          
          toast.custom((t) => (
            <div className="w-full flex items-start gap-4 p-4 bg-white/90 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              {/* Decorative Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ADE7]/10 via-transparent to-purple-500/5 z-0 pointer-events-none" />
              
              {/* Animated Icon Container */}
              <div className="relative z-10 flex-shrink-0">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#00ADE7] to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Briefcase className="h-6 w-6 text-white animate-[bounce_2s_infinite]" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex-grow pt-0.5 min-w-0">
                <h4 className="font-bold text-slate-900 text-base leading-none mb-1.5 font-plus-jakarta">New Application!</h4>
                <p className="text-slate-600 text-sm font-medium leading-tight mb-3 truncate">
                  <span className="text-slate-900 font-bold">{data.latestName}</span> just applied.
                </p>
                <div className="flex gap-2">
                   <button 
                     onClick={() => {
                       router.push(`/admin/dashboard/job-recruitment/applications/${data.latestId}`);
                       toast.dismiss(t);
                     }}
                     className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-slate-800 transition-colors shadow-md active:scale-95 transform"
                   >
                     View Details
                   </button>
                   <button 
                     onClick={() => toast.dismiss(t)} 
                     className="text-slate-500 hover:text-slate-700 text-xs font-bold px-3 py-2 transition-colors"
                   >
                     Dismiss
                   </button>
                </div>
              </div>

              {/* Close Button (X) */}
              <button 
                onClick={() => toast.dismiss(t)}
                className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-500 transition-colors z-20"
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          ), {
            duration: 8000, 
            position: 'top-center',
          });
          
          router.refresh(); 
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }

    // Check immediately on mount (or rely on interval)
    checkNewApplications();

    // Poll every 30 seconds
    const interval = setInterval(checkNewApplications, 30000);

    return () => clearInterval(interval);
  }, [lastLatestId, router]);

  return null; 
}
