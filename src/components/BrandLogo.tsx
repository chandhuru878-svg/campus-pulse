import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  onClick?: () => void;
}

export function BrandLogo({ variant = 'dark', onClick }: BrandLogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg py-0.5"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="cp-logo-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#cp-logo-grad)" />
        <path
          d="M6.5 16.5H10.5L13 10.5L16.5 22L19.8 14L21.8 16.5H25.5"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-display text-lg font-bold tracking-tight ${textColor}`}>
        Campus Pulse
      </span>
    </Wrapper>
  );
}
