'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, GripVertical, Pencil, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface FormField {
    id: number;
    label: string;
    name: string;
    type: string;
    required: boolean;
    placeholder: string | null;
    order: number;
    options: string | null;
    isSystem: boolean;
    isActive: boolean;
}

interface FormBuilderProps {
    fields: FormField[];
    onSeed: () => Promise<void>;
    onCreate: (data: any) => Promise<{ success?: boolean; error?: string }>;
    onUpdate: (id: number, data: any) => Promise<{ success?: boolean; error?: string }>;
    onDelete: (id: number) => Promise<{ success?: boolean; error?: string }>;
    onReorder: (items: { id: number, order: number }[]) => Promise<{ success?: boolean; error?: string }>;
}

export default function FormBuilder({ fields, onSeed, onCreate, onUpdate, onDelete, onReorder }: FormBuilderProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editingField, setEditingField] = useState<FormField | null>(null);
    const router = useRouter();

    // New Field State
    const [newLabel, setNewLabel] = useState('');
    const [newType, setNewType] = useState('text');
    const [newRequired, setNewRequired] = useState(false);
    const [newOptions, setNewOptions] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Edit Field State (initialized when editingField is set)
    const [editLabel, setEditLabel] = useState('');
    const [editPlaceholder, setEditPlaceholder] = useState('');
    const [editRequired, setEditRequired] = useState(false);
    const [editOptions, setEditOptions] = useState('');

    const handleCreate = async () => {
        if (!newLabel) return;
        setIsCreating(true);
        const name = newLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');

        try {
            await onCreate({
                label: newLabel,
                name,
                type: newType,
                required: newRequired,
                options: newOptions
            });
            setIsDialogOpen(false);
            setNewLabel('');
            setNewOptions('');
            router.refresh();
        } catch (e) {
            alert("Failed to create field");
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingField) return;
        setIsUpdating(true);
        try {
            await onUpdate(editingField.id, {
                label: editLabel,
                placeholder: editPlaceholder || null,
                required: editRequired,
                options: editOptions || null,
                isActive: editingField.isActive // Keep current active state
            });
            setEditingField(null);
            router.refresh();
        } catch (e) {
            alert("Failed to update field");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await onDelete(id);
            router.refresh();
        } catch (e) {
            alert("Failed to delete field");
        }
    }

    const moveField = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === fields.length - 1) return;

        const newFields = [...fields];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];

        // Update local order numbers for logic
        const updates = newFields.map((f, i) => ({ id: f.id, order: i + 1 }));

        try {
            await onReorder(updates);
            router.refresh();
        } catch (e) {
            alert("Failed to reorder");
        }
    };

    const handleToggleActive = async (field: FormField) => {
        if (field.isSystem) {
            // System fields cannot be completely disabled? Maybe for now let's allow it but warn.
            // Actually, System fields are mandated by schema usually. Let's assume we can hide them.
        }
        await onUpdate(field.id, { ...field, isActive: !field.isActive });
        router.refresh();
    }

    if (fields.length === 0) {
        return (
            <Card className="premium-glass-card border-none text-center py-10">
                <CardContent className="flex flex-col items-center gap-4">
                    <p className="text-muted-foreground">No fields found. Initialize the default form configuration.</p>
                    <Button onClick={() => { onSeed().then(() => router.refresh()) }} className="premium-btn">
                        Initialize Default Fields
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="premium-glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl text-primary">Application Form Builder</CardTitle>
                    <CardDescription className="text-base">Manage the fields shown to applicants.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="premium-btn bg-primary text-white hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Add Field
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="premium-glass-card">
                        <DialogHeader>
                            <DialogTitle>Add New Field</DialogTitle>
                            <DialogDescription>Create a custom question for the application form.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="label">Label / Question</Label>
                                <Input id="label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g., Portfolio URL" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Input Type</Label>
                                <Select value={newType} onValueChange={setNewType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Short Text</SelectItem>
                                        <SelectItem value="textarea">Long Text</SelectItem>
                                        <SelectItem value="select">Dropdown</SelectItem>
                                        <SelectItem value="file">File Upload</SelectItem>
                                        <SelectItem value="date">Date</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {(newType === 'select' || newType === 'radio') && (
                                <div className="grid gap-2">
                                    <Label htmlFor="options">Options (comma separated)</Label>
                                    <Input id="options" value={newOptions} onChange={(e) => setNewOptions(e.target.value)} placeholder="Option 1, Option 2, Option 3" />
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <Switch id="required" checked={newRequired} onCheckedChange={setNewRequired} />
                                <Label htmlFor="required">Required Field</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button onClick={handleCreate} disabled={isCreating} className="premium-btn">
                                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Field'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className={cn(
                            "group flex items-center justify-between p-4 rounded-xl border border-transparent shadow-sm bg-white/50 hover:shadow-md transition-all",
                            !field.isActive && "opacity-60 bg-gray-100"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveField(index, 'up')} disabled={index === 0}>
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveField(index, 'down')} disabled={index === fields.length - 1}>
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{field.label}</h3>
                                        {field.isSystem ? (
                                            <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100">SYSTEM</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] border-orange-200 text-orange-600">CUSTOM</Badge>
                                        )}
                                        {field.required && <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Required</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Type: {field.type} | Name: {field.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 mr-4">
                                    <Label htmlFor={`active-${field.id}`} className="text-xs text-muted-foreground">Active</Label>
                                    <Switch
                                        id={`active-${field.id}`}
                                        checked={field.isActive}
                                        onCheckedChange={() => handleToggleActive(field)}
                                    />
                                </div>

                                <Dialog open={editingField?.id === field.id} onOpenChange={(open) => {
                                    if (open) {
                                        setEditingField(field);
                                        setEditLabel(field.label);
                                        setEditPlaceholder(field.placeholder || '');
                                        setEditRequired(field.required);
                                        setEditOptions(field.options || '');
                                    } else {
                                        setEditingField(null);
                                    }
                                }}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="premium-glass-card">
                                        <DialogHeader>
                                            <DialogTitle>Edit Field</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Label</Label>
                                                <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Placeholder</Label>
                                                <Input value={editPlaceholder} onChange={(e) => setEditPlaceholder(e.target.value)} />
                                            </div>
                                            {(field.type === 'select' || field.type === 'radio') && (
                                                <div className="grid gap-2">
                                                    <Label>Options</Label>
                                                    <Input value={editOptions} onChange={(e) => setEditOptions(e.target.value)} />
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-2">
                                                <Switch checked={editRequired} onCheckedChange={setEditRequired} />
                                                <Label>Required</Label>
                                            </div>
                                            {field.isSystem && (
                                                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                                                    Note: Name and Type cannot be changed for System fields.
                                                </p>
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setEditingField(null)} className="rounded-xl">Cancel</Button>
                                            <Button onClick={handleUpdate} disabled={isUpdating} className="premium-btn">
                                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {!field.isSystem && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="premium-glass-card">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Field?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will remove "{field.label}" from the form. Existing data for this field might be preserved in the database but won't be visible.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="premium-btn bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-none border-none">Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(field.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full shadow-md border-none">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
