"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailTemplate } from "@prisma/client";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from "../actions";
import { Loader2, Plus, Trash2, Edit, Eye, Save, X, Code, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

export default function TemplatesManager() {
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'edit' | 'create'>('list');
  const [currentTemplate, setCurrentTemplate] = useState<Partial<MailTemplate>>({ name: '', subject: '', body: '' });
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  // const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual'); -> Removed

  // const { toast } = useToast(); -> Removed

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const result = await getTemplates();
    if (result.success && result.data) {
      setTemplates(result.data);
    } else {
      toast.error("Failed to load templates");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentTemplate.name || !currentTemplate.subject || !currentTemplate.body) {
      toast.error("Please fill in all fields (Name, Subject, Body)");
      return;
    }

    setSaving(true);
    let result;
    if (mode === 'create') {
        result = await createTemplate(currentTemplate as any);
    } else {
        result = await updateTemplate(currentTemplate.id!, currentTemplate as any);
    }

    if (result.success) {
        toast.success(result.message);
        setMode('list');
        fetchTemplates();
    } else {
        toast.error(result.error);
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
      const result = await deleteTemplate(id);
      if (result.success) {
          toast.success(result.message);
          fetchTemplates();
      } else {
          toast.error(result.error);
      }
  };

  if (loading && mode === 'list' && templates.length === 0) {
      return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
        {mode === 'list' ? (
            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium">Email Templates</h3>
                        <p className="text-sm text-muted-foreground">Manage templates for notifications and auto-replies.</p>
                    </div>
                    <Button onClick={() => { setCurrentTemplate({ name: '', subject: '', body: '' }); setMode('create'); }}>
                        <Plus className="mr-2 h-4 w-4" /> Create New
                    </Button>
                 </div>

                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map(template => (
                        <div key={template.id} className="relative group bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                             <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 truncate pr-8" title={template.name}>{template.name}</h4>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => { setCurrentTemplate(template); setMode('edit'); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the template 
                                                    <span className="font-bold text-slate-900"> {template.name}</span>.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(template.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                             </div>
                             <p className="text-xs text-slate-500 font-medium mb-1 truncate">Subject: {template.subject}</p>
                             <div className="mt-3 flex gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setPreviewHtml(template.body)}>
                                            <Eye className="mr-2 h-3 w-3" /> Preview
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Template Preview: {template.name}</DialogTitle>
                                            <DialogDescription>Subject: {template.subject}</DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-4 border p-4 rounded-md bg-white prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: template.body }} />
                                    </DialogContent>
                                </Dialog>
                             </div>
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400 border-2 border-dashed rounded-lg bg-slate-50">
                            <p>No templates created yet.</p>
                        </div>
                    )}
                 </div>
            </div>
        ) : (
            <div className="space-y-6">
                 <div className="flex items-center justify-between border-b pb-4">
                     <h3 className="text-lg font-medium">{mode === 'create' ? 'Create New Template' : 'Edit Template'}</h3>
                     <Button variant="ghost" onClick={() => setMode('list')}>
                         <X className="mr-2 h-4 w-4" /> Cancel
                     </Button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Editor Column */}
                     <div className="space-y-4">
                         <div className="grid gap-2">
                             <Label>Template Name <span className="text-red-500">*</span></Label>
                             <Input 
                                value={currentTemplate.name} 
                                onChange={e => setCurrentTemplate({...currentTemplate, name: e.target.value})} 
                                placeholder="e.g. Application Received Auto-Reply"
                             />
                             <p className="text-xs text-slate-500">Internal name (not sent to user).</p>
                         </div>

                         <div className="grid gap-2">
                             <Label>Email Subject <span className="text-red-500">*</span></Label>
                             <Input 
                                value={currentTemplate.subject} 
                                onChange={e => setCurrentTemplate({...currentTemplate, subject: e.target.value})} 
                                placeholder="e.g. We have received your application"
                             />
                         </div>

                         <div className="grid gap-2">
                             <Label>Email Body (HTML) <span className="text-red-500">*</span></Label>
                             <Textarea 
                                className="font-mono text-sm min-h-[400px]"
                                value={currentTemplate.body || ''}
                                onChange={(e) => setCurrentTemplate({...currentTemplate, body: e.target.value})}
                                placeholder="<div>Enter your HTML content here...</div>"
                             />

                             <div className="text-sm bg-blue-50 text-blue-800 p-3 rounded-md border border-blue-100 mt-2">
                                <h4 className="font-semibold mb-1">Available Placeholders:</h4>
                                <p className="font-mono text-xs mb-1">
                                    {'{{fullName}}, {{email}}, {{mobile}}, {{jobTitle}}, {{experience}}, {{message}}, {{date}}'}
                                </p>
                             </div>
                         </div>
                     </div>

                     {/* Live Preview Column */}
                     <div className="space-y-4">
                        <Label>Live Preview</Label>
                        <div className="border rounded-lg overflow-hidden bg-white shadow-sm h-full max-h-[600px] flex flex-col">
                            {/* Mock Email Header */}
                            <div className="bg-slate-50 border-b p-3 space-y-2">
                                <div className="flex gap-2 text-sm text-slate-600">
                                    <span className="font-semibold w-12 text-right">To:</span> 
                                    <span className="bg-slate-200 px-1.5 rounded text-slate-500">Applicant Name</span>
                                </div>
                                <div className="flex gap-2 text-sm text-slate-600">
                                    <span className="font-semibold w-12 text-right">Subject:</span>
                                    <span className="text-slate-900 font-medium">{currentTemplate.subject || "(No Subject)"}</span>
                                </div>
                            </div>
                            
                            {/* Email Body Preview */}
                            <div className="p-6 overflow-y-auto flex-1 bg-white">
                                <div 
                                    className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold"
                                    dangerouslySetInnerHTML={{ __html: (() => {
                                        // Simple unescape to handle potential double-escaping
                                        const body = currentTemplate.body || '';
                                        if (!body) return '<span class="text-slate-400 italic">Start typing to see preview...</span>';
                                        
                                        // If the body starts with &lt;, it's likely escaped
                                        if (body.trim().startsWith('&lt;')) {
                                            const txt = document.createElement('textarea');
                                            txt.innerHTML = body;
                                            return txt.value;
                                        }
                                        return body;
                                    })() }} 
                                />
                            </div>
                        </div>
                     </div>
                 </div>

                 <div className="pt-4 flex gap-3 border-t mt-4">
                     <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                         {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         <Save className="mr-2 h-4 w-4" /> Save Template
                     </Button>
                     <Button variant="outline" onClick={() => setMode('list')} disabled={saving}>Cancel</Button>
                 </div>
            </div>
        )}
    </div>
  );
}
