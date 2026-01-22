"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// import Tiptap from "@/components/ui/tiptap"; -> Removed visible editor
import { Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getTemplates, sendEmailFromTemplate } from "@/app/admin/dashboard/mail-configuration/actions";
import { MailTemplate } from "@prisma/client";

interface ApplicantEmailModalProps {
    applicantEmail: string;
    applicantName: string;
}

export default function ApplicantEmailModal({ applicantEmail, applicantName }: ApplicantEmailModalProps) {
    const [open, setOpen] = useState(false);
    const [templates, setTemplates] = useState<MailTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    // const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setFetching(true);
            getTemplates().then(res => {
                if (res.success && res.data) {
                    setTemplates(res.data);
                }
                setFetching(false);
            });
        }
    }, [open]);

    const handleTemplateChange = (id: string) => {
        setSelectedTemplateId(id);
        const template = templates.find(t => t.id.toString() === id);
        if (template) {
            setSubject(template.subject);
            setBody(template.body);
        }
    };

    const handleSend = async () => {
        if (!subject || !body) {
            toast.error("Subject and Body are required.");
            return; 
        }

        setLoading(true);
        // Replace placeholders (Frontend-side for immediate feedback/control) or let backend do it?
        // Let's do a simple replace here for Name at least since we have it.
        // Backend handles more complex replacements if we passed the application ID, but we passed email/name only.
        // For now, we send the content as is, assuming the user edited it or it's generic enough.
        // Actually, in a real scenario, we'd want to replace {{fullName}} here.
        
        let finalBody = body;
        finalBody = finalBody.replace(/{{fullName}}/g, applicantName);
        finalBody = finalBody.replace(/{{email}}/g, applicantEmail);
        
        // Note: Other placeholders like mobile/jobTitle are not available in this simple modal props yet.
        // User should edit the body manually if needed.

        const result = await sendEmailFromTemplate(applicantEmail, subject, finalBody);
        
        if (result.success) {
            toast.success(`Email successfully sent to ${applicantName}`);
            setOpen(false);
            setSubject('');
            setBody('');
            setSelectedTemplateId('');
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 font-bold glass-button-filled border-0 h-10 px-6">
                    <Mail className="h-4 w-4" /> Send Email
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Send Email to {applicantName}</DialogTitle>
                    <DialogDescription>
                        Select a template or write a custom email.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label>Load from Template</Label>
                        <Select value={selectedTemplateId} onValueChange={handleTemplateChange} disabled={fetching}>
                            <SelectTrigger>
                                <SelectValue placeholder={fetching ? "Loading templates..." : "Select a template..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map(t => (
                                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* <div className="grid gap-2">
                        <Label>Subject</Label>
                        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..." disabled />
                    </div>

                    <div className="grid gap-2">
                        <Label>Body</Label>
                        <div className="border p-4 rounded-md bg-slate-50 text-sm text-slate-500 max-h-[200px] overflow-y-auto">
                            {body ? "Template content loaded ready to send." : "dictSelect a template to load content."}
                        </div>
                    </div> */}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSend} disabled={loading} className="min-w-[100px]">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Send
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
