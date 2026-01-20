'use client';

import { useActionState } from 'react';
import { uploadLogo } from '@/lib/settings-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function WhiteLabelPage() {
    const [state, formAction, isPending] = useActionState(uploadLogo, null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">White Label Branding</h1>
                <p className="text-slate-500 mt-2 font-medium text-lg">Customize the admin experience with your brand.</p>
            </div>

            <Card className="premium-glass-card">
                <CardHeader>
                    <CardTitle>Company Logo</CardTitle>
                    <CardDescription>Upload your company logo to replace the default MediaSoft branding in the Admin Dashboard and Login page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-6">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-8 bg-slate-50 hover:bg-slate-100 transition-colors">
                            {preview || (state?.logoPath) ? (
                                <img
                                    src={preview || state?.logoPath}
                                    alt="Logo Preview"
                                    className="max-h-32 object-contain mb-4"
                                />
                            ) : (
                                <div className="h-20 w-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-slate-400 font-bold text-2xl">L</span>
                                </div>
                            )}

                            <div className="text-center space-y-2">
                                <label htmlFor="logo-upload" className="cursor-pointer">
                                    <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 px-4 py-2 bg-primary text-primary-foreground">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Choose Logo
                                    </div>
                                    <input
                                        id="logo-upload"
                                        name="logo"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        required
                                    />
                                </label>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Recommended: PNG or SVG, max 2MB.
                                </p>
                            </div>
                        </div>

                        {state?.error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-md">
                                {state.error}
                            </div>
                        )}

                        {state?.success && (
                            <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-md">
                                <CheckCircle2 className="h-4 w-4" />
                                Logo updated successfully!
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending || !preview} className="premium-btn">
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
