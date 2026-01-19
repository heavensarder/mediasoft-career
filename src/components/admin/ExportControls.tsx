'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getExportData } from '@/lib/export-actions';
import { toast } from "sonner";

interface ExportControlsProps {
    departments: { id: number; name: string }[];
    jobs: { id: number; title: string; departmentId: number }[];
}

export default function ExportControls({ departments, jobs }: ExportControlsProps) {
    const [selectedDep, setSelectedDep] = useState<string>('all');
    const [selectedJob, setSelectedJob] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Filter jobs based on selected department
    const filteredJobs = selectedDep === 'all'
        ? jobs
        : jobs.filter(job => job.departmentId.toString() === selectedDep);

    const handleExport = async (format: 'csv' | 'print') => {
        setLoading(true);
        try {
            const { success, data, error } = await getExportData(selectedDep, selectedJob, startDate, endDate);

            if (!success || !data || data.length === 0) {
                toast.error(error || "No data found for the selected criteria.");
                setLoading(false);
                return;
            }

            if (format === 'csv') {
                // Generate CSV
                const headers = Object.keys(data[0]).join(',');
                const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
                const csvContent = `${headers}\n${rows}`;

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `applications_export_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Print View (simplistic PDF approach)
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    const htmlContent = `
                        <html>
                        <head>
                            <title>Export View</title>
                            <style>
                                body { font-family: sans-serif; padding: 20px; }
                                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                th { background-color: #f2f2f2; }
                                h1 { text-align: center; color: #333; }
                                .meta { margin-bottom: 20px; font-size: 14px; }
                            </style>
                        </head>
                        <body>
                            <h1>Application Report</h1>
                            <div class="meta">
                                <p>Generated on: ${new Date().toLocaleString()}</p>
                                <p>Filters: Department: ${selectedDep === 'all' ? 'All' : departments.find(d => d.id.toString() === selectedDep)?.name}, Job: ${selectedJob === 'all' ? 'All' : jobs.find(j => j.id.toString() === selectedJob)?.title}</p>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.map(row => `<tr>${Object.values(row).map(val => `<td>${val}</td>`).join('')}</tr>`).join('')}
                                </tbody>
                            </table>
                            <script>
                                window.onload = function() { window.print(); }
                            </script>
                        </body>
                        </html>
                    `;
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                }
            }
            toast.success("Export generated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={selectedDep} onValueChange={setSelectedDep}>
                        <SelectTrigger className="clay-input">
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map((dep) => (
                                <SelectItem key={dep.id} value={dep.id.toString()}>
                                    {dep.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Job Post</Label>
                    <Select value={selectedJob} onValueChange={setSelectedJob}>
                        <SelectTrigger className="clay-input">
                            <SelectValue placeholder="Select Job" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Jobs</SelectItem>
                            {filteredJobs.map((job) => (
                                <SelectItem key={job.id} value={job.id.toString()}>
                                    {job.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="clay-input"
                    />
                </div>

                <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="clay-input"
                    />
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <Button
                    onClick={() => handleExport('csv')}
                    className="flex-1 clay-button"
                    disabled={loading}
                >
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? 'Processing...' : 'Download CSV'}
                </Button>
                <Button
                    onClick={() => handleExport('print')}
                    className="flex-1 clay-button bg-gray-600 hover:bg-gray-700 text-white"
                    disabled={loading}
                >
                    <Printer className="mr-2 h-4 w-4" />
                    {loading ? 'Processing...' : 'Print / Save PDF'}
                </Button>
            </div>
        </div>
    );
}
