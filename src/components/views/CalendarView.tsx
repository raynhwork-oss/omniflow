// ============================================================
// OmniFlow — CalendarView · Warm Cat Theme + Cat Paw Pins 🐾
// ============================================================

import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock, GripVertical, Plus } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import type { OmniItem } from '../../types';
import { cn, PRIORITY_BADGE_CLASS, PRIORITY_LABEL } from '../../lib/utils';
import { isToday } from '../../lib/nlp';

type CalendarMode = 'day' | 'week' | 'month';

const HOURS    = Array.from({ length: 24 }, (_, i) => i);
const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

// Warm event colors per title hash
const WARM_PALETTE = [
  { bg: '#FFF3E0', border: '#FFB74D', text: '#BF360C' },
  { bg: '#E8F5E9', border: '#66BB6A', text: '#1B5E20' },
  { bg: '#FFF8E1', border: '#FFCA28', text: '#E65100' },
  { bg: '#FCE4EC', border: '#F06292', text: '#880E4F' },
  { bg: '#E8EAF6', border: '#7986CB', text: '#1A237E' },
];

function getWarmColor(title: string) {
  return WARM_PALETTE[title.charCodeAt(0) % WARM_PALETTE.length];
}

/* ── helpers ─────────────────────────────────────────── */
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

/* ── Cat Paw Event Block (draggable) ──────────────────── */
function CalEvent({ item }: { item: OmniItem }) {
  const { setSelectedItemId } = useApp();
  const clr = getWarmColor(item.title);

  return (
    <div
      draggable
      onDragStart={e => {
        e.stopPropagation();
        e.dataTransfer.setData('itemId', item.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={e => { e.stopPropagation(); setSelectedItemId(item.id); }}
      className="rounded-xl px-2 py-1 mb-0.5 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5"
      style={{
        background: clr.bg,
        border: `1.5px solid ${clr.border}`,
        boxShadow: `0 1px 4px ${clr.border}30`,
      }}
    >
      <div className="flex items-center gap-1">
        <span className="text-xs flex-shrink-0">🐾</span>
        <p className="text-xs font-semibold truncate" style={{color: clr.text}}>{item.title}</p>
      </div>
      {item.start_date && (
        <p className="text-xs ml-4 opacity-70 font-medium" style={{color: clr.text}}>
          {new Date(item.start_date).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}

/* ── Unscheduled sidebar ──────────────────────────────── */
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
    <div className="w-64 flex flex-col" style={{
      background: '#FAF6F0',
      borderLeft: '1.5px dashed #EDDECC',
    }}>
      <div className="p-4" style={{borderBottom:'1.5px dashed #EDDECC'}}>
        <h3 className="text-xs font-bold flex items-center gap-2 mb-1" style={{color:'#3E2723'}}>
          <span>⏰</span> 未排程任務
        </h3>
        <p className="text-xs font-medium" style={{color:'#8D6E63'}}>拖曳到行事曆格子中排程 🐾</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
        {unscheduled.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">😸</p>
            <p className="text-xs font-semibold" style={{color:'#A1887F'}}>所有任務已排程！</p>
          </div>
        ) : unscheduled.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={e => { e.dataTransfer.setData('itemId', item.id); e.dataTransfer.effectAllowed = 'move'; }}
            onClick={() => setSelectedItemId(item.id)}
            className="flex items-center gap-2 p-2.5 warm-card warm-card-hover cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={12} style={{color:'#BCAAA4'}} className="flex-shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{color:'#3E2723'}}>{item.title}</p>
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

/* ── Time slot ────────────────────────────────────────── */
function TimeSlot({ date, hour, slotItems, onDrop, onNewItem }: {
  date: Date; hour: number;
  slotItems: OmniItem[];
  onDrop: (id: string, date: Date, hour: number) => void;
  onNewItem: (date: Date, hour: number) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className="h-16 relative cursor-pointer group transition-colors"
      style={{
        borderBottom: '1px dashed #EDDECC',
        background: dragOver ? 'rgba(255,183,77,0.08)' : 'transparent',
      }}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault(); setDragOver(false);
        const id = e.dataTransfer.getData('itemId');
        if (id) onDrop(id, date, hour);
      }}
      onClick={() => onNewItem(date, hour)}
    >
      {/* Cat paw hover hint */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-lg opacity-30">🐾</span>
      </div>
      {/* Events */}
      <div className="absolute inset-x-1 top-1 bottom-0 overflow-hidden">
        {slotItems.map(item => <CalEvent key={item.id} item={item}/>)}
      </div>
      {/* Drag over glow */}
      {dragOver && (
        <div className="absolute inset-0 rounded-lg pointer-events-none"
          style={{border:'2px dashed #FFB74D', background:'rgba(255,183,77,0.08)'}}
        />
      )}
    </div>
  );
}

/* ── Week/Day grid ────────────────────────────────────── */
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
      <div className="w-16 flex-shrink-0">
        <div className="h-12"/>
        {HOURS.map(h => (
          <div key={h} className="h-16 flex items-start justify-end pr-3 pt-1"
            style={{borderBottom:'1px dashed #EDDECC'}}>
            <span className="text-xs font-bold font-mono" style={{color:'#BCAAA4'}}>
              {h.toString().padStart(2,'0')}
            </span>
          </div>
        ))}
      </div>

      {/* Day columns */}
      {dates.map(date => {
        const dayItems  = itemsForDay(items, date);
        const isCurrent = sameDay(date, today);
        return (
          <div key={date.toISOString()} className="flex-1 min-w-[100px]"
            style={{borderLeft:'1.5px dashed #EDDECC'}}>
            {/* Day header */}
            <div className="h-12 flex flex-col items-center justify-center"
              style={{
                borderBottom: '1.5px dashed #EDDECC',
                background: isCurrent ? '#FFF8ED' : '#FAF6F0',
              }}>
              <span className="text-xs font-bold" style={{color:'#A1887F'}}>{DAY_NAMES[date.getDay()]}</span>
              <span className="text-sm font-extrabold leading-tight"
                style={{
                  color: isCurrent ? '#FFFFFF' : '#3E2723',
                  background: isCurrent ? '#FFB74D' : 'transparent',
                  borderRadius: '50%',
                  width: '24px', height: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                {date.getDate()}
              </span>
            </div>
            {/* Slots */}
            {HOURS.map(hour => (
              <TimeSlot
                key={hour} date={date} hour={hour}
                slotItems={dayItems.filter(i => getHour(i) === hour)}
                onDrop={onDrop} onNewItem={onNewItem}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ── Month grid with cat paw pins ─────────────────────── */
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
          <div key={d} className="text-center text-xs font-bold py-2" style={{color:'#A1887F'}}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, idx) => {
          if (!date) return <div key={`e${idx}`}/>;
          const key      = date.toDateString();
          const dayItems = itemsForDay(items, date);
          const isNow    = sameDay(date, today);
          const isOver   = dragOverDay === key;
          return (
            <div
              key={key}
              className="min-h-[100px] p-2 rounded-2xl cursor-pointer transition-all"
              style={{
                background: isNow ? '#FFF8ED' : isOver ? 'rgba(255,183,77,0.08)' : '#FFFFFF',
                border: isNow
                  ? '1.5px solid #FFB74D'
                  : isOver
                  ? '1.5px dashed #FFB74D'
                  : '1.5px solid #EDDECC',
                boxShadow: isNow ? '0 2px 8px rgba(255,183,77,0.2)' : '0 1px 4px rgba(139,90,43,0.06)',
              }}
              onDragOver={e => { e.preventDefault(); setDragOverDay(key); }}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={e => {
                e.preventDefault(); setDragOverDay(null);
                const id = e.dataTransfer.getData('itemId');
                if (id) onDrop(id, date, 9);
              }}
              onClick={() => onDayClick(date)}
            >
              {/* Date number with cat paw for today */}
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full"
                  style={isNow ? {background:'#FFB74D', color:'#FFF'} : {color:'#5D3A1A'}}>
                  {date.getDate()}
                </span>
                {isNow && <span className="text-xs">🐾</span>}
              </div>
              {/* Events as cat paw badges */}
              {dayItems.slice(0, 3).map(item => <CalEvent key={item.id} item={item}/>)}
              {dayItems.length > 3 && (
                <p className="text-xs font-bold" style={{color:'#A1887F'}}>+{dayItems.length - 3} 🐾</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main View ────────────────────────────────────────── */
export function CalendarView() {
  const { items, updateItem } = useApp();
  const [mode, setMode]           = useState<CalendarMode>('week');
  const [currentDate, setCurrent] = useState(new Date());

  const scheduled = items.filter(i => (i.start_date || i.due_date) && i.status !== 'Archived');

  const handleDrop = useCallback((itemId: string, date: Date, hour: number) => {
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1, 0, 0, 0);
    updateItem(itemId, { start_date: start.toISOString(), due_date: end.toISOString() });
  }, [updateItem]);

  function handleNewItem(date: Date, hour: number) {}

  function navigate(dir: 1 | -1) {
    const d = new Date(currentDate);
    if (mode === 'day')  d.setDate(d.getDate() + dir);
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
    <div className="flex flex-col h-full" style={{background:'#FDFBF7'}}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4" style={{borderBottom:'1.5px dashed #EDDECC'}}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrent(new Date())}
            className="btn-warm px-3 py-1.5 text-xs"
          >
            今天 📅
          </button>
          <div className="flex items-center gap-0.5">
            <button onClick={() => navigate(-1)} className="btn-ghost-warm p-1.5"><ChevronLeft size={16}/></button>
            <button onClick={() => navigate(1)}  className="btn-ghost-warm p-1.5"><ChevronRight size={16}/></button>
          </div>
          <h2 className="text-sm font-bold" style={{color:'#3E2723'}}>{headerTitle()}</h2>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-0.5 p-1 rounded-2xl" style={{background:'#F5EBE0', border:'1.5px solid #EDDECC'}}>
          {(['day','week','month'] as CalendarMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl transition-all"
              style={mode === m ? {
                background: '#FFB74D', color: '#FFFFFF', boxShadow: '0 2px 6px rgba(255,183,77,0.4)'
              } : {
                background: 'transparent', color: '#8D6E63'
              }}
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
