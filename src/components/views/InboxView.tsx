// ============================================================
// OmniFlow — InboxView · Dark Edition
// ============================================================

import React, { useState } from 'react';
import { Inbox, Star, AlertTriangle, Clock, SortAsc, CheckCircle2, ChevronDown } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { ItemCard } from '../items/ItemCard';
import { isOverdue, isToday } from '../../lib/nlp';
import { cn } from '../../lib/utils';
import type { OmniItem, ViewType } from '../../types';

type FilterType = 'all' | 'today' | 'overdue' | 'high' | 'done';
type SortKey    = 'due_date' | 'priority' | 'updated_at' | 'title';

const FILTERS: { id: FilterType; label: string; icon: React.ReactNode; activeClass: string }[] = [
  { id: 'all',     label: '全部',    icon: <Inbox         size={12}/>, activeClass: 'bg-brand-600/25 border-brand-500/40 text-brand-300' },
  { id: 'today',   label: '今天',    icon: <Star          size={12}/>, activeClass: 'bg-amber-500/15 border-amber-500/35 text-amber-300' },
  { id: 'overdue', label: '已過期',  icon: <AlertTriangle size={12}/>, activeClass: 'bg-rose-500/15  border-rose-500/35  text-rose-300'  },
  { id: 'high',    label: '高優先',  icon: <Clock         size={12}/>, activeClass: 'bg-violet-500/15 border-violet-500/35 text-violet-300' },
  { id: 'done',    label: '已完成',  icon: <CheckCircle2  size={12}/>, activeClass: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300' },
];

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'due_date',   label: '截止時間' },
  { id: 'priority',   label: '優先級' },
  { id: 'updated_at', label: '最近更新' },
  { id: 'title',      label: '標題' },
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
      default: return 0;
    }
  });
}

export function InboxView({ view }: { view: ViewType }) {
  const { filteredItems } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortKey,  setSortKey]  = useState<SortKey>('due_date');
  const [showSort, setShowSort] = useState(false);

  const base = filteredItems({ view });

  const displayItems = sortItems(
    activeFilter === 'today'   ? base.filter(i => i.due_date && isToday(i.due_date) && i.status !== 'Done')    :
    activeFilter === 'overdue' ? base.filter(i => i.due_date && isOverdue(i.due_date) && i.status !== 'Done')  :
    activeFilter === 'high'    ? base.filter(i => i.priority === 'High' && i.status !== 'Done')                :
    activeFilter === 'done'    ? base.filter(i => i.status === 'Done')                                         :
                                 base.filter(i => i.status !== 'Done'),
    activeFilter === 'done' ? 'updated_at' : sortKey,
  );

  const VIEW_LABEL: Record<ViewType, string> = {
    inbox: '收件夾', today: '今日專注', all: '全部項目',
    kanban: '專案看板', calendar: '行事曆', notes: '所有筆記',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-bold text-slate-100">{VIEW_LABEL[view]}</h1>
          <span className="text-xs text-slate-600 bg-dark-500 border border-white/07 px-2.5 py-1 rounded-full">
            {displayItems.length} 個項目
          </span>
        </div>
      </div>

      {/* Filter tabs + sort */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
                activeFilter === f.id
                  ? f.activeClass
                  : 'border-white/07 text-slate-500 bg-dark-600 hover:border-white/12 hover:text-slate-300',
              )}
            >
              {f.icon}{f.label}
            </button>
          ))}

          {/* Sort dropdown */}
          <div className="relative ml-auto flex-shrink-0">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 border border-white/07 bg-dark-600 hover:border-white/12 hover:text-slate-300 whitespace-nowrap transition-all"
            >
              <SortAsc size={11}/>
              {SORT_OPTIONS.find(s => s.id === sortKey)?.label}
              <ChevronDown size={10} className={cn('transition-transform', showSort && 'rotate-180')}/>
            </button>

            {showSort && (
              <div className="absolute right-0 top-full mt-1 glass-card z-30 min-w-32 overflow-hidden animate-fade-in">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortKey(opt.id); setShowSort(false); }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/05',
                      sortKey === opt.id ? 'text-brand-300 font-semibold' : 'text-slate-400',
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

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-500 border border-white/07 flex items-center justify-center mb-4 animate-float">
              <Inbox size={28} className="text-slate-600"/>
            </div>
            <p className="text-slate-400 font-medium mb-1">
              {activeFilter === 'today'   ? '今天沒有任務' :
               activeFilter === 'overdue' ? '沒有過期項目 🎉' :
               activeFilter === 'high'    ? '沒有高優先任務' :
               activeFilter === 'done'    ? '還沒有完成的項目' :
                                            '收件夾是空的'}
            </p>
            <p className="text-slate-600 text-sm">使用上方快速捕捉列新增</p>
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
