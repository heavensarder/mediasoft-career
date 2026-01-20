'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Loader2, Pencil, Save } from "lucide-react";

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

export default function SettingsSection({ title, description, items, onCreate, onUpdate, onDelete }: SettingsSectionProps) {
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
        <Card className="premium-glass-card border-none">
            <CardHeader>
                <CardTitle className="text-2xl text-primary">{title}</CardTitle>
                <CardDescription className="text-base">{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Add Form */}
                <form onSubmit={handleCreate} className="flex gap-4">
                    <Input
                        placeholder={`Add new ${title.slice(0, -1)}...`}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        disabled={isCreating}
                        className="h-12 text-lg premium-input"
                    />
                    <Button type="submit" size="lg" disabled={isCreating} className="h-12 px-8 premium-btn">
                        {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5 mr-2" /> Add</>}
                    </Button>
                </form>

                {/* List - Vertical Layout */}
                <div className="space-y-3 mt-6">
                    {items.map(item => (
                        <div key={item.id} className="group flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                            <span className="text-lg font-medium text-foreground/90">{item.name}</span>

                            <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
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
                                        <Button variant="ghost" size="sm" className="hover:text-primary hover:bg-primary/10 transition-colors">
                                            <Pencil className="h-4 w-4 mr-2" /> Edit
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
                                            <Button variant="outline" onClick={() => setEditingItem(null)} className="premium-btn bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-none border-none">Cancel</Button>
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
                                            size="sm"
                                            disabled={deletingId === item.id}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            {deletingId === item.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <X className="h-4 w-4 mr-2" />
                                            )}
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="premium-glass-card">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete this {title.slice(0, -1).toLowerCase()}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="premium-btn bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-none border-none">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full shadow-md border-none">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            No items found. Add one above!
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
