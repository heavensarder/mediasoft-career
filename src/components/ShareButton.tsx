'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ShareButton({ title, url: propUrl }: { title: string, url?: string }) {
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleShare = async () => {
        let url = propUrl || window.location.href;
        if (propUrl && propUrl.startsWith('/')) {
            url = `${window.location.origin}${propUrl}`;
        }

        // Try native share API first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Check out this opening for ${title} at MediaSoft`,
                    url: url,
                });
                return;
            } catch (err) {
                // Fallback to clipboard if user cancels or errors
                console.log('Share canceled or failed, falling back to clipboard');
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    if (!mounted) {
        return (
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-slate-200 text-slate-500">
                <Share2 className="w-4 h-4" />
            </Button>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShare}
                        className="rounded-full h-10 w-10 border-slate-200 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{copied ? 'Copied Link!' : 'Share Job'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
