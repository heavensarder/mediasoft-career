"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Terminal, Server, CheckCircle2, Shield, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getApiKey, updateApiKey } from '@/lib/api-settings-actions';
import { toast } from "sonner";

export default function DeveloperZonePage() {
    const [origin, setOrigin] = useState<string>('');
    const [apiKey, setApiKey] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        setOrigin(window.location.origin);
        loadApiKey();
    }, []);

    const loadApiKey = async () => {
        setIsLoading(true);
        const result = await getApiKey();
        if (result.success && result.key) {
            setApiKey(result.key);
        }
        setIsLoading(false);
    };

    const handleUpdateKey = async () => {
        setIsSaving(true);
        const result = await updateApiKey(apiKey);
        setIsSaving(false);
        
        if (result.success) {
            toast.success("API Key updated successfully");
        } else {
            toast.error(result.error || "Failed to update key");
        }
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const endpoints = [
        {
            key: 'jobs',
            title: 'Active Jobs API',
            description: 'Get a list of all currently active job postings.',
            method: 'GET',
            path: '/api/jobs',
        },
        {
            key: 'applicants',
            title: 'Applicants API',
            description: 'Retrieve a list of all job applicants along with their full application data.',
            method: 'GET',
            path: '/api/applicants',
        }
    ];

    return (
        <div className="space-y-8 max-w-5xl pb-10">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                    <Terminal className="h-8 w-8 text-[#00ADE7]" />
                    Developer Zone
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Manage API access and view endpoint documentation.
                </p>
            </div>

            {/* API Key Management */}
            <Card className="border-indigo-100 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-xl">Authentication</CardTitle>
                    </div>
                    <CardDescription>
                        Secure your API endpoints with a secret key. This key must be included in your requests.
                    </CardDescription>
                </CardHeader>
                <CardContent className="bg-indigo-50/30 pt-6">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="apiKey" className="font-semibold text-slate-700">API Secret Key</Label>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Input 
                                    id="apiKey" 
                                    value={apiKey} 
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your secret key..."
                                    className="font-mono bg-white border-slate-300 pr-10 h-11"
                                    type="text"
                                />
                                <div className="absolute right-3 top-3 text-slate-400">
                                    <Shield className="h-5 w-5" />
                                </div>
                            </div>
                            <Button 
                                onClick={handleUpdateKey} 
                                disabled={isSaving || isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px] h-11"
                            >
                                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Save Key"}
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Warning: Changing this key will invalidate all existing integrations.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6">
                {endpoints.map((endpoint) => {
                    const fullUrl = `${origin}${endpoint.path}?api_key=${apiKey}`;
                    
                    return (
                        <Card key={endpoint.key} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <Server className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-slate-800">{endpoint.title}</CardTitle>
                                            <CardDescription>{endpoint.description}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 uppercase">
                                        {endpoint.method}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="relative group">
                                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 flex items-center justify-between overflow-x-auto min-h-[50px]">
                                        <span className="whitespace-nowrap flex items-center gap-2">
                                            <span className="text-green-400 font-bold">{endpoint.method}</span> 
                                            <span className="text-white opacity-90">{origin}{endpoint.path}</span>
                                            <span className="text-orange-300 opacity-80">?api_key={apiKey}</span>
                                        </span>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-8 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                                            onClick={() => copyToClipboard(fullUrl, endpoint.key)}
                                        >
                                            {copied === endpoint.key ? (
                                                <><CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Copied</>
                                            ) : (
                                                <><Copy className="mr-2 h-3.5 w-3.5" /> Copy URL</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-slate-500 flex gap-2">
                                    <span className="font-semibold">Params:</span> 
                                    <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">api_key</code> (required)
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
