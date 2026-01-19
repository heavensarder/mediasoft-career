"use client";

import dynamic from "next/dynamic";

const ResumeViewer = dynamic(() => import("./ResumeViewer"), {
  ssr: false,
  loading: () => <p className="text-sm text-gray-500">Loading preview...</p>,
});

export default function ResumeViewerWrapper({ url }: { url: string }) {
  return <ResumeViewer url={url} />;
}
