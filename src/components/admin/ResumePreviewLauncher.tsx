"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const ResumePreviewModal = dynamic(() => import("./ResumePreviewModal"), {
  ssr: false,
  loading: () => (
    <Button 
        variant="ghost" 
        size="sm" 
        disabled 
        className="!bg-emerald-500/50 !text-white/80 !border-0 glass-button-filled"
    >
        <Eye className="mr-2 h-4 w-4" /> Preview
    </Button>
  ),
});

interface ResumePreviewLauncherProps {
  url: string;
  applicantName: string;
}

export default function ResumePreviewLauncher(props: ResumePreviewLauncherProps) {
  return <ResumePreviewModal {...props} />;
}
