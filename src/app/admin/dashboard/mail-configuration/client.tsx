'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MailConfigData } from './actions';
import CredentialsTab from './components/CredentialsTab';
import TemplatesManager from './components/TemplatesManager';
import AutoReplyTab from './components/AutoReplyTab';
import GuideTab from './components/GuideTab';
import { Key, FileText, MessageSquare, BookOpen, Lock, ShieldAlert } from 'lucide-react';
import { verifyAdminPassword } from '@/lib/admin-settings-actions';
import { toast } from 'sonner';

interface MailConfigurationClientProps {
  initialData: MailConfigData;
}

export default function MailConfigurationClient({ initialData }: MailConfigurationClientProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessPassword, setAccessPassword] = useState('');
  const [verifyingAccess, setVerifyingAccess] = useState(false);

  const handleAccessVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessPassword) {
      toast.error('Please enter your password');
      return;
    }

    setVerifyingAccess(true);
    const result = await verifyAdminPassword(accessPassword);
    if (result.success) {
      setIsUnlocked(true);
      setAccessPassword('');
      toast.success('Access granted');
    } else {
      toast.error(result.error || 'Verification failed');
    }
    setVerifyingAccess(false);
  };

  // Show access gate if not unlocked
  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="premium-glass-card max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Mail Configuration</CardTitle>
            <CardDescription>
              Enter your password to access mail settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-amber-300 bg-amber-50">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                This area contains sensitive email credentials. Password verification is required.
              </AlertDescription>
            </Alert>
            <form onSubmit={handleAccessVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessPassword">Current Password</Label>
                <Input
                  id="accessPassword"
                  type="password"
                  value={accessPassword}
                  onChange={(e) => setAccessPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" disabled={verifyingAccess} className="w-full">
                {verifyingAccess ? 'Verifying...' : 'Unlock Mail Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">Mail Configuration</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Manage email notifications and auto-replies.</p>
        </div>
      </div>

      <div className="premium-glass-card bg-white p-6 overflow-hidden">
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

