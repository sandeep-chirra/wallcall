import {WallCalEvent} from '../data/types';
import {CATEGORIES} from '../data/constants';

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDaysToDate(dateStr: string, days: number): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getDaysUntil(event: WallCalEvent): number | null {
  if (!event.date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const parts = event.date.split('-');
  let target = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10),
  );

  if (event.category === 'birthday' || event.category === 'anniversary') {
    target.setFullYear(now.getFullYear());
    if (target < now) target.setFullYear(now.getFullYear() + 1);
  } else if (event.category === 'payment' || event.category === 'loan') {
    const day = target.getDate();
    target = new Date(now.getFullYear(), now.getMonth(), day);
    if (target < now) target = new Date(now.getFullYear(), now.getMonth() + 1, day);
  }

  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatEventDate(event: WallCalEvent): string {
  if (!event.date) return '';
  const d = new Date(event.date + 'T00:00:00');
  const isRecurringYearly = event.category === 'birthday' || event.category === 'anniversary';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: isRecurringYearly ? undefined : 'numeric',
  });
}

export function getCategoryColor(categoryId: string): string {
  return CATEGORIES.find(c => c.id === categoryId)?.color ?? '#6b6560';
}

export function getCategoryIcon(categoryId: string): string {
  return CATEGORIES.find(c => c.id === categoryId)?.icon ?? '📌';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
