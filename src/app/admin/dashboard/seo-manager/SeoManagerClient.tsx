'use client';

import { useState } from 'react';
import { PageSeoData, updatePageSeo } from '@/lib/seo-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Search, Globe, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SeoManagerClientProps {
    initialSettings: any[];
}

export default function SeoManagerClient({ initialSettings }: SeoManagerClientProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [loading, setLoading] = useState<string | null>(null);

    const getSetting = (page: string) => settings.find((s: any) => s.page === page) || { title: '', description: '', keywords: '' };

    const handleSave = async (page: string, data: PageSeoData) => {
        setLoading(page);
        try {
            await updatePageSeo(page, data);
            toast.success("SEO Settings Updated!");
            // Update local state
            setSettings(prev => {
                const idx = prev.findIndex((s: any) => s.page === page);
                if (idx >= 0) {
                    const newArr = [...prev];
                    newArr[idx] = { ...newArr[idx], ...data };
                    return newArr;
                }
                return [...prev, { page, ...data }];
            });
        } catch (error) {
            toast.error("Failed to update settings.");
        } finally {
            setLoading(null);
        }
    };

    const pages = [
        { id: 'global', label: 'Global Defaults', icon: Globe, desc: 'Fallback settings for all pages.' },
        { id: 'home', label: 'Home Page', icon: FileText, desc: 'Settings for the landing page.' },
        { id: 'job_details', label: 'Job Details', icon: FileText, desc: 'Template for job pages. Use {{job_title}} as placeholder.' },
    ];

    return (
        <Tabs defaultValue="global" className="w-full space-y-8">
            <div className="flex justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-100/50 p-1 rounded-full">
                    {pages.map(page => (
                        <TabsTrigger 
                            key={page.id} 
                            value={page.id}
                            className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#00ADE7]"
                        >
                            {page.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            {pages.map(page => (
                <TabsContent key={page.id} value={page.id} className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <SeoForm 
                        pageId={page.id} 
                        initialData={getSetting(page.id)} 
                        onSave={handleSave} 
                        loading={loading === page.id}
                        description={page.desc}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
}

function SeoForm({ pageId, initialData, onSave, loading, description }: any) {
    const [formData, setFormData] = useState(initialData);

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card className="premium-glass-card border border-slate-200/60 shadow-xl shadow-slate-200/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-[#00ADE7] font-bold capitalize">{pageId.replace('_', ' ')}</span> SEO
                        </CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Meta Title</Label>
                            <Input 
                                value={formData.title || ''} 
                                onChange={e => handleChange('title', e.target.value)}
                                placeholder="e.g., MediaSoft Career - Build the Future" 
                            />
                            <p className="text-xs text-slate-400 text-right">{formData.title?.length || 0} / 60 characters</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Meta Description</Label>
                            <Textarea 
                                value={formData.description || ''} 
                                onChange={e => handleChange('description', e.target.value)}
                                placeholder="Brief description for search results..."
                                className="h-24"
                            />
                            <p className="text-xs text-slate-400 text-right">{formData.description?.length || 0} / 160 characters</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Keywords</Label>
                            <Input 
                                value={formData.keywords || ''} 
                                onChange={e => handleChange('keywords', e.target.value)}
                                placeholder="comma, separated, keywords" 
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                             <Button 
                                onClick={() => onSave(pageId, formData)} 
                                disabled={loading}
                                className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save SEO Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Google Preview Card */}
            <div className="lg:col-span-1">
                <Card className="premium-glass-card bg-white border border-slate-200/60 sticky top-8">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Search className="h-4 w-4" /> Search Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-sans">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">M</div>
                                <div>
                                    <div className="text-xs text-slate-800 font-medium">MediaSoft Career</div>
                                    <div className="text-[10px] text-slate-500">https://example.com/page-url</div>
                                </div>
                            </div>
                            <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-medium truncate">
                                {formData.title || "Page Title"}
                            </h3>
                            <p className="text-sm text-[#4d5156] mt-1 line-clamp-3 leading-snug">
                                {formData.description || "This description will appear in search results..."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
