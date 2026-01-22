'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    max?: number;
}

export default function StarRating({ value, onChange, disabled = false, max = 5 }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0);

    return (
        <div className="flex gap-1">
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    className={`p-1 transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
                    onMouseEnter={() => !disabled && setHoverValue(star)}
                    onMouseLeave={() => !disabled && setHoverValue(0)}
                    onClick={() => !disabled && onChange(star)}
                >
                    <Star
                        className={`h-8 w-8 transition-colors ${star <= (hoverValue || value)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-200'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}
