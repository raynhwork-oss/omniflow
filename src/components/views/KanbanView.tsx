// ============================================================
// OmniFlow — KanbanView · Fixed DnD + Dark Edition
// Key fix: each column is a droppable zone via useDroppable.
// Cards use useSortable; cross-column drag detected in onDragOver.
// ============================================================

import React, { useState, useRef } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, DragOverlay,
  rectIntersection, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Kanban, Folder, ChevronDown, ChevronRight, X, Check } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { ItemCard } from '../items/ItemCard';
import type { OmniItem, ItemStatus } from '../../types';
import { cn, createNewItem, ANONYMOUS_USER_ID } from '../../lib/utils';

/* ── Column config ─────────────────────────────────────── */
const COLUMNS: {
  id: ItemStatus; label: string;
  topColor: string; dotColor: string; glowClass: string;
}[] = [
  { id: 'Backlog',     label: '待處理', topColor: 'border-t-slate-500',   dotColor: 'bg-slate-400',   glowClass: '' },
  { id: 'Todo',        label: '準備中', topColor: 'border-t-cyan-400',    dotColor: 'bg-cyan-400',    glowClass: 'shadow-[0_0_8px_rgba(34,211,238,0.3)]' },
  { id: 'In Progress', label: '進行中', topColor: 'border-t-violet-400',  dotColor: 'bg-violet-400',  glowClass: 'shadow-[0_0_8px_rgba(167,139,250,0.3)]' },
  { id: 'Done',        label: '已完成', topColor: 'border-t-emerald-400', dotColor: 'bg-emerald-400', glowClass: 'shadow-[0_0_8px_rgba(52,211,153,0.3)]' },
];

/* ── Sortable card wrapper ──────────────────────────────── */
function SortableCard({ item }: { item: OmniItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'card', status: item.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} data-dragging={isDragging}>
      <ItemCard item={item} compact/>
    </div>
  );
}

/* ── Inline add form ────────────────────────────────────── */
function InlineAdd({ onAdd, onCancel }: { onAdd: (title: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className="mt-2 glass-card p-2.5 animate-fade-in">
      <textarea
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (val.trim()) onAdd(val.trim()); }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="輸入任務標題…"
        rows={2}
        className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none resize-none"
      />
      <div className="flex items-center gap-1.5 mt-2">
        <button
          onClick={() => { if (val.trim()) onAdd(val.trim()); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium rounded-lg transition-all shadow-glow-sm"
        >
          <Check size={11}/> 新增
        </button>
        <button onClick={onCancel} className="p-1.5 rounded-lg btn-ghost text-slate-500">
          <X size={13}/>
        </button>
      </div>
    </div>
  );
}

/* ── Droppable Column ───────────────────────────────────── */
function KanbanColumn({
  col, items, isOver, onAddItem,
}: {
  col: typeof COLUMNS[0];
  items: OmniItem[];
  isOver: boolean;
  onAddItem: (status: ItemStatus, title: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: col.id });
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding]       = useState(false);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-2xl border-t-4 min-w-[270px] max-w-[300px] flex-shrink-0',
        'bg-dark-600/60 border border-white/07 transition-all duration-200',
        col.topColor,
        isOver && 'bg-dark-500/80 border-brand-500/30 kanban-drop-active',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          className="flex items-center gap-2 group"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed
            ? <ChevronRight size={13} className="text-slate-600"/>
            : <ChevronDown  size={13} className="text-slate-600"/>
          }
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', col.dotColor, col.glowClass)}/>
          <span className="text-sm font-semibold text-slate-300">{col.label}</span>
          <span className="text-xs text-slate-600 bg-dark-400 border border-white/07 px-1.5 py-0.5 rounded-full font-medium">
            {items.length}
          </span>
        </button>
        <button
          onClick={() => { setAdding(true); setCollapsed(false); }}
          className="btn-ghost p-1.5 hover:text-brand-300"
        >
          <Plus size={14}/>
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-none">
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map(item => <SortableCard key={item.id} item={item}/>)}
          </SortableContext>

          {items.length === 0 && !adding && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Kanban size={20} className="text-slate-700 mb-2"/>
              <p className="text-xs text-slate-700">拖放卡片到此欄</p>
            </div>
          )}

          {adding && (
            <InlineAdd
              onAdd={(title) => { onAddItem(col.id, title); setAdding(false); }}
              onCancel={() => setAdding(false)}
            />
          )}

          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="w-full text-left text-xs text-slate-700 hover:text-slate-400 px-2 py-2 rounded-xl hover:bg-white/04 transition-all flex items-center gap-1.5 mt-1"
            >
              <Plus size={11}/>
              新增到{col.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Project filter bar ─────────────────────────────────── */
function ProjectBar({ projects, selected, onSelect }: {
  projects: OmniItem[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {[{ id: null, label: '所有任務' }, ...projects.map(p => ({ id: p.id, label: p.title }))].map(p => (
        <button
          key={p.id ?? 'all'}
          onClick={() => onSelect(p.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all',
            selected === p.id
              ? 'bg-brand-600/25 border-brand-500/40 text-brand-300'
              : 'border-white/07 text-slate-500 bg-dark-600 hover:border-white/12 hover:text-slate-300',
          )}
        >
          {p.id === null ? <Kanban size={11}/> : <Folder size={11}/>}
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* ── Main Kanban View ───────────────────────────────────── */
export function KanbanView() {
  const { items, updateItem, addItem, user, filteredItems } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeId,  setActiveId]  = useState<string | null>(null);
  const [overColId, setOverColId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const projects = items.filter(i => i.type === 'Project');

  let taskItems = filteredItems({ view: 'kanban' });
  if (selectedProjectId) {
    taskItems = taskItems.filter(i => i.project_id === selectedProjectId);
  } else {
    taskItems = taskItems.filter(i => i.type === 'Task' || i.type === 'Project');
  }

  function colItems(status: ItemStatus) {
    return taskItems.filter(i => i.status === status);
  }

  /* ── Drag handlers ─────── */
  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) { setOverColId(null); return; }
    const overId = over.id as string;

    // Determine which column we're over
    const colMatch = COLUMNS.find(c => c.id === overId);
    if (colMatch) {
      setOverColId(colMatch.id);
      // Real-time status update for fluid feel
      const draggedItem = taskItems.find(i => i.id === active.id);
      if (draggedItem && draggedItem.status !== colMatch.id) {
        updateItem(active.id as string, { status: colMatch.id });
      }
      return;
    }

    // Over another card → adopt its column
    const overItem = taskItems.find(i => i.id === overId);
    if (overItem) {
      setOverColId(overItem.status);
      const draggedItem = taskItems.find(i => i.id === active.id);
      if (draggedItem && draggedItem.status !== overItem.status) {
        updateItem(active.id as string, { status: overItem.status });
      }
    }
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOverColId(null);
    if (!over) return;

    const overId = over.id as string;
    const colMatch = COLUMNS.find(c => c.id === overId);
    if (colMatch) {
      updateItem(active.id as string, { status: colMatch.id });
      return;
    }

    const overItem = taskItems.find(i => i.id === overId);
    if (overItem) {
      updateItem(active.id as string, { status: overItem.status });
    }
  }

  async function handleAddItem(status: ItemStatus, title: string) {
    const userId = user?.uid ?? ANONYMOUS_USER_ID;
    await addItem(createNewItem({
      title,
      user_id: userId,
      type: 'Task',
      status,
      project_id: selectedProjectId,
    }));
  }

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-100">專案看板</h1>
          <span className="text-xs text-slate-600 bg-dark-500 border border-white/07 px-2.5 py-1 rounded-full">
            {taskItems.length} 個任務
          </span>
        </div>
        <ProjectBar projects={projects} selected={selectedProjectId} onSelect={setSelectedProjectId}/>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-4 h-full overflow-x-auto pb-2 scrollbar-none">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                col={col}
                items={colItems(col.id)}
                isOver={overColId === col.id}
                onAddItem={handleAddItem}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeItem ? <ItemCard item={activeItem} compact dragging/> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
