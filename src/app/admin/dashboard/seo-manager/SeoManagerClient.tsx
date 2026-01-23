'use client';

import { useState, useCallback } from 'react';
import { PageSeoData, updatePageSeo } from '@/lib/seo-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Loader2, Save, Search, Globe, FileText, Code, Share2, Settings2,
    CheckCircle, AlertCircle, Building2, Briefcase, LayoutList, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

interface SeoManagerClientProps {
    initialSettings: any[];
}

// Pre-built Schema Templates
const schemaTemplates = {
    organization: {
        name: 'Organization',
        icon: Building2,
        description: 'Company information, logo, and social profiles',
        template: {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "{{company_name}}",
            "url": "{{site_url}}",
            "logo": "{{logo_url}}",
            "description": "{{company_description}}",
            "sameAs": [
                "{{facebook_url}}",
                "{{twitter_url}}",
                "{{linkedin_url}}"
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "{{phone}}",
                "contactType": "customer service",
                "email": "{{email}}"
            }
        }
    },
    website: {
        name: 'WebSite',
        icon: Globe,
        description: 'Site name with search action for sitelinks',
        template: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "{{site_name}}",
            "url": "{{site_url}}",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "{{site_url}}/jobs?search={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        }
    },
    jobPosting: {
        name: 'JobPosting',
        icon: Briefcase,
        description: 'Job listing structured data (auto-generated)',
        template: {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "{{job_title}}",
            "description": "{{job_description}}",
            "datePosted": "{{date_posted}}",
            "validThrough": "{{valid_through}}",
            "employmentType": "{{employment_type}}",
            "hiringOrganization": {
                "@type": "Organization",
                "name": "{{company_name}}",
                "sameAs": "{{company_url}}",
                "logo": "{{company_logo}}"
            },
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "{{city}}",
                    "addressCountry": "{{country}}"
                }
            }
        }
    },
    breadcrumb: {
        name: 'BreadcrumbList',
        icon: LayoutList,
        description: 'Navigation breadcrumbs for better site structure',
        template: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "{{site_url}}"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Jobs",
                    "item": "{{site_url}}/jobs"
                }
            ]
        }
    }
};

export default function SeoManagerClient({ initialSettings }: SeoManagerClientProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [loading, setLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('basic');

    const getSetting = (page: string) => settings.find((s: any) => s.page === page) || {
        title: '', description: '', keywords: '', ogImage: '', ogTitle: '', ogDescription: '',
        jsonLd: '', canonicalUrl: '', robots: 'index,follow'
    };

    const handleSave = async (page: string, data: PageSeoData) => {
        setLoading(page);
        try {
            await updatePageSeo(page, data);
            toast.success("SEO Settings Updated!");
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
        { id: 'job_details', label: 'Job Details', icon: Briefcase, desc: 'Template for job pages. Use {{job_title}} as placeholder.' },
    ];

    return (
        <div className="space-y-8">
            {/* Page Selector */}
            <Tabs defaultValue="global" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-lg grid-cols-3 bg-slate-100/50 p-1.5 rounded-full">
                        {pages.map(page => (
                            <TabsTrigger
                                key={page.id}
                                value={page.id}
                                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#00ADE7] transition-all duration-300"
                            >
                                <page.icon className="w-4 h-4 mr-2" />
                                {page.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {pages.map(page => (
                    <TabsContent key={page.id} value={page.id} className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                        <SeoEditor
                            pageId={page.id}
                            initialData={getSetting(page.id)}
                            onSave={handleSave}
                            loading={loading === page.id}
                            description={page.desc}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

function SeoEditor({ pageId, initialData, onSave, loading, description }: any) {
    const [formData, setFormData] = useState(initialData);
    const [activeSection, setActiveSection] = useState('basic');
    const [jsonError, setJsonError] = useState<string | null>(null);

    const handleChange = useCallback((field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
        if (field === 'jsonLd') {
            try {
                if (value.trim()) {
                    JSON.parse(value);
                }
                setJsonError(null);
            } catch (e: any) {
                setJsonError(e.message);
            }
        }
    }, []);

    const applyTemplate = (templateKey: keyof typeof schemaTemplates) => {
        const template = schemaTemplates[templateKey].template;
        const jsonString = JSON.stringify(template, null, 2);
        handleChange('jsonLd', jsonString);
        toast.success(`${schemaTemplates[templateKey].name} template applied!`);
    };

    const sections = [
        { id: 'basic', label: 'Basic SEO', icon: Search },
        { id: 'schema', label: 'Schema Markup', icon: Code },
        { id: 'opengraph', label: 'Open Graph', icon: Share2 },
        { id: 'advanced', label: 'Advanced', icon: Settings2 },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-[260px] flex-shrink-0">
                <Card className="premium-glass-card border border-slate-200/60 shadow-lg sticky top-4">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">
                            <span className="text-[#00ADE7] font-bold capitalize">{pageId.replace('_', ' ')}</span>
                        </CardTitle>
                        <CardDescription className="text-sm">{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1 pt-0">
                        <nav className="space-y-1">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 whitespace-nowrap ${activeSection === section.id
                                        ? 'bg-gradient-to-r from-[#00ADE7]/10 to-[#00ADE7]/5 text-[#00ADE7] border border-[#00ADE7]/20 shadow-sm'
                                        : 'hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    <section.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-medium text-sm">{section.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="pt-4 mt-4 border-t border-slate-100">
                            <Button
                                onClick={() => onSave(pageId, formData)}
                                disabled={loading || !!jsonError}
                                className="w-full bg-gradient-to-r from-[#00ADE7] to-[#0099cc] text-white hover:opacity-90 rounded-xl py-5 shadow-lg shadow-[#00ADE7]/20"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save All Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
                {/* Basic SEO */}
                {activeSection === 'basic' && (
                    <Card className="premium-glass-card border border-slate-200/60 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-[#00ADE7]" />
                                Basic SEO Settings
                            </CardTitle>
                            <CardDescription>Configure meta tags for search engines</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Meta Title</Label>
                                <Input
                                    value={formData.title || ''}
                                    onChange={e => handleChange('title', e.target.value)}
                                    placeholder="e.g., MediaSoft Career - Build the Future"
                                    className="h-12"
                                />
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-400">Recommended: 50-60 characters</p>
                                    <p className={`text-xs font-medium ${(formData.title?.length || 0) > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        {formData.title?.length || 0} / 60
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Meta Description</Label>
                                <Textarea
                                    value={formData.description || ''}
                                    onChange={e => handleChange('description', e.target.value)}
                                    placeholder="Brief description for search results..."
                                    className="h-28 resize-none"
                                />
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-400">Recommended: 150-160 characters</p>
                                    <p className={`text-xs font-medium ${(formData.description?.length || 0) > 160 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        {formData.description?.length || 0} / 160
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Keywords</Label>
                                <Input
                                    value={formData.keywords || ''}
                                    onChange={e => handleChange('keywords', e.target.value)}
                                    placeholder="comma, separated, keywords"
                                    className="h-12"
                                />
                                <p className="text-xs text-slate-400">Separate keywords with commas</p>
                            </div>

                            {/* Google Preview */}
                            <div className="mt-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Search className="w-4 h-4" /> Google Preview
                                </p>
                                <div className="font-sans">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#00ADE7] to-[#0088cc] flex items-center justify-center text-white text-xs font-bold">M</div>
                                        <div>
                                            <div className="text-xs text-slate-800 font-medium">MediaSoft Career</div>
                                            <div className="text-[10px] text-slate-500">https://careers.example.com</div>
                                        </div>
                                    </div>
                                    <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-medium truncate">
                                        {formData.title || "Page Title"}
                                    </h3>
                                    <p className="text-sm text-[#4d5156] mt-1 line-clamp-2 leading-snug">
                                        {formData.description || "This description will appear in search results..."}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Schema Markup */}
                {activeSection === 'schema' && (
                    <div className="space-y-6">
                        {/* Template Selector */}
                        <Card className="premium-glass-card border border-slate-200/60 shadow-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Code className="w-5 h-5 text-[#00ADE7]" />
                                    Schema Templates
                                </CardTitle>
                                <CardDescription>Quick start with pre-built structured data templates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {Object.entries(schemaTemplates).map(([key, template]) => (
                                        <button
                                            key={key}
                                            onClick={() => applyTemplate(key as keyof typeof schemaTemplates)}
                                            className="p-4 rounded-xl border border-slate-200 hover:border-[#00ADE7]/50 hover:bg-[#00ADE7]/5 transition-all duration-200 text-left group"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#00ADE7]/10 to-[#00ADE7]/5 group-hover:from-[#00ADE7]/20 group-hover:to-[#00ADE7]/10 transition-all">
                                                    <template.icon className="w-5 h-5 text-[#00ADE7]" />
                                                </div>
                                                <span className="font-semibold text-slate-800">{template.name}</span>
                                            </div>
                                            <p className="text-xs text-slate-500">{template.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* JSON-LD Editor */}
                        <Card className="premium-glass-card border border-slate-200/60 shadow-xl">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            JSON-LD Editor
                                        </CardTitle>
                                        <CardDescription>Edit structured data markup</CardDescription>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${jsonError
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : formData.jsonLd?.trim()
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                            : 'bg-slate-50 text-slate-500 border border-slate-200'
                                        }`}>
                                        {jsonError ? (
                                            <><AlertCircle className="w-3.5 h-3.5" /> Invalid JSON</>
                                        ) : formData.jsonLd?.trim() ? (
                                            <><CheckCircle className="w-3.5 h-3.5" /> Valid JSON</>
                                        ) : (
                                            'No schema defined'
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Textarea
                                        value={formData.jsonLd || ''}
                                        onChange={e => handleChange('jsonLd', e.target.value)}
                                        placeholder='{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Your Company"\n}'
                                        className={`min-h-[300px] font-mono text-sm resize-y ${jsonError ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                                            }`}
                                    />
                                </div>
                                {jsonError && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-red-600">{jsonError}</p>
                                    </div>
                                )}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        <strong>Tip:</strong> Use placeholders like <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[#00ADE7]">{`{{job_title}}`}</code> for dynamic content.
                                        Test your schema at <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener" className="text-[#00ADE7] hover:underline">Google Rich Results Test</a>.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Open Graph */}
                {activeSection === 'opengraph' && (
                    <Card className="premium-glass-card border border-slate-200/60 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-[#00ADE7]" />
                                Open Graph Settings
                            </CardTitle>
                            <CardDescription>Control how your pages appear when shared on social media</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">OG Title (Social Media Title)</Label>
                                <Input
                                    value={formData.ogTitle || ''}
                                    onChange={e => handleChange('ogTitle', e.target.value)}
                                    placeholder="Leave empty to use Meta Title"
                                    className="h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">OG Description</Label>
                                <Textarea
                                    value={formData.ogDescription || ''}
                                    onChange={e => handleChange('ogDescription', e.target.value)}
                                    placeholder="Leave empty to use Meta Description"
                                    className="h-24 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">OG Image URL</Label>
                                <Input
                                    value={formData.ogImage || ''}
                                    onChange={e => handleChange('ogImage', e.target.value)}
                                    placeholder="https://example.com/og-image.jpg"
                                    className="h-12"
                                />
                                <p className="text-xs text-slate-400">Recommended size: 1200x630 pixels</p>
                            </div>

                            {/* Social Preview */}
                            <div className="mt-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Share2 className="w-4 h-4" /> Social Media Preview
                                </p>
                                <div className="rounded-xl overflow-hidden border border-slate-200 max-w-md">
                                    <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                        {formData.ogImage ? (
                                            <img src={formData.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <Share2 className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-xs">No image set</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-[#f7f8fa]">
                                        <p className="text-xs text-slate-500 uppercase">careers.example.com</p>
                                        <h4 className="font-semibold text-slate-800 mt-1 line-clamp-2">
                                            {formData.ogTitle || formData.title || "Page Title"}
                                        </h4>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                            {formData.ogDescription || formData.description || "Page description..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Advanced */}
                {activeSection === 'advanced' && (
                    <Card className="premium-glass-card border border-slate-200/60 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-[#00ADE7]" />
                                Advanced SEO Settings
                            </CardTitle>
                            <CardDescription>Fine-tune technical SEO options</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Canonical URL</Label>
                                <Input
                                    value={formData.canonicalUrl || ''}
                                    onChange={e => handleChange('canonicalUrl', e.target.value)}
                                    placeholder="https://example.com/canonical-page"
                                    className="h-12"
                                />
                                <p className="text-xs text-slate-400">Specify the preferred URL for this page to avoid duplicate content issues</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Robots Meta Tag</Label>
                                <div className="relative">
                                    <select
                                        value={formData.robots || 'index,follow'}
                                        onChange={e => handleChange('robots', e.target.value)}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00ADE7]/20 focus:border-[#00ADE7]"
                                    >
                                        <option value="index,follow">index, follow (Default - Allow indexing)</option>
                                        <option value="noindex,follow">noindex, follow (Don't index, follow links)</option>
                                        <option value="index,nofollow">index, nofollow (Index, don't follow links)</option>
                                        <option value="noindex,nofollow">noindex, nofollow (Block from search)</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                                <p className="text-xs text-slate-400">Control how search engines index and follow links on this page</p>
                            </div>

                            <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-amber-800">Caution</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            Setting "noindex" will remove this page from search results. Use with caution for pages you want to keep private.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
