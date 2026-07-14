// ============================================================
// OmniFlow - Utility Functions
// ============================================================

import type { OmniItem, ItemType, ItemStatus, ItemPriority } from '../types';

export function generateId(): string {
  // Use crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function createNewItem(
  overrides: Partial<OmniItem> & { title: string; user_id: string }
): OmniItem {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    user_id: overrides.user_id,
    title: overrides.title,
    content: overrides.content ?? '',
    type: overrides.type ?? 'Inbox',
    status: overrides.status ?? 'Todo',
    priority: overrides.priority ?? 'None',
    start_date: overrides.start_date,
    due_date: overrides.due_date,
    project_id: overrides.project_id ?? null,
    tags: overrides.tags ?? [],
    backlinks: overrides.backlinks ?? [],
    subtasks: overrides.subtasks ?? [],
    created_at: now,
    updated_at: now,
    synced: false,
  };
}

export const ANONYMOUS_USER_ID = 'anonymous';

export const PRIORITY_COLORS: Record<ItemPriority, string> = {
  High: 'text-red-500',
  Medium: 'text-amber-500',
  Low: 'text-blue-400',
  None: 'text-gray-400',
};

export const PRIORITY_BG: Record<ItemPriority, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-blue-100 text-blue-700',
  None: 'bg-gray-100 text-gray-600',
};

export const STATUS_COLORS: Record<ItemStatus, string> = {
  Backlog: 'bg-gray-200 text-gray-700',
  Todo: 'bg-sky-100 text-sky-700',
  'In Progress': 'bg-violet-100 text-violet-700',
  Done: 'bg-green-100 text-green-700',
  Archived: 'bg-gray-100 text-gray-500',
};

export const TYPE_ICONS: Record<ItemType, string> = {
  Inbox: '📥',
  Task: '✅',
  Project: '📁',
  Note: '📝',
};

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, length = 80): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function getSubtaskProgress(subtasks: OmniItem['subtasks'] = []): {
  done: number;
  total: number;
  percent: number;
} {
  const total = subtasks.length;
  const done = subtasks.filter(s => s.done).length;
  return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

// Simple markdown to plain text (for preview)
export function markdownToPlain(md: string): string {
  return md
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .trim();
}
