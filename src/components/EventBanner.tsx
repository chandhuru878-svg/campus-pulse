import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { EventCategory } from '../types';

interface EventBannerProps {
  src: string;
  alt: string;
  title?: string;
  category?: EventCategory;
  className?: string;
}

export function EventBanner({ src, alt, title, category, className = '' }: EventBannerProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Calendar className="w-8 h-8 text-violet-300 mb-2" strokeWidth={1.75} />
        {category && <span className="text-xs font-medium text-blue-200">{category}</span>}
        {title && <span className="text-sm font-semibold text-white mt-1 line-clamp-2 max-w-xs">{title}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
