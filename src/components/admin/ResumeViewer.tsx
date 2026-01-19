"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document, Page, pdfjs } from 'react-pdf';
import { getResumeBase64 } from "@/lib/file-actions";

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ResumeViewerProps {
  url: string;
}

export default function ResumeViewer({ url }: ResumeViewerProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (showPreview && !pdfData && !isLoading) {
      setIsLoading(true);
      getResumeBase64(url)
        .then((data) => {
          if (data) {
            setPdfData(data);
            setLoadError(false);
          } else {
            setLoadError(true);
          }
        })
        .catch(() => setLoadError(true))
        .finally(() => setIsLoading(false));
    }
  }, [showPreview, url, pdfData, isLoading]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  if (!url || !url.toLowerCase().endsWith(".pdf")) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-2">
        <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
        >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? "Hide Preview" : "Preview Resume"}
        </Button>
      </div>

      {showPreview && (
        <div className="w-full border rounded-md overflow-hidden bg-slate-50 flex flex-col items-center p-4 min-h-[500px]">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-10 text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <span>Fetching Secure Preview...</span>
                </div>
            ) : loadError ? (
                <div className="p-10 text-red-500">
                    Failed to load secure preview. 
                    <a href={url} target="_blank" rel="noreferrer" className="block mt-2 underline text-blue-600">
                        Try direct download
                    </a>
                </div>
            ) : (
                <>
                    <Document
                        file={pdfData}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<div className="p-10 text-slate-500">Rendering PDF...</div>}
                        error={<div className="p-10 text-red-500">Error rendering PDF.</div>}
                        className="max-w-full"
                    >
                        <Page 
                            pageNumber={pageNumber} 
                            renderTextLayer={false} 
                            renderAnnotationLayer={false}
                            className="shadow-lg border"
                            width={600}
                        />
                    </Document>
                    
                    {numPages && numPages > 1 && (
                        <div className="flex items-center gap-4 mt-4">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber(prev => prev - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                                Page {pageNumber} of {numPages}
                            </span>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                disabled={pageNumber >= numPages}
                                onClick={() => setPageNumber(prev => prev + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
      )}
    </div>
  );
}
