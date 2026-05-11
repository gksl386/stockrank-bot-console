import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium';
  const variantClass = variant === 'outline' ? 'border-zinc-200 bg-transparent' : 'border-transparent bg-zinc-900 text-white';
  return <span className={cn(base, variantClass, className)} {...props} />;
}
