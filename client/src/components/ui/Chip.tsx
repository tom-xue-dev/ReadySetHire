import React from 'react';
import { cn } from './utils';

type ChipColor = 'green' | 'yellow' | 'red' | 'gray';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: ChipColor;
}

export default function Chip({ children, color = 'gray', className, ...props }: ChipProps) {
  const colorMap: Record<ChipColor, string> = {
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <span className={cn('px-2 py-0.5 text-xs rounded-full border', colorMap[color], className)} {...props}>
      {children}
    </span>
  );
}


