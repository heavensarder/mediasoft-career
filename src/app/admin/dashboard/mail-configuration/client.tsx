'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MailConfigData } from './actions';
import CredentialsTab from './components/CredentialsTab';
import TemplatesManager from './components/TemplatesManager';
import AutoReplyTab from './components/AutoReplyTab';
import GuideTab from './components/GuideTab';
import { Key, FileText, MessageSquare, BookOpen } from 'lucide-react';

interface MailConfigurationClientProps {
  initialData: MailConfigData;
}

export default function MailConfigurationClient({ initialData }: MailConfigurationClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mail Configuration</h1>
      </div>

      <div className="clay-card bg-white p-6 overflow-hidden">
        <Tabs defaultValue="credentials" className="space-y-6">
            <TabsList className="w-full justify-start h-12 bg-slate-100 p-1 border border-slate-200">
            <TabsTrigger value="credentials" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 h-full rounded-md transition-all text-slate-600 data-[state=active]:text-primary">
                <Key className="h-4 w-4" /> Credentials
            </TabsTrigger>
            <TabsTrigger value="template" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 h-full rounded-md transition-all text-slate-600 data-[state=active]:text-primary">
                <FileText className="h-4 w-4" /> Template
            </TabsTrigger>
            <TabsTrigger value="auto-reply" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 h-full rounded-md transition-all text-slate-600 data-[state=active]:text-primary">
                <MessageSquare className="h-4 w-4" /> Auto-Reply
            </TabsTrigger>
            <TabsTrigger value="guide" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 h-full rounded-md transition-all ml-auto text-slate-600 data-[state=active]:text-primary">
                <BookOpen className="h-4 w-4" /> Guide
            </TabsTrigger>
            </TabsList>

            <TabsContent value="credentials" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
             <CredentialsTab initialData={initialData} />
            </TabsContent>
            <TabsContent value="template" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <TemplatesManager />
            </TabsContent>
            <TabsContent value="auto-reply" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <AutoReplyTab initialData={initialData} />
            </TabsContent>
            <TabsContent value="guide" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <GuideTab />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
