// lib/utils.ts
import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatUsd(value: number, digits = 4): string {
  return `$${(value || 0).toFixed(digits)}`;
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function statusColor(status: string): string {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'partial':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'running':
    case 'queued':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  }
}
