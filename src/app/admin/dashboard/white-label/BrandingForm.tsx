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
    };
}

export default function BrandingForm({ initialSettings }: BrandingFormProps) {
    const [state, formAction, isPending] = useActionState(updateBrandingSettings, null);
    const [preview, setPreview] = useState<string | null>(initialSettings.logoPath);
    const [redirectUrl, setRedirectUrl] = useState(initialSettings.logoRedirectUrl || '');

    // Sync state with action result if successful
    useEffect(() => {
        if (state?.success) {
           if(state.logoPath) setPreview(state.logoPath);
           if(state.redirectUrl !== undefined) setRedirectUrl(state.redirectUrl);
        }
    }, [state]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <Card className="premium-glass-card">
            <CardHeader>
                <CardTitle>Company Branding</CardTitle>
                <CardDescription>Setup your company logo and where clicking it should take users.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-8">
                    {/* Logo Section */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold text-slate-700">Company Logo</Label>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-8 bg-slate-50 hover:bg-slate-100 transition-colors group">
                            {preview ? (
                                <div className="relative group/preview">
                                    <img
                                        src={preview}
                                        alt="Logo Preview"
                                        className="max-h-32 object-contain mb-4 drop-shadow-sm transition-transform group-hover/preview:scale-105"
                                    />
                                </div>
                            ) : (
                                <div className="h-20 w-20 bg-slate-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                    <span className="text-slate-400 font-bold text-2xl">L</span>
                                </div>
                            )}

                            <div className="text-center space-y-2">
                                <label htmlFor="logo-upload" className="cursor-pointer inline-block">
                                    <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 px-4 py-2 bg-primary text-primary-foreground shadow-sm">
                                        <Upload className="mr-2 h-4 w-4" />
                                        {preview ? "Change Logo" : "Upload Logo"}
                                    </div>
                                    <input
                                        id="logo-upload"
                                        name="logo"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Recommended: PNG or SVG, max 2MB.
                                </p>
                            </div>
                        </div>
                    </div>

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
                        <p className="text-sm text-slate-500">
                            Users will be redirected to this URL when clicking the logo in the Dashboard header or Login page.
                        </p>
                    </div>

                    {state?.error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-md animate-in fade-in-50">
                            {state.error}
                        </div>
                    )}

                    {state?.success && (
                        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-md animate-in fade-in-50">
                            <CheckCircle2 className="h-4 w-4" />
                            Branding settings updated successfully!
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
