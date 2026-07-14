// ============================================================
// OmniFlow - All Items View — Dark Glassmorphism Edition
// ============================================================

import React, { useState } from 'react';
import { List, LayoutGrid, SortAsc } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { ItemCard } from '../items/ItemCard';
import { cn } from '../../lib/utils';
import type { ItemType, ItemPriority } from '../../types';

const TYPE_FILTERS: { id: ItemType | 'all'; label: string; accent: string; dot: string }[] = [
  { id: 'all',     label: '全部',   accent: 'text-slate-300',   dot: 'bg-slate-400' },
  { id: 'Inbox',   label: '收件夾', accent: 'text-cyan-400',    dot: 'bg-cyan-400' },
  { id: 'Task',    label: '任務',   accent: 'text-emerald-400', dot: 'bg-emerald-400' },
  { id: 'Project', label: '專案',   accent: 'text-violet-400',  dot: 'bg-violet-400' },
  { id: 'Note',    label: '筆記',   accent: 'text-amber-400',   dot: 'bg-amber-400' },
];

const SORT_OPTIONS = [
  { id: 'updated', label: '最近更新' },
  { id: 'created', label: '建立時間' },
  { id: 'priority', label: '優先級' },
  { id: 'title', label: '標題 A-Z' },
] as const;

type SortKey = typeof SORT_OPTIONS[number]['id'];

const PRIORITY_ORDER: Record<ItemPriority, number> = { High: 0, Medium: 1, Low: 2, None: 3 };

export function AllItemsView() {
  const { filteredItems } = useApp();
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [sortOpen, setSortOpen] = useState(false);

  const allItems = filteredItems({ view: 'all' });
  const filtered = typeFilter === 'all'
    ? allItems
    : allItems.filter(i => i.type === typeFilter);

  const sorted = [...filtered].sort((a, b) => {
    switch (sortKey) {
      case 'updated':  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'created':  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'priority': return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case 'title':    return a.title.localeCompare(b.title, 'zh-TW');
      default:         return 0;
    }
  });

  const currentSortLabel = SORT_OPTIONS.find(o => o.id === sortKey)?.label;

  return (
    <div className="flex flex-col h-full bg-dark-base">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500/30 to-slate-600/20 flex items-center justify-center border border-white/10">
              <LayoutGrid size={14} className="text-slate-300" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">全部項目</h1>
              <p className="text-xs text-slate-500 mt-0.5">{sorted.length} 個項目</p>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700/60 hover:bg-dark-600/80 border border-white/[0.07] text-xs text-slate-400 hover:text-slate-200 transition-all"
            >
              <SortAsc size={12} />
              {currentSortLabel}
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl z-50"
                style={{ background: 'rgba(20,24,36,0.97)', backdropFilter: 'blur(20px)' }}>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortKey(opt.id); setSortOpen(false); }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-xs transition-colors',
                      sortKey === opt.id
                        ? 'text-indigo-300 bg-indigo-500/10 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_FILTERS.map(f => {
            const count = f.id === 'all' ? allItems.length : allItems.filter(i => i.type === f.id).length;
            const isActive = typeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
                  isActive
                    ? 'bg-dark-500 border border-indigo-500/40 text-white shadow-glow-sm'
                    : 'bg-dark-800/50 border border-white/[0.05] text-slate-500 hover:text-slate-300 hover:border-white/[0.12]'
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', isActive ? f.dot : 'bg-slate-600')} />
                {f.label}
                <span className={cn(
                  'ml-0.5 px-1.5 py-0.5 rounded-full text-xs',
                  isActive ? 'bg-white/10 text-white/80' : 'bg-dark-700 text-slate-600'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-transparent">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-dark-700/60 border border-white/[0.06] flex items-center justify-center">
              <List size={24} className="text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm font-medium">沒有找到項目</p>
              <p className="text-slate-600 text-xs mt-1">試著切換篩選條件</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sorted.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
