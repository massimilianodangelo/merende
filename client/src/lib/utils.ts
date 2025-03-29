import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Get today's date with time set to specific hour
export function getTodayWithTime(hours: number, minutes: number): Date {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Check if current time is before the order deadline
export function isBeforeOrderDeadline(): boolean {
  // Rimozione limitazione oraria, sempre disponibile
  return true;
}

// Format date to human-readable string
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

// Format time to human-readable string
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

// Generate a random order number
export function generateOrderNumber(): string {
  return `#${Math.floor(10000 + Math.random() * 90000)}`;
}
