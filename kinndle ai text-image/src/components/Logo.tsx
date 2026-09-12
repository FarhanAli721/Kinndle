import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withGlow?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'sm',
  withGlow = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {withGlow && (
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md -z-10 animate-pulse" />
      )}
      <img
        src="/logo.png"
        alt="KINNDLE Logo"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover rounded-full shadow-[0_0_12px_rgba(255,255,255,0.12)] border border-white/10 group-hover:border-white/25 transition-all"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (!target.src.includes('logo.jpg')) {
            target.src = '/logo.jpg';
          }
        }}
      />
    </div>
  );
};

export default Logo;
