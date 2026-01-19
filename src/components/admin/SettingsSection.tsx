'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";

interface Item {
    id: number;
    name: string;
}

interface SettingsSectionProps {
    title: string;
    description: string;
    items: Item[];
    onCreate: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
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

export default function SettingsSection({ title, description, items, onCreate, onDelete }: SettingsSectionProps) {
    const [newItemName, setNewItemName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
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
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Form */}
                <form onSubmit={handleCreate} className="flex gap-2">
                    <Input 
                        placeholder={`Add new ${title.slice(0, -1)}`}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        disabled={isCreating}
                    />
                    <Button type="submit" size="icon" disabled={isCreating}>
                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </form>

                {/* List */}
                <div className="flex flex-wrap gap-2">
                    {items.map(item => (
                        <div key={item.id} className="group relative">
                            <Badge variant="secondary" className="pl-3 pr-8 py-1.5 text-base">
                                {item.name}
                            </Badge>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button
                                        disabled={deletingId === item.id}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-500 opacity-60 group-hover:opacity-100 transition-all"
                                    >
                                        {deletingId === item.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin"/>
                                        ) : (
                                            <X className="h-3 w-3" />
                                        )}
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this {title.slice(0, -1).toLowerCase()}.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                    {items.length === 0 && <span className="text-gray-400 text-sm">No items found.</span>}
                </div>
            </CardContent>
        </Card>
    );    
}
