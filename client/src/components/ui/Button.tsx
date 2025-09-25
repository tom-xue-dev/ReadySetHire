import React from 'react';
import { cn } from './utils';

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'default';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({ className = '', variant = 'default', children, ...props }: ButtonProps) {
  const base = 'px-3 py-2 rounded-lg text-sm transition hover:opacity-90 active:scale-[.99]';
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-gray-900 text-white',
    ghost: 'bg-transparent hover:bg-gray-100',
    outline: 'border border-gray-300 bg-white',
    default: 'bg-gray-900 text-white',
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}


