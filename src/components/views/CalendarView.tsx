// ============================================================
// OmniFlow - Time-Blocking Calendar View (Module D)
// ============================================================

import React, { useState, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Clock, GripVertical,
  Plus, ArrowRight, X
} from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import type { OmniItem } from '../../types';
import { cn, PRIORITY_BG } from '../../lib/utils';
import { formatDate, isToday } from '../../lib/nlp';

type CalendarViewMode = 'day' | 'week' | 'month';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function getWeekDates(date: Date): Date[] {
  const week = [];
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Go to Sunday
  for (let i = 0; i < 7; i++) {
    week.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return week;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function getItemsForDay(items: OmniItem[], day: Date): OmniItem[] {
  return items.filter(i => {
    if (!i.due_date && !i.start_date) return false;
    const d = new Date(i.due_date || i.start_date || '');
    return isSameDay(d, day);
  });
}

// Unscheduled sidebar items (no date)
function UnscheduledPanel({ items, onSchedule }: {
  items: OmniItem[];
  onSchedule: (itemId: string, date: Date, hour?: number) => void;
}) {
  const { setSelectedItemId } = useApp();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const unscheduled = items.filter(i =>
    !i.due_date && !i.start_date &&
    (i.type === 'Task' || i.type === 'Inbox') &&
    i.status !== 'Done' && i.status !== 'Archived'
  );

  return (
    <div className="w-64 border-l border-surface-200 flex flex-col bg-surface-50">
      <div className="p-4 border-b border-surface-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <Clock size={14} className="text-brand-500" />
          未排程任務
        </h3>
        <p className="text-xs text-gray-400">拖曳到行事曆排程</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {unscheduled.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400">所有任務已排程！</p>
          </div>
        ) : unscheduled.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={e => {
              e.dataTransfer.setData('itemId', item.id);
              setDraggingId(item.id);
            }}
            onDragEnd={() => setDraggingId(null)}
            onClick={() => setSelectedItemId(item.id)}
            className={cn(
              'flex items-center gap-2 p-2.5 bg-white border rounded-xl cursor-grab active:cursor-grabbing transition-all',
              draggingId === item.id
                ? 'opacity-50 scale-95 border-brand-300'
                : 'border-surface-200 hover:border-brand-200 hover:shadow-sm'
            )}
          >
            <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
              {item.priority !== 'None' && (
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full', PRIORITY_BG[item.priority])}>
                  {item.priority === 'High' ? '高' : item.priority === 'Medium' ? '中' : '低'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Event block displayed on calendar
function EventBlock({ item, compact = false }: { item: OmniItem; compact?: boolean }) {
  const { setSelectedItemId } = useApp();
  const colors = [
    'bg-brand-100 border-brand-400 text-brand-800',
    'bg-emerald-100 border-emerald-400 text-emerald-800',
    'bg-violet-100 border-violet-400 text-violet-800',
    'bg-amber-100 border-amber-400 text-amber-800',
  ];
  const colorIdx = item.title.charCodeAt(0) % colors.length;

  return (
    <div
      onClick={e => { e.stopPropagation(); setSelectedItemId(item.id); }}
      className={cn(
        'border-l-2 rounded-r-lg px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity',
        colors[colorIdx],
        compact ? 'text-xs' : 'text-xs'
      )}
    >
      <p className="font-medium truncate">{item.title}</p>
      {!compact && item.due_date && (
        <p className="opacity-70 text-xs">
          {new Date(item.due_date).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}

// Week / Day View
function WeekDayGrid({
  dates,
  items,
  onDrop,
  onHourClick,
}: {
  dates: Date[];
  items: OmniItem[];
  onDrop: (itemId: string, date: Date, hour: number) => void;
  onHourClick: (date: Date, hour: number) => void;
}) {
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent, date: Date, hour: number) {
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId) onDrop(itemId, date, hour);
  }

  const today = new Date();

  return (
    <div className="flex flex-1 overflow-auto">
      {/* Time column */}
      <div className="w-16 flex-shrink-0">
        <div className="h-10" /> {/* Header spacer */}
        {HOURS.map(h => (
          <div key={h} className="h-16 border-b border-surface-100 flex items-start justify-end pr-3 pt-1">
            <span className="text-xs text-gray-400 font-mono">
              {h.toString().padStart(2, '0')}:00
            </span>
          </div>
        ))}
      </div>

      {/* Day columns */}
      {dates.map(date => {
        const dayItems = getItemsForDay(items, date);
        const isCurrentDay = isSameDay(date, today);

        return (
          <div key={date.toISOString()} className="flex-1 border-l border-surface-100 min-w-[100px]">
            {/* Day header */}
            <div className={cn(
              'h-10 border-b border-surface-100 flex flex-col items-center justify-center',
              isCurrentDay && 'bg-brand-50'
            )}>
              <span className="text-xs text-gray-500">{DAYS[date.getDay()]}</span>
              <span className={cn(
                'text-sm font-bold leading-none',
                isCurrentDay ? 'text-brand-600' : 'text-gray-800'
              )}>
                {date.getDate()}
              </span>
            </div>

            {/* Hour slots */}
            {HOURS.map(hour => {
              const slotItems = dayItems.filter(i => {
                const d = new Date(i.due_date || i.start_date || '');
                return d.getHours() === hour;
              });

              return (
                <div
                  key={hour}
                  className="h-16 border-b border-surface-100 relative hover:bg-brand-50/30 transition-colors cursor-pointer group"
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, date, hour)}
                  onClick={() => onHourClick(date, hour)}
                >
                  {/* Plus hint on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={12} className="text-brand-400" />
                  </div>

                  {/* Events */}
                  <div className="absolute inset-0 p-1 space-y-0.5">
                    {slotItems.map(item => (
                      <EventBlock key={item.id} item={item} compact />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Month View
function MonthGrid({
  year,
  month,
  items,
  onDrop,
  onDayClick,
}: {
  year: number;
  month: number;
  items: OmniItem[];
  onDrop: (itemId: string, date: Date) => void;
  onDayClick: (date: Date) => void;
}) {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  function handleDrop(e: React.DragEvent, date: Date) {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId) onDrop(itemId, date);
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;
          const dayItems = getItemsForDay(items, date);
          const isCurrentDay = isSameDay(date, today);

          return (
            <div
              key={date.toISOString()}
              className={cn(
                'min-h-[100px] p-1.5 rounded-xl border transition-colors cursor-pointer hover:border-brand-200',
                isCurrentDay ? 'border-brand-400 bg-brand-50' : 'border-surface-100 bg-white hover:bg-surface-50'
              )}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, date)}
              onClick={() => onDayClick(date)}
            >
              <div className={cn(
                'text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full',
                isCurrentDay ? 'bg-brand-500 text-white' : 'text-gray-700'
              )}>
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayItems.slice(0, 3).map(item => (
                  <EventBlock key={item.id} item={item} compact />
                ))}
                {dayItems.length > 3 && (
                  <p className="text-xs text-gray-400 pl-1">+{dayItems.length - 3} 個</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarView() {
  const { items, updateItem } = useApp();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const scheduledItems = items.filter(i =>
    (i.due_date || i.start_date) && i.status !== 'Archived'
  );

  function navigate(direction: 1 | -1) {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + direction);
    else if (viewMode === 'week') d.setDate(d.getDate() + direction * 7);
    else d.setMonth(d.getMonth() + direction);
    setCurrentDate(d);
  }

  function handleDrop(itemId: string, date: Date, hour = 9) {
    const targetDate = new Date(date);
    targetDate.setHours(hour, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(hour + 1, 0, 0, 0);

    updateItem(itemId, {
      start_date: targetDate.toISOString(),
      due_date: endDate.toISOString(),
      status: 'Todo',
    });
  }

  function handleHourClick(date: Date, hour: number) {
    // Handled by detail drawer via selected item
  }

  function getHeaderTitle(): string {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    }
    if (viewMode === 'week') {
      const week = getWeekDates(currentDate);
      return `${week[0].toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })} – ${week[6].toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
  }

  const weekDates = viewMode === 'week'
    ? getWeekDates(currentDate)
    : viewMode === 'day'
    ? [currentDate]
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-medium bg-surface-100 text-gray-600 hover:bg-surface-200 rounded-lg transition-colors"
          >
            今天
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-500">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-500">
              <ChevronRight size={16} />
            </button>
          </div>
          <h2 className="text-base font-bold text-gray-900">{getHeaderTitle()}</h2>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-surface-100 rounded-xl p-1">
          {(['day', 'week', 'month'] as CalendarViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                viewMode === mode
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {mode === 'day' ? '日' : mode === 'week' ? '週' : '月'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          {viewMode === 'month' ? (
            <MonthGrid
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
              items={scheduledItems}
              onDrop={(id, date) => handleDrop(id, date)}
              onDayClick={date => setCurrentDate(date)}
            />
          ) : (
            <WeekDayGrid
              dates={weekDates}
              items={scheduledItems}
              onDrop={handleDrop}
              onHourClick={handleHourClick}
            />
          )}
        </div>

        {/* Unscheduled Panel */}
        <UnscheduledPanel items={items} onSchedule={handleDrop} />
      </div>
    </div>
  );
}
