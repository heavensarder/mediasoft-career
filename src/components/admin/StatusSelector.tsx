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
        case 'New': return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'Shortlisted': return 'text-green-600 bg-green-50 border-green-200';
        case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
        case 'Selected': return 'text-purple-600 bg-purple-50 border-purple-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={handleValueChange} disabled={isLoading}>
        <SelectTrigger className={`w-[140px] h-8 text-xs font-medium border ${getColor(status)}`}>
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
