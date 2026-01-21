'use client';

import { useActionState } from 'react';
import { updateBrandingSettings } from '@/lib/settings-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Loader2, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BrandingFormProps {
    initialSettings: {
        logoPath: string | null;
        logoRedirectUrl: string;
        faviconPath: string | null;
        siteBaseUrl: string;
    };
}

export default function BrandingForm({ initialSettings }: BrandingFormProps) {
    const [state, formAction, isPending] = useActionState(updateBrandingSettings, null);
    const [preview, setPreview] = useState<string | null>(initialSettings.logoPath);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(initialSettings.faviconPath);
    const [redirectUrl, setRedirectUrl] = useState(initialSettings.logoRedirectUrl || '');
    const [siteBaseUrl, setSiteBaseUrl] = useState(initialSettings.siteBaseUrl || '');

    // Sync state with action result if successful
    useEffect(() => {
        if (state?.success) {
           if(state.logoPath) setPreview(state.logoPath);
           if(state.faviconPath) setFaviconPreview(state.faviconPath);
           if(state.redirectUrl !== undefined) setRedirectUrl(state.redirectUrl);
           if(state.siteBaseUrl !== undefined) setSiteBaseUrl(state.siteBaseUrl);
        }
    }, [state]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreviewFn: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewFn(URL.createObjectURL(file));
        }
    };

    return (
        <Card className="premium-glass-card">
            <CardHeader>
                <CardTitle>Company Branding & SEO</CardTitle>
                <CardDescription>Customize your brand identity and SEO settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Logo Section */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold text-slate-700">Company Logo</Label>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors group">
                                {preview ? (
                                    <div className="relative group/preview h-24 flex items-center justify-center">
                                        <img
                                            src={preview}
                                            alt="Logo Preview"
                                            className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform group-hover/preview:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-20 w-20 bg-slate-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                        <span className="text-slate-400 font-bold text-2xl">L</span>
                                    </div>
                                )}

                                <div className="mt-4 text-center">
                                    <label htmlFor="logo-upload" className="cursor-pointer inline-block">
                                        <div className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 h-9 px-4 py-2 shadow-sm transition-colors">
                                            <Upload className="mr-2 h-3 w-3" />
                                            {preview ? "Change Logo" : "Upload Logo"}
                                        </div>
                                        <input
                                            id="logo-upload"
                                            name="logo"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e, setPreview)}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Favicon Section */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold text-slate-700">Site Favicon</Label>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors group">
                                {faviconPreview ? (
                                    <div className="relative group/preview h-24 flex items-center justify-center">
                                        <img
                                            src={faviconPreview}
                                            alt="Favicon Preview"
                                            className="h-16 w-16 object-contain drop-shadow-sm transition-transform group-hover/preview:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 bg-slate-200 rounded-lg flex items-center justify-center mb-4 shadow-inner">
                                        <span className="text-slate-400 font-bold text-xl">F</span>
                                    </div>
                                )}

                                <div className="mt-4 text-center">
                                    <label htmlFor="favicon-upload" className="cursor-pointer inline-block">
                                        <div className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 h-9 px-4 py-2 shadow-sm transition-colors">
                                            <Upload className="mr-2 h-3 w-3" />
                                            {faviconPreview ? "Change Favicon" : "Upload Favicon"}
                                        </div>
                                        <input
                                            id="favicon-upload"
                                            name="favicon"
                                            type="file"
                                            accept="image/x-icon,image/png,image/svg+xml"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e, setFaviconPreview)}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Redirect URL Section */}
                        <div className="space-y-4">
                            <Label htmlFor="logo_redirect_url" className="text-base font-semibold text-slate-700">Logo Redirect URL</Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input 
                                    id="logo_redirect_url"
                                    name="logo_redirect_url"
                                    placeholder="https://your-website.com"
                                    className="pl-10 h-11"
                                    value={redirectUrl}
                                    onChange={(e) => setRedirectUrl(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                Where clicking the logo takes the user.
                            </p>
                        </div>

                        {/* Site Base URL Section */}
                        <div className="space-y-4">
                            <Label htmlFor="site_base_url" className="text-base font-semibold text-slate-700">Site Base URL</Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input 
                                    id="site_base_url"
                                    name="site_base_url"
                                    placeholder="https://example.com"
                                    className="pl-10 h-11"
                                    value={siteBaseUrl}
                                    onChange={(e) => setSiteBaseUrl(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                Important for Sitemap & SEO (Canonical URLs).
                            </p>
                        </div>
                    </div>

                    {state?.error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-md animate-in fade-in-50">
                            {state.error}
                        </div>
                    )}

                    {state?.success && (
                        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-md animate-in fade-in-50">
                            <CheckCircle2 className="h-4 w-4" />
                            Branding & SEO settings updated successfully!
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button type="submit" disabled={isPending} className="premium-btn w-full sm:w-auto min-w-[150px]">
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
