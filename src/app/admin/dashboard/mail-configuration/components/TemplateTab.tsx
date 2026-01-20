'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Info } from 'lucide-react';
import { toast } from 'sonner';
import { updateMailConfig, MailConfigData } from '../actions';
import Tiptap from '@/components/ui/tiptap';

interface TemplateTabProps {
  initialData: MailConfigData;
}

export default function TemplateTab({ initialData }: TemplateTabProps) {
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state if initialData changes (e.g. after a reset)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBodyChange = (content: string) => {
    setFormData((prev) => ({ ...prev, notificationBody: content }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateMailConfig({
        notificationSubject: formData.notificationSubject,
        notificationBody: formData.notificationBody
      });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
       {/* Top Actions */}
       <div className="flex items-center justify-end gap-4 p-4 bg-muted/30 rounded-lg border">
          <Button size="sm" onClick={handleSave} disabled={isLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="h-4 w-4" /> Save Changes
          </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-blue-800">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
            <h4 className="font-semibold mb-1">Available Placeholders:</h4>
            <p className="font-mono text-xs mb-1">
                {'{{fullName}}, {{email}}, {{mobile}}, {{jobTitle}}, {{experience}}, {{message}}, {{date}}'}
            </p>
            <p className="opacity-80">
                Use these placeholders in your subject or body. They will be replaced with actual form data when sending the email.
            </p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Email Notification Template</CardTitle>
            <CardDescription>
                Customize the email you receive when someone submits the enquiry form.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input 
                    name="notificationSubject" 
                    value={formData.notificationSubject || ''} 
                    onChange={handleChange} 
                    placeholder="New Enquiry Form Submission" 
                />
            </div>

            <div className="space-y-2">
                <Label>HTML Body</Label>
                <div className="min-h-[300px]">
                    <Tiptap 
                        content={formData.notificationBody || ''} 
                        onChange={handleBodyChange} 
                    />
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
