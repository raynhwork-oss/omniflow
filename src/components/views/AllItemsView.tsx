// ============================================================
// OmniFlow — All Items View · Warm Cat Theme Edition 🐾
// ============================================================

import React, { useState } from 'react';
import { SortAsc } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { ItemCard } from '../items/ItemCard';
import { cn } from '../../lib/utils';
import type { ItemType, ItemPriority } from '../../types';

const TYPE_FILTERS: { id: ItemType | 'all'; label: string; emoji: string }[] = [
  { id: 'all',     label: '全部',   emoji: '🗂️' },
  { id: 'Inbox',   label: '收件夾', emoji: '📥' },
  { id: 'Task',    label: '任務',   emoji: '✅' },
  { id: 'Project', label: '專案',   emoji: '📁' },
  { id: 'Note',    label: '筆記',   emoji: '📝' },
];

const SORT_OPTIONS = [
  { id: 'updated',  label: '最近更新' },
  { id: 'created',  label: '建立時間' },
  { id: 'priority', label: '優先級' },
  { id: 'title',    label: '標題 A-Z' },
] as const;

type SortKey = typeof SORT_OPTIONS[number]['id'];
const PRIORITY_ORDER: Record<ItemPriority, number> = { High: 0, Medium: 1, Low: 2, None: 3 };

export function AllItemsView() {
  const { filteredItems } = useApp();
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [sortOpen, setSortOpen] = useState(false);

  const allItems = filteredItems({ view: 'all' });
  const filtered = typeFilter === 'all' ? allItems : allItems.filter(i => i.type === typeFilter);

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
    <div className="flex flex-col h-full" style={{background:'#FDFBF7'}}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4" style={{borderBottom:'1.5px dashed #EDDECC'}}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🗂️</span>
            <div>
              <h1 className="text-base font-extrabold" style={{color:'#3E2723'}}>全部項目</h1>
              <p className="text-xs font-semibold mt-0.5" style={{color:'#8D6E63'}}>{sorted.length} 個項目</p>
            </div>
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all"
              style={{background:'#FAF6F0', border:'1.5px solid #EDDECC', color:'#8D6E63'}}
            >
              <SortAsc size={12}/>
              {currentSortLabel}
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 warm-card z-50 overflow-hidden animate-fade-in">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortKey(opt.id); setSortOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs font-semibold transition-colors"
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

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_FILTERS.map(f => {
            const count = f.id === 'all' ? allItems.length : allItems.filter(i => i.type === f.id).length;
            const isActive = typeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all"
                style={isActive ? {
                  background: '#FFF8ED',
                  border: '1.5px solid #FFB74D',
                  color: '#E65100',
                  boxShadow: '0 2px 8px rgba(255,183,77,0.25)',
                } : {
                  background: '#FAF6F0',
                  border: '1.5px solid #EDDECC',
                  color: '#8D6E63',
                }}
              >
                <span>{f.emoji}</span>
                {f.label}
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={isActive ? {background:'#FFB74D', color:'#FFF'} : {background:'#F5EBE0', color:'#A1887F'}}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center animate-float"
              style={{background:'#FFF8ED', border:'1.5px dashed #FFB74D'}}>
              <span className="text-4xl">🐱</span>
            </div>
            <div className="text-center">
              <p className="font-bold" style={{color:'#5D3A1A'}}>沒有找到項目</p>
              <p className="text-sm mt-1" style={{color:'#8D6E63'}}>試著切換篩選條件</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map(item => <ItemCard key={item.id} item={item}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
