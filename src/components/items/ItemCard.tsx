// ============================================================
// OmniFlow — ItemCard · Warm Cat Theme + Cat Paw Progress 🐾
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
  Inbox:   <span className="text-sm">📥</span>,
  Task:    <span className="text-sm">✅</span>,
  Project: <span className="text-sm">📁</span>,
  Note:    <span className="text-sm">📝</span>,
};

// ── Cat Paw Check Button ──────────────────────────────────
function PawCheckButton({ done, onToggle }: { done: boolean; onToggle: (e: React.MouseEvent) => void }) {
  const [popped, setPopped] = useState(false);

  function handleClick(e: React.MouseEvent) {
    setPopped(true);
    setTimeout(() => setPopped(false), 400);
    onToggle(e);
  }

  return (
    <button
      onClick={handleClick}
      style={{marginTop:'2px'}}
      className={cn(
        'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
        done
          ? 'border-orange-300 bg-orange-50 shadow-paw-glow'
          : 'border-cream-400 hover:border-orange-300 hover:bg-orange-50',
        popped && 'animate-paw-bounce',
      )}
      title={done ? '標為未完成' : '標為完成'}
    >
      {done ? (
        <span className="text-xs leading-none animate-check-pop">🐾</span>
      ) : (
        <span className="text-xs leading-none opacity-30">🐾</span>
      )}
    </button>
  );
}

// ── Cat Paw Progress Bar ──────────────────────────────────
function CatPawProgress({ done, total, percent }: { done: number; total: number; percent: number }) {
  const isComplete = percent >= 100;

  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold" style={{color:'#8D6E63'}}>{done}/{total} 子任務</span>
        <span className="text-xs font-bold" style={{color: isComplete ? '#2E7D32' : '#E65100'}}>
          {isComplete ? '🎉 完成！' : `${percent}%`}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-5 w-full cat-progress-track">
        {/* Fill */}
        <div
          className="cat-progress-fill h-full absolute left-0 top-0"
          style={{ width: `${Math.min(percent, 95)}%` }}
        />

        {/* Cat paw indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 ease-out z-10"
          style={{ left: `${Math.max(8, Math.min(percent, 94))}%` }}
        >
          <span className="text-base drop-shadow-sm" title={`${percent}% 完成`}>🐾</span>
        </div>

        {/* Goal: fish or yarn at end */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-sm">
          {isComplete ? '💀' : '🐟'}
        </div>
      </div>

      {isComplete && (
        <p className="text-xs font-semibold mt-1 text-center" style={{color:'#2E7D32'}}>
          小魚都吃掉了！🎊
        </p>
      )}
    </div>
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
        'group relative warm-card warm-card-hover cursor-pointer select-none transition-all duration-200',
        dragging    && 'shadow-warm-lg scale-[1.03] rotate-1 opacity-90',
        isSelected  && 'border-orange-300 shadow-warm-hover',
        isDone      && 'opacity-55',
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
      )}
    >
      {/* High priority left-edge accent — warm orange/red */}
      {item.priority === 'High' && !isDone && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
          style={{background:'linear-gradient(180deg, #EF5350, #FFB74D)', boxShadow:'0 0 6px rgba(239,83,80,0.5)'}}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Cat paw check */}
        <PawCheckButton done={isDone} onToggle={toggleDone}/>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Type + Title */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="flex-shrink-0">{TYPE_ICON[item.type]}</span>
            <h3 className={cn(
              'text-sm font-semibold leading-snug transition-colors',
              isDone    ? 'line-through opacity-50' : '',
              isSelected && !isDone ? '' : '',
            )}
            style={{color: isDone ? '#A1887F' : isSelected ? '#E65100' : '#3E2723'}}>
              {item.title}
            </h3>
          </div>

          {/* Content preview */}
          {!compact && item.content && (
            <p className="text-xs mt-0.5 leading-relaxed line-clamp-1" style={{color:'#8D6E63'}}>
              {truncate(item.content.replace(/[#*`\[\]]/g, ''), 90)}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {/* Priority badge */}
            {hasPriority && (
              <span className={cn('flex items-center gap-1 text-xs px-2 py-0.5 rounded-full', PRIORITY_BADGE_CLASS[item.priority])}>
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', PRIORITY_DOT_CLASS[item.priority])}/>
                {PRIORITY_LABEL[item.priority]}
              </span>
            )}

            {/* Due date */}
            {item.due_date && (
              <span className="flex items-center gap-1 text-xs font-semibold" style={{
                color: overdue ? '#C62828' : today ? '#E65100' : '#8D6E63'
              }}>
                {overdue ? '⚠️' : today ? '📅' : <Calendar size={10}/>}
                {formatDate(item.due_date)}
              </span>
            )}

            {/* Tags */}
            {item.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                style={{background:'#FFE8C2', border:'1.5px solid #FFB74D', color:'#E65100'}}>
                #{tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-xs font-medium" style={{color:'#A1887F'}}>+{item.tags.length - 2}</span>
            )}
          </div>

          {/* Cat Paw Progress */}
          {progress.total > 0 && !compact && (
            <CatPawProgress {...progress}/>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight
          size={14}
          className="flex-shrink-0 transition-all mt-1"
          style={{color: isSelected ? '#E68A00' : '#BCAAA4'}}
        />
      </div>

      {/* Overdue paw alert */}
      {overdue && !isDone && (
        <span className="absolute top-2.5 right-8 text-sm animate-pulse" title="已逾期！">🚨</span>
      )}
    </div>
  );
}
