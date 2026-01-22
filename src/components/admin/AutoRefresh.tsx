"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AutoRefreshProps {
    interval?: number; // interval in milliseconds, default 5000 (5s)
}

export default function AutoRefresh({ interval = 5000 }: AutoRefreshProps) {
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => {
            router.refresh();
        }, interval);

        return () => clearInterval(timer);
    }, [router, interval]);

    return null;
}
