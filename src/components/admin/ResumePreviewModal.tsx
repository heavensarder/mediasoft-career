"use client";

import { useState, useEffect } from "react";
import { Eye, Loader2, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getResumeBase64 } from "@/lib/file-actions";

// Core Viewer
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface ResumePreviewModalProps {
    url: string;
    applicantName: string;
}

export default function ResumePreviewModal({ url, applicantName }: ResumePreviewModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // Create new plugin instance with sidebar hidden by default
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => [], // Remove all sidebar tabs (thumbnails, etc.) to hide sidebar
        renderToolbar: (Toolbar) => (
            <Toolbar />
        ),
    });

    // 2. Fetch and Convert Data
    useEffect(() => {
        if (isOpen && !blobUrl && !isLoading) {
            setIsLoading(true);
            
            getResumeBase64(url)
                .then((dataURI) => {
                    if (dataURI) {
                        try {
                            const split = dataURI.split(',');
                            const base64 = split[1];
                            const mime = split[0].split(':')[1].split(';')[0];
                            
                            const binaryStr = atob(base64);
                            const len = binaryStr.length;
                            const buffer = new Uint8Array(len);
                            for (let i = 0; i < len; i++) {
                                buffer[i] = binaryStr.charCodeAt(i);
                            }
                            
                            const blob = new Blob([buffer], { type: mime });
                            const objectUrl = URL.createObjectURL(blob);
                            
                            setBlobUrl(objectUrl);
                            setLoadError(false);
                        } catch (err) {
                            console.error("PDF Conversion Error:", err);
                            setLoadError(true);
                        }
                    } else {
                        setLoadError(true);
                    }
                })
                .catch((e) => {
                    console.error("Failed to fetch resume:", e);
                    setLoadError(true);
                })
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, url, blobUrl, isLoading]);
    
    // Explicit cleanup
    useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [blobUrl]);

    if (!url) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="!bg-emerald-500 !text-white hover:!bg-emerald-600 !border-0 !shadow-lg hover:!shadow-xl !transition-all hover:!scale-105 active:!scale-95 !font-bold !px-6 glass-button-filled"
                >
                    <Eye className="mr-2 h-4 w-4" /> Preview Resume
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] flex flex-col p-0 gap-0 bg-slate-50 overflow-hidden border-slate-200 shadow-2xl">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white flex flex-row items-center justify-between shrink-0 z-10">
                    <DialogTitle className="flex items-center gap-3 text-slate-800">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                            <Eye className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <span className="block font-bold text-lg leading-none">{applicantName}</span>
                            <span className="text-xs text-slate-400 font-normal uppercase tracking-wider">Resume Preview</span>
                        </div>
                    </DialogTitle>
                     {/* Standard Download as backup */}
                     <a href={url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="text-slate-600 gap-2 h-8">
                            <Download className="h-3.5 w-3.5" /> Direct Download
                        </Button>
                    </a>
                </DialogHeader>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden bg-slate-200 relative w-full h-full">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center text-slate-500 my-auto">
                            <Loader2 className="h-12 w-12 animate-spin mb-4 text-emerald-500" />
                            <span className="font-bold text-lg text-slate-700 animate-pulse">Loading Document...</span>
                            <span className="text-sm text-slate-400 mt-2">Fetching secure preview</span>
                        </div>
                    ) : loadError ? (
                        <div className="flex flex-col items-center justify-center text-center my-auto">
                            <div className="bg-red-50 p-6 rounded-full mb-6">
                                <X className="h-10 w-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Preview Unavailable</h3>
                            <p className="text-slate-500 max-w-sm mb-6 px-4">
                                The document could not be rendered directly.
                            </p>
                            <a href={url} target="_blank" rel="noreferrer">
                                <Button className="bg-emerald-500 text-white hover:bg-emerald-600 px-8 py-6 text-lg">
                                    <Download className="mr-2 h-5 w-5" /> Download to View
                                </Button>
                            </a>
                        </div>
                    ) : (
                        <div className="h-full w-full relative bg-slate-200">
                             {blobUrl && (
                                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                    <div style={{ 
                                        height: '100%', 
                                        width: '100%',
                                        marginLeft: 'auto',
                                        marginRight: 'auto',
                                    }}>
                                        <Viewer
                                            fileUrl={blobUrl}
                                            plugins={[defaultLayoutPluginInstance]}
                                            defaultScale={SpecialZoomLevel.PageWidth}
                                            theme={{
                                                theme: 'light',
                                            }}
                                        />
                                    </div>
                                </Worker>
                             )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
