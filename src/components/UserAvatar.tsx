'use client';

import { useState, useEffect } from 'react';

interface UserAvatarProps {
    name?: string | null;
    image?: string | null;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function UserAvatar({ name = 'User', image, className = '', size = 'md' }: UserAvatarProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(image || null);
    const [hasError, setHasError] = useState(false);

    // Update state if prop changes
    useEffect(() => {
        setImgSrc(image || null);
        setHasError(false);
    }, [image]);

    const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=random`;

    // Determine final source: 
    // If we have an image limit and no error, use it.
    // Otherwise use fallback.
    const finalSrc = (!hasError && imgSrc) ? imgSrc : fallbackSrc;

    return (
        <div
            className={`
                relative flex items-center justify-center overflow-hidden bg-slate-200 dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 
                ${className}
            `}
        >
            <img
                src={finalSrc}
                alt={name || 'User'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setHasError(true)}
            />
        </div>
    );
}
