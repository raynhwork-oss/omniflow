// ============================================================
// OmniFlow - Utility Functions (Warm Cat Theme Edition)
// ============================================================

import type { OmniItem, ItemType, ItemStatus, ItemPriority } from '../types';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function todayIso(): string {
  const now = new Date();
  now.setHours(9, 0, 0, 0);
  return now.toISOString();
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
    start_date: overrides.start_date ?? todayIso(),
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

// ── Priority (Warm Theme) ─────────────────────────────────
export const PRIORITY_DOT_CLASS: Record<ItemPriority, string> = {
  High:   'priority-dot-high',
  Medium: 'priority-dot-medium',
  Low:    'priority-dot-low',
  None:   'bg-espresso-300',
};

export const PRIORITY_BADGE_CLASS: Record<ItemPriority, string> = {
  High:   'badge-high',
  Medium: 'badge-medium',
  Low:    'badge-low',
  None:   'badge-none',
};

export const PRIORITY_LABEL: Record<ItemPriority, string> = {
  High: '高', Medium: '中', Low: '低', None: '—',
};

// Legacy aliases kept for compat
export const PRIORITY_COLORS: Record<ItemPriority, string> = {
  High: 'text-red-600', Medium: 'text-orange-500', Low: 'text-green-600', None: 'text-espresso-400',
};
export const PRIORITY_BG: Record<ItemPriority, string> = {
  High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low', None: 'badge-none',
};

// ── Status (Warm Theme) ───────────────────────────────────
export const STATUS_BADGE_CLASS: Record<ItemStatus, string> = {
  Backlog:      'badge-backlog',
  Todo:         'badge-todo',
  'In Progress':'badge-inprogress',
  Done:         'badge-done',
  Archived:     'badge-archived',
};
export const STATUS_COLORS: Record<ItemStatus, string> = STATUS_BADGE_CLASS;

export const STATUS_LABEL: Record<ItemStatus, string> = {
  Backlog: '待處理', Todo: '準備中', 'In Progress': '進行中', Done: '已完成', Archived: '已封存',
};

// ── Type ─────────────────────────────────────────────────
export const TYPE_ICONS: Record<ItemType, string> = {
  Inbox: '📥', Task: '✅', Project: '📁', Note: '📝',
};

// ── Helpers ──────────────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, length = 80): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function getSubtaskProgress(subtasks: OmniItem['subtasks'] = []): {
  done: number; total: number; percent: number;
} {
  const total = subtasks.length;
  const done  = subtasks.filter(s => s.done).length;
  return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

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
