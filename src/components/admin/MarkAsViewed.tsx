"use client";

import { useEffect } from "react";
import { markAsViewed } from "@/lib/application-actions";

interface MarkAsViewedProps {
  id: number;
  status: string;
}

export default function MarkAsViewed({ id, status }: MarkAsViewedProps) {
  useEffect(() => {
    if (status === 'New') {
      markAsViewed(id);
    }
  }, [id, status]);

  return null; // This component renders nothing, it's just for the side effect
}
