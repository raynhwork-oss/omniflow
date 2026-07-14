// ============================================================
// OmniFlow - All Items View
// ============================================================

import React, { useState } from 'react';
import { List, Filter, ChevronDown } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { ItemCard } from '../items/ItemCard';
import { cn } from '../../lib/utils';
import type { ItemType } from '../../types';

const TYPE_FILTERS: { id: ItemType | 'all'; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'Inbox', label: '收件夾' },
  { id: 'Task', label: '任務' },
  { id: 'Project', label: '專案' },
  { id: 'Note', label: '筆記' },
];

export function AllItemsView() {
  const { filteredItems } = useApp();
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all');

  const allItems = filteredItems({ view: 'all' });
  const displayItems = typeFilter === 'all'
    ? allItems
    : allItems.filter(i => i.type === typeFilter);

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">全部項目</h1>
          <span className="text-sm text-gray-400">{displayItems.length} 個項目</span>
        </div>
        <div className="flex items-center gap-1">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                typeFilter === f.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <List size={32} className="text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">沒有項目</p>
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
