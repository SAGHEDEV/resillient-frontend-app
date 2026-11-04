import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// cn() merges Tailwind classes intelligently — avoids conflicting class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
