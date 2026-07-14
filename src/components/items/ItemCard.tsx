// ============================================================
// OmniFlow - Item Card Component
// ============================================================

import React from 'react';
import {
  Calendar, Tag, CheckCircle2, Circle, AlertTriangle,
  Folder, FileText, Inbox, CheckSquare, ChevronRight
} from 'lucide-react';
import type { OmniItem } from '../../types';
import { useApp } from '../../store/useAppStore';
import { formatDate, isOverdue, isToday } from '../../lib/nlp';
import { cn, PRIORITY_BG, getSubtaskProgress, truncate, TYPE_ICONS } from '../../lib/utils';

interface ItemCardProps {
  item: OmniItem;
  compact?: boolean;
  dragging?: boolean;
}

const TYPE_ICON_MAP: Record<string, React.ReactNode> = {
  Inbox: <Inbox size={13} className="text-gray-400" />,
  Task: <CheckSquare size={13} className="text-sky-500" />,
  Project: <Folder size={13} className="text-violet-500" />,
  Note: <FileText size={13} className="text-emerald-500" />,
};

export function ItemCard({ item, compact = false, dragging = false }: ItemCardProps) {
  const { setSelectedItemId, selectedItemId, updateItem } = useApp();
  const isSelected = selectedItemId === item.id;
  const overdue = isOverdue(item.due_date) && item.status !== 'Done';
  const today = isToday(item.due_date);
  const subtaskProgress = getSubtaskProgress(item.subtasks);
  const isDone = item.status === 'Done';

  function toggleDone(e: React.MouseEvent) {
    e.stopPropagation();
    updateItem(item.id, {
      status: isDone ? 'Todo' : 'Done',
    });
  }

  return (
    <div
      onClick={() => setSelectedItemId(isSelected ? null : item.id)}
      className={cn(
        'group relative bg-white border rounded-xl transition-all cursor-pointer select-none',
        dragging ? 'shadow-2xl rotate-1 opacity-90 scale-105' : 'shadow-sm hover:shadow-md',
        isSelected ? 'border-brand-400 ring-1 ring-brand-200' : 'border-surface-200 hover:border-surface-300',
        isDone && 'opacity-60'
      )}
    >
      <div className={cn('p-3', compact && 'py-2.5')}>
        <div className="flex items-start gap-2.5">
          {/* Done toggle */}
          <button
            onClick={toggleDone}
            className={cn(
              'flex-shrink-0 mt-0.5 transition-colors',
              isDone ? 'text-emerald-500 hover:text-gray-400' : 'text-gray-300 hover:text-emerald-500'
            )}
          >
            {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Type + Title */}
            <div className="flex items-center gap-1.5 mb-0.5">
              {TYPE_ICON_MAP[item.type]}
              <h3 className={cn(
                'text-sm font-medium text-gray-900 leading-snug',
                isDone && 'line-through text-gray-400'
              )}>
                {item.title}
              </h3>
            </div>

            {/* Content preview */}
            {!compact && item.content && (
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                {truncate(item.content.replace(/[#*`\[\]]/g, ''), 100)}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* Priority */}
              {item.priority && item.priority !== 'None' && (
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', PRIORITY_BG[item.priority])}>
                  {item.priority === 'High' ? '高' : item.priority === 'Medium' ? '中' : '低'}
                </span>
              )}

              {/* Due date */}
              {item.due_date && (
                <span className={cn(
                  'flex items-center gap-1 text-xs',
                  overdue ? 'text-red-500 font-medium' :
                    today ? 'text-amber-600 font-medium' :
                      'text-gray-400'
                )}>
                  <Calendar size={11} />
                  {formatDate(item.due_date)}
                </span>
              )}

              {/* Tags */}
              {item.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
              {item.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{item.tags.length - 2}</span>
              )}
            </div>

            {/* Subtask progress */}
            {subtaskProgress.total > 0 && !compact && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">
                    {subtaskProgress.done}/{subtaskProgress.total} 子任務
                  </span>
                  <span className="text-xs text-gray-400">{subtaskProgress.percent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div
                    className="bg-emerald-500 h-1 rounded-full transition-all"
                    style={{ width: `${subtaskProgress.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Arrow indicator */}
          <ChevronRight
            size={14}
            className={cn(
              'flex-shrink-0 transition-all mt-0.5',
              isSelected ? 'text-brand-500 rotate-90' : 'text-gray-300 group-hover:text-gray-400'
            )}
          />
        </div>
      </div>

      {/* Overdue indicator */}
      {overdue && !isDone && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}
