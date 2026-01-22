"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateApplicationStatus } from "@/lib/application-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StatusSelectorProps {
  id: number;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  "New",
  "Viewed",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

export default function StatusSelector({ id, currentStatus }: StatusSelectorProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  async function handleValueChange(value: string) {
    if (value === status) return;
    
    setIsLoading(true);
    setStatus(value); // Optimistic update

    const result = await updateApplicationStatus(id, value);

    if (result.error) {
      toast.error("Failed to update status");
      setStatus(currentStatus); // Revert on error
    } else {
      toast.success(`Status updated to ${value}`);
    }
    setIsLoading(false);
  }

  // Determine badge color for the trigger (optional, for visual feedback)
  const getColor = (s: string) => {
    switch(s) {
        case 'New': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200';
        case 'Shortlisted': return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200';
        case 'Rejected': return 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200';
        case 'Selected': return 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200';
        case 'Interview': return 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200';
        default: return 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={handleValueChange} disabled={isLoading}>
        <SelectTrigger className={`w-[160px] h-10 font-bold border-0 shadow-sm transition-all focus:ring-2 focus:ring-offset-1 ${getColor(status)}`}>
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
