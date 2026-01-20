'use client';

import { useEffect, useRef } from 'react';
import { incrementJobViews } from '@/lib/job-actions';

export default function ViewTracker({ jobId }: { jobId: number }) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (!hasIncremented.current) {
        incrementJobViews(jobId);
        hasIncremented.current = true;
    }
  }, [jobId]);

  return null;
}
