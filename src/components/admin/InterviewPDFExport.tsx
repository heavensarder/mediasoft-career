'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileDown, Loader2 } from 'lucide-react';

interface Application {
    id: number;
    fullName: string;
    email: string;
    mobile: string;
    interviewDate: Date | null;
    status: string;
    totalScore: number;
    job: {
        id: number;
        title: string;
    };
    interviewMarking: {
        writtenExam: number | null;
        technicalViva: number | null;
        projectRating: number | null;
    } | null;
}

interface InterviewPDFExportProps {
    applications: Application[];
    selectedId?: number;
    positionTitle?: string;
}

export default function InterviewPDFExport({ applications, selectedId, positionTitle }: InterviewPDFExportProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // Fetch logo from branding settings
    useEffect(() => {
        fetch('/api/settings/logo')
            .then(res => res.json())
            .then(data => setLogoUrl(data.logoUrl))
            .catch(() => setLogoUrl(null));
    }, []);

    const getWrittenExamColor = (score: number | null) => {
        if (score === null) return '';
        return score >= 15 ? 'color: #16a34a; font-weight: 700;' : 'color: #dc2626; font-weight: 700;';
    };

    const generatePDF = (apps: Application[], title: string, showPosition: boolean = true) => {
        const formatDate = (date: Date | null) => {
            if (!date) return 'Not Scheduled';
            return new Date(date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        };

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
          .logo { max-height: 60px; max-width: 200px; object-fit: contain; }
          .header-text h1 { font-size: 28px; color: #1a1a1a; font-weight: 700; }
          .header-text .subtitle { color: #666; font-size: 14px; margin-top: 4px; }
          .meta { color: #888; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: linear-gradient(to right, #374151, #4b5563); color: white; padding: 14px 12px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { padding: 14px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
          tr:nth-child(even) { background: #fafafa; }
          tr:hover { background: #f5f5f5; }
          .score { text-align: center; font-weight: 600; }
          .score-good { color: #16a34a; }
          .score-bad { color: #dc2626; }
          .total { background: #f5f5f5; font-weight: 700; color: #374151; font-size: 15px; }
          .status { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .status-interview { background: #fef3c7; color: #d97706; }
          .status-selected { background: #dcfce7; color: #16a34a; }
          .status-rejected { background: #fee2e2; color: #dc2626; }
          .date { font-size: 12px; color: #666; }
          .stars { color: #fbbf24; font-size: 14px; }
          .applicant-name { font-weight: 600; color: #1a1a1a; }
          .applicant-email { font-size: 11px; color: #888; margin-top: 2px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 11px; }
          @media print {
            body { padding: 20px; }
            .header { margin-bottom: 20px; }
            th { background: #374151 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          @page { margin: 1cm; }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl.startsWith('/') ? window.location.origin + logoUrl : logoUrl}" alt="Logo" class="logo" />` : ''}
          <div class="header-text">
            <h1>${title}</h1>
            <p class="subtitle">${positionTitle ? `Position: ${positionTitle}` : 'All Positions'}</p>
          </div>
        </div>
        <p class="meta">Generated on ${new Date().toLocaleString()} • ${apps.length} Applicant${apps.length !== 1 ? 's' : ''}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Applicant</th>
              ${showPosition ? '<th>Position</th>' : ''}
              <th>Interview Date</th>
              <th class="score">Written (30)</th>
              <th class="score">Technical (10)</th>
              <th class="score">Project (★)</th>
              <th class="score">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${apps.map((app, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>
                  <div class="applicant-name">${app.fullName}</div>
                  <div class="applicant-email">${app.email}</div>
                </td>
                ${showPosition ? `<td>${app.job.title}</td>` : ''}
                <td class="date">${formatDate(app.interviewDate)}</td>
                <td class="score" style="${getWrittenExamColor(app.interviewMarking?.writtenExam ?? null)}">${app.interviewMarking?.writtenExam ?? '—'}</td>
                <td class="score">${app.interviewMarking?.technicalViva ?? '—'}</td>
                <td class="score stars">${app.interviewMarking?.projectRating ? '★'.repeat(app.interviewMarking.projectRating) + '☆'.repeat(5 - app.interviewMarking.projectRating) : '—'}</td>
                <td class="score total">${app.totalScore}</td>
                <td><span class="status status-${app.status.toLowerCase()}">${app.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Interview Report</p>
        </div>
      </body>
      </html>
    `;

        return html;
    };

    const handleExport = async (type: 'all' | 'individual', appId?: number) => {
        setIsExporting(true);

        try {
            let apps: Application[];
            let title: string;
            let showPosition = true;

            if (type === 'individual' && appId) {
                apps = applications.filter(a => a.id === appId);
                title = `Interview Details - ${apps[0]?.fullName || 'Applicant'}`;
            } else {
                apps = applications;
                title = positionTitle
                    ? `Interview Report - ${positionTitle}`
                    : 'Interview Panel - All Applicants';
                showPosition = !positionTitle;
            }

            if (apps.length === 0) {
                return;
            }

            const html = generatePDF(apps, title, showPosition);

            // Open in new window and trigger print
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            }
        } finally {
            setIsExporting(false);
        }
    };

    // Compact button for position sections
    if (positionTitle) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs bg-white/60"
                disabled={isExporting}
                onClick={(e) => {
                    e.stopPropagation();
                    handleExport('all');
                }}
            >
                {isExporting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <FileDown className="h-3 w-3" />
                )}
                Export
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 bg-white/60 border-slate-200 hover:bg-white/80"
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <FileDown className="h-4 w-4" />
                    )}
                    Export PDF
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleExport('all')}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export All Applicants
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {applications.slice(0, 5).map(app => (
                    <DropdownMenuItem key={app.id} onClick={() => handleExport('individual', app.id)}>
                        {app.fullName}
                    </DropdownMenuItem>
                ))}
                {applications.length > 5 && (
                    <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                        +{applications.length - 5} more applicants
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
