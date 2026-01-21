'use client';

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getExportData, getJobExportData } from "@/lib/export-actions";

type DownloadDataButtonProps = {
    mode: 'applications' | 'jobs';
    filters?: any;
    label?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
};

export default function DownloadDataButton({ 
    mode, 
    filters, 
    label = "Export", 
    variant = "outline",
    className 
}: DownloadDataButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            let result;
            if (mode === 'jobs') {
                result = await getJobExportData();
            } else {
                // Pass existing filters for applications
                const { departmentId, jobId, startDate, endDate, query, status, gender } = filters || {};
                result = await getExportData(departmentId, jobId, startDate, endDate, query, status, gender);
            }

            if (result.success && result.data) {
                // Convert to CSV
                const data = result.data;
                if(data.length === 0) {
                    toast.error("No data available to export.");
                    setLoading(false);
                    return;
                }

                const headers = Object.keys(data[0]);
                const csvContent = [
                    headers.join(','),
                    ...data.map((row: any) => headers.map(header => {
                        const cell = row[header] === null || row[header] === undefined ? '' : row[header];
                        return `"${String(cell).replace(/"/g, '""')}"`;
                    }).join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${mode}_export_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                toast.success("Export downloaded successfully!");
            } else {
                toast.error(result.error || "Failed to export data.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            variant={variant} 
            className={className} 
            onClick={handleDownload} 
            disabled={loading}
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {label}
        </Button>
    );
}
