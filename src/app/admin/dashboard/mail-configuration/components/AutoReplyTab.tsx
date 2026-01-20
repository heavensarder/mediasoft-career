"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateMailConfig, getTemplates, MailConfigData } from '../actions';
import { toast } from "sonner";
import { Loader2, Save } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MailTemplate } from '@prisma/client';

interface AutoReplyTabProps {
  initialData: MailConfigData;
}

export default function AutoReplyTab({ initialData }: AutoReplyTabProps) {
  const [isEnabled, setIsEnabled] = useState(initialData.isAutoReplyEnabled);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialData.autoReplyTemplateId?.toString() || '');
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // const { toast } = useToast();

  useEffect(() => {
      getTemplates().then(res => {
          if (res.success && res.data) {
              setTemplates(res.data);
          }
          setFetching(false);
      })
  }, []);

  const handleSave = async () => {
    setLoading(true);
    
    // Convert string ID to number or null
    const templateId = selectedTemplateId ? parseInt(selectedTemplateId) : null;

    const result = await updateMailConfig({
      isAutoReplyEnabled: isEnabled,
      autoReplyTemplateId: templateId
    });

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border">
          <div className="space-y-0.5">
              <Label className="text-base font-semibold">Enable Auto-Reply</Label>
              <p className="text-sm text-muted-foreground">
                  When enabled, an automatic email will be sent to candidates upon application submission.
              </p>
          </div>
          <Switch 
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
       </div>

       <div className={`space-y-4 transition-all duration-300 ${!isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
           <div className="grid gap-2">
               <Label>Select Auto-Reply Template</Label>
               <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                        <SelectValue placeholder={fetching ? "Loading templates..." : "Choose a template..."} />
                    </SelectTrigger>
                    <SelectContent>
                        {templates.map(t => (
                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                        ))}
                    </SelectContent>
               </Select>
               <p className="text-xs text-slate-500">
                  Select the template to use for auto-replies. You can create/edit templates in the 
                  <span className="font-semibold text-primary"> Template</span> tab.
               </p>
           </div>
       </div>

       <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto min-w-[150px]">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
       </div>
    </div>
  );
}
