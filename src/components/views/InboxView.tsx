// ============================================================
// OmniFlow - Inbox & To-Do View (Module A)
// ============================================================

import React, { useState } from 'react';
import {
  Inbox, Star, AlertTriangle, Clock, Filter, ChevronDown,
  SortAsc, CheckCircle2, Calendar
} from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { ItemCard } from '../items/ItemCard';
import { isOverdue, isToday } from '../../lib/nlp';
import { cn } from '../../lib/utils';
import type { OmniItem, ViewType } from '../../types';

type FilterType = 'all' | 'today' | 'overdue' | 'high' | 'done';

const FILTERS: { id: FilterType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'all', label: '全部', icon: <Inbox size={14} />, color: 'text-gray-600' },
  { id: 'today', label: '今天專注', icon: <Star size={14} />, color: 'text-amber-600' },
  { id: 'overdue', label: '已過期', icon: <AlertTriangle size={14} />, color: 'text-red-600' },
  { id: 'high', label: '高優先', icon: <Clock size={14} />, color: 'text-violet-600' },
  { id: 'done', label: '已完成', icon: <CheckCircle2 size={14} />, color: 'text-emerald-600' },
];

type SortKey = 'due_date' | 'priority' | 'updated_at' | 'title';
const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'due_date', label: '截止時間' },
  { id: 'priority', label: '優先級' },
  { id: 'updated_at', label: '最近更新' },
  { id: 'title', label: '標題' },
];
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2, None: 3 };

function sortItems(items: OmniItem[], key: SortKey): OmniItem[] {
  return [...items].sort((a, b) => {
    switch (key) {
      case 'due_date':
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      case 'priority':
        return (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3);
      case 'updated_at':
        return b.updated_at.localeCompare(a.updated_at);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}

export function InboxView({ view }: { view: ViewType }) {
  const { filteredItems, items } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortKey, setSortKey] = useState<SortKey>('due_date');
  const [showSort, setShowSort] = useState(false);

  function getItems() {
    let base = filteredItems({ view });

    switch (activeFilter) {
      case 'today':
        return sortItems(
          base.filter(i => i.due_date && isToday(i.due_date) && i.status !== 'Done'),
          sortKey
        );
      case 'overdue':
        return sortItems(
          base.filter(i => i.due_date && isOverdue(i.due_date) && i.status !== 'Done'),
          sortKey
        );
      case 'high':
        return sortItems(
          base.filter(i => i.priority === 'High' && i.status !== 'Done'),
          sortKey
        );
      case 'done':
        return sortItems(base.filter(i => i.status === 'Done'), 'updated_at');
      default:
        return sortItems(base.filter(i => i.status !== 'Done'), sortKey);
    }
  }

  const displayItems = getItems();

  const viewLabels: Record<ViewType, string> = {
    inbox: '收件夾',
    today: '今日任務',
    all: '全部項目',
    kanban: '專案看板',
    calendar: '行事曆',
    notes: '所有筆記',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">{viewLabels[view]}</h1>
          <span className="text-sm text-gray-400">{displayItems.length} 個項目</span>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all',
                activeFilter === f.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : `${f.color} bg-surface-100 hover:bg-surface-200`
              )}
            >
              {f.icon}
              {f.label}
            </button>
          ))}

          {/* Sort */}
          <div className="relative ml-auto flex-shrink-0">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 bg-surface-100 hover:bg-surface-200 whitespace-nowrap"
            >
              <SortAsc size={12} />
              {SORT_OPTIONS.find(s => s.id === sortKey)?.label}
              <ChevronDown size={12} className={cn('transition-transform', showSort && 'rotate-180')} />
            </button>

            {showSort && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-surface-200 rounded-xl shadow-xl z-30 min-w-32 overflow-hidden">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortKey(opt.id); setShowSort(false); }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-xs hover:bg-surface-50 transition-colors',
                      sortKey === opt.id ? 'text-brand-600 font-semibold bg-brand-50' : 'text-gray-700'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
              <Inbox size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">
              {activeFilter === 'all' ? '沒有待辦事項' :
                activeFilter === 'today' ? '今天沒有任務' :
                  activeFilter === 'overdue' ? '沒有過期項目，太棒了！' :
                    activeFilter === 'high' ? '沒有高優先任務' :
                      '沒有已完成項目'}
            </p>
            <p className="text-gray-400 text-sm">使用上方快速捕捉輸入框新增</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
