'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Unlock, RotateCcw, Send, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { updateMailConfig, resetMailConfig, sendTestEmail, MailConfigData } from '../actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CredentialsTabProps {
  initialData: MailConfigData;
}

export default function CredentialsTab({ initialData }: CredentialsTabProps) {
  const [formData, setFormData] = useState(initialData);
  const [isLocked, setIsLocked] = useState(true);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateMailConfig(formData);
      if (result.success) {
        toast.success(result.message);
        setIsLocked(true); // Auto-lock after save
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setIsLoading(false);
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const result = await resetMailConfig();
      if (result.success) {
        toast.success(result.message);
        setFormData({
            ...formData,
            senderEmail: '',
            clientId: '',
            clientSecret: '',
            refreshToken: '',
        });
        setIsLocked(true);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setIsLoading(false);
    setShowResetDialog(false);
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address to send test.');
      return;
    }
    setIsSendingTest(true);
    try {
      const result = await sendTestEmail(testEmail);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to send test email');
    }
    setIsSendingTest(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${isLocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isLocked ? 'LOCKED MODE' : 'UNLOCKED MODE'}
            </span>
        </div>
        <div className="flex items-center gap-3">
            {isLocked ? (
                <Button variant="outline" size="sm" onClick={() => setShowUnlockDialog(true)} className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
                    <Unlock className="h-4 w-4" /> Unlock Helper
                </Button>
            ) : (
                <Button variant="outline" size="sm" onClick={() => setIsLocked(true)} className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50">
                    <Lock className="h-4 w-4" /> Lock Helper
                </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={() => setShowResetDialog(true)} className="gap-2 text-yellow-600 border-yellow-200 hover:bg-yellow-50">
                <RotateCcw className="h-4 w-4" /> Reset Default
            </Button>

            <div className="flex items-center gap-2 ml-4 border-l pl-4">
                <Input 
                    placeholder="Test email address" 
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="h-9 w-[200px]"
                />
                <Button size="sm" variant="secondary" onClick={handleSendTest} disabled={isSendingTest}>
                    <Send className="h-4 w-4 mr-2" /> {isSendingTest ? 'Sending...' : 'Send Test'}
                </Button>
            </div>

            <Button size="sm" onClick={handleSave} disabled={isLocked || isLoading} className="ml-2 gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="h-4 w-4" /> Save Changes
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Google Workspace Credentials</CardTitle>
            <CardDescription>Configure the OAuth2 credentials from Google Cloud Console.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Sender Email</Label>
                    <div className="relative">
                        <Input 
                            name="senderEmail" 
                            value={formData.senderEmail} 
                            onChange={handleChange} 
                            disabled={isLocked}
                            placeholder="donotreply@mediasoftbd.com" 
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">The Google Workspace account you logged in with.</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Client ID</Label>
                <Input 
                    name="clientId" 
                    value={formData.clientId} 
                    onChange={handleChange} 
                    disabled={isLocked}
                    placeholder="123456789-abc..." 
                />
            </div>

            <div className="space-y-2">
                <Label>Client Secret</Label>
                <div className="relative">
                    <Input 
                        name="clientSecret" 
                        type={showSecret ? "text" : "password"}
                        value={formData.clientSecret} 
                        onChange={handleChange} 
                        disabled={isLocked}
                        placeholder="Client Secret" 
                        className="pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowSecret(!showSecret)}
                        disabled={isLocked}
                    >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Refresh Token</Label>
                <Input 
                    name="refreshToken" 
                    value={formData.refreshToken} 
                    onChange={handleChange} 
                    disabled={isLocked}
                    placeholder="1//..." 
                />
                <p className="text-xs text-muted-foreground">Generated from OAuth Playground.</p>
            </div>
        </CardContent>
      </Card>

      {/* Unlock Confirmation Dialog */}
      <AlertDialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              Modifying these settings can break the email functionality of the entire website. 
              Only proceed if you know what you are doing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setIsLocked(false); setShowUnlockDialog(false); }} className="bg-red-600 hover:bg-red-700">
              Unlock & Edit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all configuration fields. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
