// ============================================================
// OmniFlow — ItemCard · Dark + Micro-interactions Edition
// ============================================================

import React, { useState } from 'react';
import { Calendar, Tag, ChevronRight, Folder, FileText, Inbox } from 'lucide-react';
import type { OmniItem } from '../../types';
import { useApp } from '../../store/useAppStore';
import { formatDate, isOverdue, isToday } from '../../lib/nlp';
import {
  cn, PRIORITY_DOT_CLASS, PRIORITY_BADGE_CLASS, PRIORITY_LABEL,
  getSubtaskProgress, truncate,
} from '../../lib/utils';

interface ItemCardProps {
  item: OmniItem;
  compact?: boolean;
  dragging?: boolean;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  Inbox:   <Inbox   size={12} className="text-cyan-400"/>,
  Task:    <span className="text-xs">✅</span>,
  Project: <Folder  size={12} className="text-violet-400"/>,
  Note:    <FileText size={12} className="text-emerald-400"/>,
};

/* Check button with spring animation */
function CheckButton({ done, onToggle }: { done: boolean; onToggle: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200',
        done
          ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
          : 'border-slate-600 hover:border-emerald-400 hover:shadow-[0_0_8px_rgba(52,211,153,0.25)]',
      )}
      style={{ marginTop: '2px' }}
    >
      {done && (
        <svg width="8" height="8" viewBox="0 0 8 8" className="animate-check-pop">
          <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      )}
    </button>
  );
}

export function ItemCard({ item, compact = false, dragging = false }: ItemCardProps) {
  const { setSelectedItemId, selectedItemId, updateItem } = useApp();
  const isSelected = selectedItemId === item.id;
  const overdue    = isOverdue(item.due_date) && item.status !== 'Done';
  const today      = isToday(item.due_date);
  const isDone     = item.status === 'Done';
  const progress   = getSubtaskProgress(item.subtasks);
  const hasPriority = item.priority && item.priority !== 'None';

  function toggleDone(e: React.MouseEvent) {
    e.stopPropagation();
    updateItem(item.id, { status: isDone ? 'Todo' : 'Done' });
  }

  return (
    <div
      onClick={() => setSelectedItemId(isSelected ? null : item.id)}
      data-dragging={dragging}
      className={cn(
        'group relative glass-card glass-card-hover cursor-pointer select-none transition-all duration-200',
        dragging    && 'shadow-glow-md scale-[1.03] rotate-1 opacity-90',
        isSelected  && 'border-brand-500/40 shadow-glow-sm',
        isDone      && 'opacity-50',
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
      )}
    >
      {/* High priority left-edge accent */}
      {item.priority === 'High' && !isDone && (
        <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-rose-500 shadow-[0_0_6px_rgba(251,113,133,0.6)]"/>
      )}

      <div className="flex items-start gap-2.5">
        {/* Check circle */}
        <CheckButton done={isDone} onToggle={toggleDone}/>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Type + Title */}
          <div className="flex items-center gap-1.5 mb-0.5">
            {TYPE_ICON[item.type]}
            <h3 className={cn(
              'text-sm font-medium leading-snug transition-colors',
              isDone   ? 'line-through text-slate-600' : 'text-slate-200',
              isSelected && !isDone && 'text-brand-200',
            )}>
              {item.title}
            </h3>
          </div>

          {/* Content preview */}
          {!compact && item.content && (
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-1">
              {truncate(item.content.replace(/[#*`\[\]]/g, ''), 90)}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Priority dot + badge */}
            {hasPriority && (
              <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', PRIORITY_BADGE_CLASS[item.priority])}>
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', PRIORITY_DOT_CLASS[item.priority])}/>
                {PRIORITY_LABEL[item.priority]}
              </span>
            )}

            {/* Due date */}
            {item.due_date && (
              <span className={cn(
                'flex items-center gap-1 text-xs',
                overdue ? 'text-rose-400' :
                today   ? 'text-amber-400' :
                          'text-slate-600',
              )}>
                <Calendar size={10}/>
                {formatDate(item.due_date)}
              </span>
            )}

            {/* Tags */}
            {item.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs text-brand-400 bg-brand-600/15 border border-brand-500/20 px-1.5 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-xs text-slate-600">+{item.tags.length - 2}</span>
            )}
          </div>

          {/* Subtask progress */}
          {progress.total > 0 && !compact && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600">{progress.done}/{progress.total} 子任務</span>
                <span className="text-xs text-slate-600">{progress.percent}%</span>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-brand-500 to-emerald-400 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight
          size={13}
          className={cn(
            'flex-shrink-0 transition-all mt-0.5',
            isSelected ? 'text-brand-400 rotate-90' : 'text-slate-700 group-hover:text-slate-500',
          )}
        />
      </div>

      {/* Overdue pulse dot */}
      {overdue && !isDone && (
        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_rgba(251,113,133,0.7)]"/>
      )}
    </div>
  );
}
