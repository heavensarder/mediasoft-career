'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Loader2, Pencil, Save, Trash2, Building2, Briefcase, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Item {
    id: number;
    name: string;
}

interface SettingsSectionProps {
    title: string;
    description: string;
    items: Item[];
    onCreate: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
    onUpdate: (id: number, formData: FormData) => Promise<{ success?: boolean; error?: string }>;
    onDelete: (id: number) => Promise<{ success?: boolean; error?: string }>;
}

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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function SettingsSection({ title, description, items, onCreate, onUpdate, onDelete }: SettingsSectionProps) {
    // Map title to icon
    let Icon = Building2;
    if (title === "Job Types") Icon = Briefcase;
    if (title === "Locations") Icon = MapPin;

    const [newItemName, setNewItemName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [editName, setEditName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        setIsCreating(true);
        const formData = new FormData();
        formData.append('name', newItemName);

        try {
            const result = await onCreate(formData);
            if (result.success) {
                setNewItemName('');
                router.refresh();
            } else {
                alert(result.error);
            }
        } finally {
            setIsCreating(false);
        }
    }

    const handleUpdate = async () => {
        if (!editingItem || !editName.trim()) return;

        setIsUpdating(true);
        const formData = new FormData();
        formData.append('name', editName);

        try {
            const result = await onUpdate(editingItem.id, formData);
            if (result.success) {
                setEditingItem(null);
                setEditName('');
                router.refresh();
            } else {
                alert(result.error);
            }
        } finally {
            setIsUpdating(false);
        }
    }

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            const result = await onDelete(id);
            if (result.success) {
                router.refresh();
            } else if (result.error) {
                alert(result.error);
            }
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Info & Add Form */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="border-0 shadow-sm bg-primary/5 border-l-4 border-l-primary/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-primary text-xl">
                            {Icon && <Icon className="h-5 w-5" />}
                            {title}
                        </CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="text-sm text-muted-foreground">
                            Currently showing <span className="font-bold text-foreground">{items.length}</span> {title.toLowerCase()}.
                       </div>
                    </CardContent>
                </Card>

                <Card className="premium-glass-card border-none">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Add New</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <Input
                                placeholder={`Enter ${title.slice(0, -1)} name...`}
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                disabled={isCreating}
                                className="premium-input bg-white/50"
                            />
                            <Button type="submit" disabled={isCreating} className="w-full premium-btn bg-primary text-white hover:bg-primary/90 shadow-md">
                                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Create {title.slice(0, -1)}</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            
            {/* Right Column: List */}
            <div className="lg:col-span-2">
                 <Card className="premium-glass-card border-none min-h-[400px]">
                    <CardContent className="p-6">
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="group flex items-center justify-between p-4 rounded-xl bg-white/50 border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            {Icon ? <Icon className="h-4 w-4" /> : <span className="font-bold text-xs">#</span>}
                                        </div>
                                        <span className="text-base font-semibold text-slate-700 group-hover:text-primary transition-colors">{item.name}</span>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        {/* Edit Button */}
                                        <Dialog open={editingItem?.id === item.id} onOpenChange={(open) => {
                                            if (open) {
                                                setEditingItem(item);
                                                setEditName(item.name);
                                            } else {
                                                setEditingItem(null);
                                            }
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="premium-glass-card">
                                                <DialogHeader>
                                                    <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="premium-input"
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setEditingItem(null)} className="rounded-xl">Cancel</Button>
                                                    <Button onClick={handleUpdate} disabled={isUpdating} className="premium-btn">
                                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        {/* Delete Button */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={deletingId === item.id}
                                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    {deletingId === item.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="premium-glass-card">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl shadow-md border-none">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 opacity-50">
                                        {Icon ? <Icon className="h-8 w-8" /> : <Plus className="h-8 w-8" />}
                                    </div>
                                    <p className="text-lg font-medium">No items yet</p>
                                    <p className="text-sm">Use the form on the left to add your first {title.slice(0, -1).toLowerCase()}.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
