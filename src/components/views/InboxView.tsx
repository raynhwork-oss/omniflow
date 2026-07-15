// ============================================================
// OmniFlow — InboxView · Warm Cat Theme Edition 🐾
// ============================================================

import React, { useState } from 'react';
import { SortAsc, ChevronDown } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { ItemCard } from '../items/ItemCard';
import { isOverdue, isToday } from '../../lib/nlp';
import { cn } from '../../lib/utils';
import type { OmniItem, ViewType } from '../../types';

type FilterType = 'all' | 'today' | 'overdue' | 'high' | 'done';
type SortKey    = 'due_date' | 'priority' | 'updated_at' | 'title';

const FILTERS: { id: FilterType; label: string; emoji: string; color: string; activeBg: string; activeBorder: string }[] = [
  { id: 'all',     label: '全部',   emoji: '📋', color: '#5D3A1A', activeBg: '#FFF8ED',  activeBorder: '#FFB74D' },
  { id: 'today',   label: '今天',   emoji: '⭐', color: '#5D3A1A', activeBg: '#FFF8E1',  activeBorder: '#FFB74D' },
  { id: 'overdue', label: '已過期', emoji: '🚨', color: '#C62828', activeBg: '#FFF0F0',  activeBorder: '#EF5350' },
  { id: 'high',    label: '高優先', emoji: '🔥', color: '#C62828', activeBg: '#FFF3E0',  activeBorder: '#FF8A65' },
  { id: 'done',    label: '已完成', emoji: '✅', color: '#2E7D32', activeBg: '#E8F5E9',  activeBorder: '#66BB6A' },
];

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'due_date',   label: '截止時間' },
  { id: 'priority',   label: '優先級' },
  { id: 'updated_at', label: '最近更新' },
  { id: 'title',      label: '標題' },
];

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2, None: 3 };

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
      default: return 0;
    }
  });
}

const EMPTY_MSG: Record<FilterType, { emoji: string; title: string; sub: string }> = {
  all:     { emoji: '🐱', title: '收件夾空空的',       sub: '用上方快速捕捉列新增任務吧！' },
  today:   { emoji: '😸', title: '今天沒有任務！',      sub: '好好休息，或提前準備明天的工作～' },
  overdue: { emoji: '🎉', title: '沒有過期項目',        sub: '很厲害！一切都在掌控中～' },
  high:    { emoji: '😌', title: '沒有高優先任務',      sub: '輕鬆一下，或新增新的緊急任務' },
  done:    { emoji: '😿', title: '還沒有完成的項目',    sub: '加油！完成一個就能看到小魚～' },
};

export function InboxView({ view }: { view: ViewType }) {
  const { filteredItems } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortKey,  setSortKey]  = useState<SortKey>('due_date');
  const [showSort, setShowSort] = useState(false);

  const base = filteredItems({ view });

  const displayItems = sortItems(
    activeFilter === 'today'   ? base.filter(i => i.due_date && isToday(i.due_date) && i.status !== 'Done')   :
    activeFilter === 'overdue' ? base.filter(i => i.due_date && isOverdue(i.due_date) && i.status !== 'Done') :
    activeFilter === 'high'    ? base.filter(i => i.priority === 'High' && i.status !== 'Done')               :
    activeFilter === 'done'    ? base.filter(i => i.status === 'Done')                                        :
                                 base.filter(i => i.status !== 'Done'),
    activeFilter === 'done' ? 'updated_at' : sortKey,
  );

  const VIEW_META: Record<ViewType, { emoji: string; label: string }> = {
    inbox:    { emoji: '📥', label: '收件夾' },
    today:    { emoji: '⭐', label: '今日專注' },
    all:      { emoji: '🗂️', label: '全部項目' },
    kanban:   { emoji: '📋', label: '專案看板' },
    calendar: { emoji: '🗓️', label: '行事曆' },
    notes:    { emoji: '📝', label: '所有筆記' },
  };
  const { emoji, label } = VIEW_META[view];
  const emptyState = EMPTY_MSG[activeFilter];

  return (
    <div className="flex flex-col h-full" style={{background:'#FDFBF7'}}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{emoji}</span>
            <h1 className="text-lg font-extrabold" style={{color:'#3E2723'}}>{label}</h1>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{background:'#F5EBE0', color:'#8D6E63', border:'1.5px solid #EDDECC'}}>
            {displayItems.length} 個項目
          </span>
        </div>
      </div>

      {/* Filter pills + sort */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map(f => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all"
                style={isActive ? {
                  background: f.activeBg,
                  border: `1.5px solid ${f.activeBorder}`,
                  color: f.color,
                  boxShadow: `0 2px 8px ${f.activeBorder}30`
                } : {
                  background: '#FAF6F0',
                  border: '1.5px solid #EDDECC',
                  color: '#8D6E63',
                }}
              >
                <span>{f.emoji}</span>{f.label}
              </button>
            );
          })}

          {/* Sort */}
          <div className="relative ml-auto flex-shrink-0">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all"
              style={{background:'#FAF6F0', border:'1.5px solid #EDDECC', color:'#8D6E63'}}
            >
              <SortAsc size={12}/>
              {SORT_OPTIONS.find(s => s.id === sortKey)?.label}
              <ChevronDown size={10} className={cn('transition-transform', showSort && 'rotate-180')}/>
            </button>

            {showSort && (
              <div className="absolute right-0 top-full mt-1.5 warm-card z-30 min-w-32 overflow-hidden animate-fade-in">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortKey(opt.id); setShowSort(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors"
                    style={{color: sortKey === opt.id ? '#E68A00' : '#5D3A1A',
                            background: sortKey === opt.id ? '#FFF8ED' : 'transparent'}}
                    onMouseEnter={e => { if (sortKey !== opt.id) (e.currentTarget as HTMLElement).style.background = '#FAF6F0'; }}
                    onMouseLeave={e => { if (sortKey !== opt.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center animate-float"
              style={{background:'#FFF8ED', border:'1.5px dashed #FFB74D'}}>
              <span className="text-4xl">{emptyState.emoji}</span>
            </div>
            <div>
              <p className="font-bold text-base" style={{color:'#5D3A1A'}}>{emptyState.title}</p>
              <p className="text-sm mt-1" style={{color:'#8D6E63'}}>{emptyState.sub}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {displayItems.map(item => <ItemCard key={item.id} item={item}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
