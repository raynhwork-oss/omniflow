// ============================================================
// OmniFlow - Natural Language Processing for Quick Capture
// ============================================================

import type { ParsedInput, ItemPriority } from '../types';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function parseDateFromText(text: string): { date: Date | null; cleaned: string } {
  let cleaned = text;
  let date: Date | null = null;
  const now = new Date();

  // 明天 / tomorrow
  if (/明天|tomorrow/i.test(cleaned)) {
    date = new Date(now);
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
    cleaned = cleaned.replace(/明天|tomorrow/gi, '').trim();
  }
  // 後天 / day after tomorrow
  else if (/後天/i.test(cleaned)) {
    date = new Date(now);
    date.setDate(date.getDate() + 2);
    date.setHours(9, 0, 0, 0);
    cleaned = cleaned.replace(/後天/g, '').trim();
  }
  // 今天 / today
  else if (/今天|今日|today/i.test(cleaned)) {
    date = new Date(now);
    date.setHours(18, 0, 0, 0);
    cleaned = cleaned.replace(/今天|今日|today/gi, '').trim();
  }
  // 下周/下週 X
  else if (/下[週周]([一二三四五六日天])/i.test(cleaned)) {
    const match = cleaned.match(/下[週周]([一二三四五六日天])/i);
    if (match) {
      const dayNames = ['日', '一', '二', '三', '四', '五', '六', '天'];
      const dayIdx = dayNames.indexOf(match[1]);
      if (dayIdx !== -1) {
        date = new Date(now);
        const currentDay = date.getDay();
        const target = dayIdx === 7 ? 0 : dayIdx;
        const daysUntil = (target - currentDay + 7) % 7 || 7;
        date.setDate(date.getDate() + daysUntil + 7);
        date.setHours(9, 0, 0, 0);
        cleaned = cleaned.replace(match[0], '').trim();
      }
    }
  }
  // M月D日 / M/D
  else if (/(\d{1,2})[月\/](\d{1,2})[日號]?/.test(cleaned)) {
    const match = cleaned.match(/(\d{1,2})[月\/](\d{1,2})[日號]?/);
    if (match) {
      date = new Date(now.getFullYear(), parseInt(match[1]) - 1, parseInt(match[2]), 9, 0, 0);
      if (date < now) date.setFullYear(now.getFullYear() + 1);
      cleaned = cleaned.replace(match[0], '').trim();
    }
  }

  // Parse time if present: 上午/下午/早上 + hour
  if (date) {
    // 下午/晚上 X點 pattern
    const pmMatch = cleaned.match(/(下午|晚上|pm)\s*(\d{1,2})[:：]?(\d{0,2})/i);
    const amMatch = cleaned.match(/(上午|早上|am)\s*(\d{1,2})[:：]?(\d{0,2})/i);
    const timeMatch = cleaned.match(/(\d{1,2})[:：點](\d{0,2})/);

    if (pmMatch) {
      let h = parseInt(pmMatch[2]);
      if (h < 12) h += 12;
      date.setHours(h, parseInt(pmMatch[3] || '0'), 0, 0);
      cleaned = cleaned.replace(pmMatch[0], '').trim();
    } else if (amMatch) {
      let h = parseInt(amMatch[2]);
      if (h === 12) h = 0;
      date.setHours(h, parseInt(amMatch[3] || '0'), 0, 0);
      cleaned = cleaned.replace(amMatch[0], '').trim();
    } else if (timeMatch) {
      const h = parseInt(timeMatch[1]);
      const m = parseInt(timeMatch[2] || '0');
      date.setHours(h < 7 ? h + 12 : h, m, 0, 0); // assume PM if < 7
      cleaned = cleaned.replace(timeMatch[0], '').trim();
    }
  }

  return { date, cleaned };
}

function parsePriorityFromText(text: string): { priority: ItemPriority | undefined; cleaned: string } {
  let cleaned = text;
  let priority: ItemPriority | undefined;

  if (/!!high|!高|高優先|urgent|緊急/i.test(cleaned)) {
    priority = 'High';
    cleaned = cleaned.replace(/!!high|!高|高優先|urgent|緊急/gi, '').trim();
  } else if (/!!med|!中|中優先/i.test(cleaned)) {
    priority = 'Medium';
    cleaned = cleaned.replace(/!!med|!中|中優先/gi, '').trim();
  } else if (/!!low|!低|低優先/i.test(cleaned)) {
    priority = 'Low';
    cleaned = cleaned.replace(/!!low|!低|低優先/gi, '').trim();
  }

  return { priority, cleaned };
}

function parseTagsFromText(text: string): { tags: string[]; cleaned: string } {
  const tags: string[] = [];
  let cleaned = text;

  // Match #tag patterns
  const tagPattern = /#([\w\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]+)/g;
  const matches = text.match(tagPattern);

  if (matches) {
    for (const m of matches) {
      tags.push(m.slice(1));
    }
    cleaned = cleaned.replace(tagPattern, '').trim();
  }

  return { tags, cleaned };
}

export function parseNaturalInput(input: string): ParsedInput {
  let text = input.trim();

  // Parse tags first
  const { tags, cleaned: afterTags } = parseTagsFromText(text);
  text = afterTags;

  // Parse priority
  const { priority, cleaned: afterPriority } = parsePriorityFromText(text);
  text = afterPriority;

  // Parse date
  const { date, cleaned: afterDate } = parseDateFromText(text);
  text = afterDate;

  // Clean up extra whitespace
  const title = text.replace(/\s+/g, ' ').trim();

  return {
    title: title || input.trim(),
    due_date: date ? date.toISOString() : undefined,
    tags,
    priority,
  };
}

export function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((dateDay.getTime() - today.getTime()) / 86400000);

  const timeStr = d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `今天 ${timeStr}`;
  if (diffDays === 1) return `明天 ${timeStr}`;
  if (diffDays === -1) return `昨天 ${timeStr}`;
  if (diffDays > 1 && diffDays < 7) return `${diffDays}天後 ${timeStr}`;
  if (diffDays < 0) return `${Math.abs(diffDays)}天前`;

  return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function isOverdue(isoDate: string | undefined): boolean {
  if (!isoDate) return false;
  return new Date(isoDate) < new Date();
}

export function isToday(isoDate: string | undefined): boolean {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
