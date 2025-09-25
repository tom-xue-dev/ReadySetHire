import React from 'react';
import { cn } from './utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200', className)} {...props}>
      {children}
    </div>
  );
}


