'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalPages: number;
}

export default function PaginationControls({
    hasNextPage,
    hasPrevPage,
    totalPages,
}: PaginationControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = searchParams.get('page') ?? '1';
    const per_page = searchParams.get('per_page') ?? '10';

    return (
        <div className='flex items-center gap-2 justify-end mt-4'>
            <div className='text-sm text-gray-500 mr-4'>
                Page {page} of {totalPages}
            </div>

            <Button
                variant='outline'
                size='sm'
                disabled={!hasPrevPage}
                onClick={() => {
                    router.push(`?page=${Number(page) - 1}&per_page=${per_page}&query=${searchParams.get('query') ?? ''}`);
                }}
            >
                <ChevronLeft className='h-4 w-4 mr-2' />
                Previous
            </Button>

            <Button
                variant='outline'
                size='sm'
                disabled={!hasNextPage}
                onClick={() => {
                    router.push(`?page=${Number(page) + 1}&per_page=${per_page}&query=${searchParams.get('query') ?? ''}`);
                }}
            >
                Next
                <ChevronRight className='h-4 w-4 ml-2' />
            </Button>
        </div>
    );
}
