import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AxiosError } from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getApiErrorMessage = (err: unknown): string | undefined =>
  err instanceof AxiosError
    ? (err.response?.data as { error?: string } | undefined)?.error
    : undefined;
