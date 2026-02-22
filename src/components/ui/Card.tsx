import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid';
}

export function Card({ children, className, variant = 'glass', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl p-6 transition-all duration-300',
        variant === 'glass' 
          ? 'bg-glass backdrop-blur-md border border-glass-border shadow-xl' 
          : 'bg-forest-800 border border-forest-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
