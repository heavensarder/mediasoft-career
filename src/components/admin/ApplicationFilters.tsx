"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; 
// Note: if use-debounce is not installed, I will use standard timeout. 
// I'll assume standard timeout to avoid extra install unless needed.
// Actually, I'll implementing a simple custom debounce or use timeout.

interface Job {
  id: number;
  title: string;
}

interface ApplicationFiltersProps {
  jobs: Job[];
}

const STATUS_OPTIONS = [
  "New",
  "Viewed",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

export default function ApplicationFilters({ jobs }: ApplicationFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleJobChange = (jobId: string) => {
    const params = new URLSearchParams(searchParams);
    if (jobId && jobId !== "all") {
      params.set("jobId", jobId);
    } else {
      params.delete("jobId");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    replace(`${pathname}`);
  };

  const debouncedSearch = useDebouncedCallback((term) => {
    handleSearch(term);
  }, 300);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or mobile..."
          className="pl-8"
          defaultValue={searchParams.get("query")?.toString()}
          onChange={(e) => {
             debouncedSearch(e.target.value);
          }}
        />
      </div>
      
      <Select 
        defaultValue={searchParams.get("status")?.toString()} 
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                {status}
                </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select 
        defaultValue={searchParams.get("jobId")?.toString()} 
        onValueChange={handleJobChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Job" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id.toString()}>
                {job.title}
                </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {(searchParams.get("query") || searchParams.get("status") || searchParams.get("jobId")) && (
        <Button variant="ghost" onClick={clearFilters} className="px-2 lg:px-3">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
