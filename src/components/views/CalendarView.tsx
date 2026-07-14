// ============================================================
// OmniFlow — CalendarView · Fixed re-drag + Dark Edition
// Fix: calendar events are draggable (draggable attr), using
//      HTML5 DnD for both sidebar→calendar AND calendar→calendar.
// ============================================================

import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock, GripVertical, Plus, Move } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import type { OmniItem } from '../../types';
import { cn, PRIORITY_BADGE_CLASS, PRIORITY_LABEL } from '../../lib/utils';
import { isToday } from '../../lib/nlp';

type CalendarMode = 'day' | 'week' | 'month';

const HOURS   = Array.from({ length: 24 }, (_, i) => i);
const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

/* ── helpers ────────────────────────────────────────── */
function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, () => { const r = new Date(d); d.setDate(d.getDate() + 1); return r; });
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function itemsForDay(items: OmniItem[], day: Date) {
  return items.filter(i => {
    const ref = i.start_date || i.due_date;
    return ref && sameDay(new Date(ref), day);
  });
}

function getHour(item: OmniItem) {
  const ref = item.start_date || item.due_date;
  return ref ? new Date(ref).getHours() : 9;
}

/* ── Event block (draggable FROM calendar) ─────────── */
function CalEvent({ item }: { item: OmniItem }) {
  const { setSelectedItemId } = useApp();
  const PALETTE = [
    'bg-brand-600/25 border-brand-500/40 text-brand-200',
    'bg-emerald-600/20 border-emerald-500/35 text-emerald-200',
    'bg-violet-600/20 border-violet-500/35 text-violet-200',
    'bg-amber-600/20 border-amber-500/35 text-amber-200',
    'bg-cyan-600/20 border-cyan-500/35 text-cyan-200',
  ];
  const color = PALETTE[item.title.charCodeAt(0) % PALETTE.length];

  return (
    <div
      draggable
      onDragStart={e => {
        e.stopPropagation();
        e.dataTransfer.setData('itemId', item.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={e => { e.stopPropagation(); setSelectedItemId(item.id); }}
      className={cn(
        'border-l-2 rounded-r-lg px-2 py-1 mb-0.5 cursor-grab active:cursor-grabbing',
        'transition-all duration-150 hover:scale-[1.01] hover:shadow-glow-sm',
        color,
      )}
    >
      <div className="flex items-center gap-1">
        <Move size={9} className="opacity-40 flex-shrink-0"/>
        <p className="text-xs font-medium truncate">{item.title}</p>
      </div>
      {item.start_date && (
        <p className="text-xs opacity-60 ml-3">
          {new Date(item.start_date).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}

/* ── Unscheduled sidebar ───────────────────────────── */
function UnscheduledPanel({ items, onDrop }: {
  items: OmniItem[];
  onDrop: (id: string, date: Date, hour: number) => void;
}) {
  const { setSelectedItemId } = useApp();
  const unscheduled = items.filter(i =>
    !i.due_date && !i.start_date &&
    (i.type === 'Task' || i.type === 'Inbox') &&
    i.status !== 'Done' && i.status !== 'Archived',
  );

  return (
    <div className="w-60 border-l border-white/06 flex flex-col bg-dark-700/50">
      <div className="p-4 border-b border-white/06">
        <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-2 mb-1">
          <Clock size={13} className="text-brand-400"/>
          未排程任務
        </h3>
        <p className="text-xs text-slate-600">拖曳到行事曆格子中排程</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
        {unscheduled.length === 0 ? (
          <p className="text-xs text-slate-700 text-center py-6">所有任務已排程！</p>
        ) : unscheduled.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={e => { e.dataTransfer.setData('itemId', item.id); e.dataTransfer.effectAllowed = 'move'; }}
            onClick={() => setSelectedItemId(item.id)}
            className="flex items-center gap-2 p-2.5 glass-card glass-card-hover cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={12} className="text-slate-700 flex-shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{item.title}</p>
              {item.priority !== 'None' && (
                <span className={cn('text-xs px-1.5 py-0 rounded-full', PRIORITY_BADGE_CLASS[item.priority])}>
                  {PRIORITY_LABEL[item.priority]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Time slot ─────────────────────────────────────── */
function TimeSlot({ date, hour, slotItems, onDrop, onNewItem }: {
  date: Date; hour: number;
  slotItems: OmniItem[];
  onDrop: (id: string, date: Date, hour: number) => void;
  onNewItem: (date: Date, hour: number) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={cn(
        'h-16 border-b border-white/04 relative cursor-pointer group transition-colors',
        dragOver ? 'bg-brand-500/10 border-brand-500/20' : 'hover:bg-white/02',
      )}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault(); setDragOver(false);
        const id = e.dataTransfer.getData('itemId');
        if (id) onDrop(id, date, hour);
      }}
      onClick={() => onNewItem(date, hour)}
    >
      {/* Plus hint */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Plus size={11} className="text-brand-500/50"/>
      </div>
      {/* Events */}
      <div className="absolute inset-x-1 top-1 bottom-0 overflow-hidden">
        {slotItems.map(item => <CalEvent key={item.id} item={item}/>)}
      </div>
    </div>
  );
}

/* ── Week/Day grid ─────────────────────────────────── */
function WeekGrid({ dates, items, onDrop, onNewItem }: {
  dates: Date[];
  items: OmniItem[];
  onDrop: (id: string, date: Date, hour: number) => void;
  onNewItem: (date: Date, hour: number) => void;
}) {
  const today = new Date();

  return (
    <div className="flex flex-1 overflow-auto">
      {/* Hour column */}
      <div className="w-14 flex-shrink-0">
        <div className="h-10"/>
        {HOURS.map(h => (
          <div key={h} className="h-16 border-b border-white/04 flex items-start justify-end pr-2 pt-1">
            <span className="text-xs text-slate-700 font-mono">{h.toString().padStart(2,'0')}</span>
          </div>
        ))}
      </div>

      {/* Day columns */}
      {dates.map(date => {
        const dayItems  = itemsForDay(items, date);
        const isCurrent = sameDay(date, today);
        return (
          <div key={date.toISOString()} className="flex-1 border-l border-white/05 min-w-[100px]">
            {/* Day header */}
            <div className={cn(
              'h-10 border-b border-white/05 flex flex-col items-center justify-center',
              isCurrent && 'bg-brand-600/10',
            )}>
              <span className="text-xs text-slate-600">{DAY_NAMES[date.getDay()]}</span>
              <span className={cn(
                'text-sm font-bold leading-tight',
                isCurrent ? 'text-brand-300' : 'text-slate-400',
              )}>
                {date.getDate()}
              </span>
            </div>

            {/* Slots */}
            {HOURS.map(hour => (
              <TimeSlot
                key={hour}
                date={date}
                hour={hour}
                slotItems={dayItems.filter(i => getHour(i) === hour)}
                onDrop={onDrop}
                onNewItem={onNewItem}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ── Month grid ────────────────────────────────────── */
function MonthGrid({ year, month, items, onDrop, onDayClick }: {
  year: number; month: number;
  items: OmniItem[];
  onDrop: (id: string, date: Date, hour: number) => void;
  onDayClick: (date: Date) => void;
}) {
  const today    = new Date();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInM  = new Date(year, month + 1, 0).getDate();
  const cells: (Date|null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInM }, (_, i) => new Date(year, month, i + 1)),
  ];

  const [dragOverDay, setDragOverDay] = useState<string|null>(null);

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-600 py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, idx) => {
          if (!date) return <div key={`e${idx}`}/>;
          const key       = date.toDateString();
          const dayItems  = itemsForDay(items, date);
          const isCurrent = sameDay(date, today);
          const isOver    = dragOverDay === key;
          return (
            <div
              key={key}
              className={cn(
                'min-h-[90px] p-1.5 rounded-xl border cursor-pointer transition-all duration-150',
                isCurrent ? 'border-brand-500/40 bg-brand-600/08'
                           : 'border-white/06 bg-dark-600/40 hover:border-white/12',
                isOver && 'border-brand-400/50 bg-brand-500/10',
              )}
              onDragOver={e => { e.preventDefault(); setDragOverDay(key); }}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={e => {
                e.preventDefault(); setDragOverDay(null);
                const id = e.dataTransfer.getData('itemId');
                if (id) onDrop(id, date, 9);
              }}
              onClick={() => onDayClick(date)}
            >
              <div className={cn(
                'text-xs font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-full',
                isCurrent ? 'bg-brand-500 text-white' : 'text-slate-500',
              )}>
                {date.getDate()}
              </div>
              {dayItems.slice(0, 3).map(item => <CalEvent key={item.id} item={item}/>)}
              {dayItems.length > 3 && (
                <p className="text-xs text-slate-600 pl-1">+{dayItems.length - 3}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main View ─────────────────────────────────────── */
export function CalendarView() {
  const { items, updateItem } = useApp();
  const [mode, setMode]           = useState<CalendarMode>('week');
  const [currentDate, setCurrent] = useState(new Date());

  const scheduled = items.filter(i => (i.start_date || i.due_date) && i.status !== 'Archived');

  /* Schedule an item to a date+hour slot — works for both new drops AND re-drags */
  const handleDrop = useCallback((itemId: string, date: Date, hour: number) => {
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1, 0, 0, 0);
    updateItem(itemId, {
      start_date: start.toISOString(),
      due_date:   end.toISOString(),
    });
  }, [updateItem]);

  function handleNewItem(date: Date, hour: number) {
    /* Clicking on an empty slot scrolls/highlights — extend later */
  }

  function navigate(dir: 1 | -1) {
    const d = new Date(currentDate);
    if (mode === 'day')   d.setDate(d.getDate() + dir);
    else if (mode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrent(d);
  }

  function headerTitle() {
    if (mode === 'day')
      return currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    if (mode === 'week') {
      const w = getWeekDates(currentDate);
      return `${w[0].toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })} – ${w[6].toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
  }

  const weekDates = mode === 'week' ? getWeekDates(currentDate)
                  : mode === 'day'  ? [currentDate]
                  : [];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/06">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrent(new Date())}
            className="px-3 py-1.5 text-xs font-medium bg-dark-500 border border-white/07 text-slate-400 hover:border-brand-500/30 hover:text-brand-300 rounded-lg transition-all"
          >
            今天
          </button>
          <div className="flex items-center gap-0.5">
            <button onClick={() => navigate(-1)} className="btn-ghost p-1.5"><ChevronLeft size={15}/></button>
            <button onClick={() => navigate(1)}  className="btn-ghost p-1.5"><ChevronRight size={15}/></button>
          </div>
          <h2 className="text-sm font-bold text-slate-200">{headerTitle()}</h2>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-0.5 bg-dark-500 border border-white/07 rounded-xl p-1">
          {(['day','week','month'] as CalendarMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                mode === m
                  ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              {m === 'day' ? '日' : m === 'week' ? '週' : '月'}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          {mode === 'month'
            ? <MonthGrid year={currentDate.getFullYear()} month={currentDate.getMonth()} items={scheduled} onDrop={handleDrop} onDayClick={d => { setCurrent(d); setMode('day'); }}/>
            : <WeekGrid dates={weekDates} items={scheduled} onDrop={handleDrop} onNewItem={handleNewItem}/>
          }
        </div>
        <UnscheduledPanel items={items} onDrop={handleDrop}/>
      </div>
    </div>
  );
}
