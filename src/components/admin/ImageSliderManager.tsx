'use client';

import { useState } from 'react';
import { SliderImage, addSliderImage, deleteSliderImage } from '@/lib/slider-actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Trash2, X, Plus, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageSliderManagerProps {
    initialImages: SliderImage[];
}

export default function ImageSliderManager({ initialImages }: ImageSliderManagerProps) {
    const [images, setImages] = useState<SliderImage[]>(initialImages);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
    const [urlInput, setUrlInput] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (uploadMode !== 'file') return;

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        
        if (files.length > 0) {
            setIsUploading(true);
            let successCount = 0;

            for (const file of files) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const result = await addSliderImage(formData);
                    if (result.success) successCount++;
                } catch (error) {
                    console.error("Upload failed for", file.name, error);
                }
            }

            setIsUploading(false);
            if (successCount > 0) {
                toast.success(`Successfully added ${successCount} images.`);
                window.location.reload();
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPreview(null);
        setUrlInput('');
    };

    const handleAddImage = async () => {
        if (uploadMode === 'file' && !selectedFile) return;
        if (uploadMode === 'link' && !urlInput) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            if (uploadMode === 'file' && selectedFile) {
                formData.append('file', selectedFile);
            } else if (uploadMode === 'link') {
                formData.append('link', urlInput);
            }

            const result = await addSliderImage(formData);

            if (result.success) {
                toast.success('Image added successfully!');
                resetForm();
                // We're relying on revalidatePath in the action to update the page data,
                // but since this is a client component consuming props, we might need to refresh manually 
                // or just accept that a page refresh (which router.refresh() does) will update the list.
                // However, for immediate feedback without full reload if the action doesn't force it:
                // We'll trust the parent page to re-render with new data or use router.refresh() if we had it.
                // For better UX, let's trigger a soft refresh if possible, but the action calls revalidatePath.
                // Alternatively, we can just reload the window or let Next.js handle it.
                // To keep state in sync efficiently effectively, usually we'd pass a refresh callback or use router.
                window.location.reload(); 
            } else {
                toast.error(result.error || 'Failed to add image.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this image?')) return;
        
        try {
            const result = await deleteSliderImage(id);
            if (result.success) {
                setImages(prev => prev.filter(img => img.id !== id));
                toast.success('Image deleted.');
            } else {
                toast.error(result.error || 'Failed to delete.');
            }
        } catch (error) {
            toast.error('Error deleting image.');
        }
    };

    return (
        <div className="space-y-8">
            <Card className="clay-card border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Add New Image</CardTitle>
                    <CardDescription>Upload an image or provide a direct link.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <Button 
                            variant={uploadMode === 'file' ? 'default' : 'outline'} 
                            onClick={() => { setUploadMode('file'); resetForm(); }}
                            size="sm"
                        >
                            <Upload className="mr-2 h-4 w-4" /> Upload File
                        </Button>
                        <Button 
                            variant={uploadMode === 'link' ? 'default' : 'outline'} 
                            onClick={() => { setUploadMode('link'); resetForm(); }}
                            size="sm"
                        >
                            <LinkIcon className="mr-2 h-4 w-4" /> Direct Link
                        </Button>
                    </div>

                    {uploadMode === 'file' ? (
                        <div 
                            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            {preview ? (
                                <div className="relative h-48 w-full flex items-center justify-center">
                                    <img src={preview} alt="Preview" className="h-full object-contain rounded-md" />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); resetForm(); }}
                                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-slate-100"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div onClick={() => document.getElementById('slider-upload')?.click()}>
                                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ImageIcon className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF</p>
                                </div>
                            )}
                            <input 
                                id="slider-upload"
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="https://example.com/image.jpg" 
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                />
                            </div>
                            {urlInput && (
                                <div className="mt-4 h-48 bg-slate-50 rounded-lg flex items-center justify-center border">
                                    <img 
                                        src={urlInput} 
                                        alt="Preview" 
                                        className="h-full object-contain"
                                        onError={(e) => (e.currentTarget.src = '/placeholder-image.png')} 
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <Button 
                            onClick={handleAddImage} 
                            disabled={isUploading || (!selectedFile && !urlInput)}
                            className="premium-btn"
                        >
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Add onto Slider
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                    <div key={img.id} className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all">
                        <img 
                            src={img.url} 
                            alt={`Slider Image ${img.id}`} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button 
                                variant="destructive" 
                                size="icon"
                                className="h-8 w-8 rounded-full shadow-lg"
                                onClick={() => handleDelete(img.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
