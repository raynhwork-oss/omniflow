// ============================================================
// OmniFlow — KanbanView · Warm Cat Theme + DnD Fixed 🐾
// ============================================================

import React, { useState, useRef } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, DragOverlay,
  rectIntersection, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, ChevronDown, ChevronRight, X, Check, Folder } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { ItemCard } from '../items/ItemCard';
import type { OmniItem, ItemStatus } from '../../types';
import { cn, createNewItem, ANONYMOUS_USER_ID } from '../../lib/utils';

/* ── Warm column config ─────────────────────────────────── */
const COLUMNS: {
  id: ItemStatus; label: string; emoji: string;
  headerBg: string; borderColor: string; dotColor: string;
}[] = [
  { id: 'Backlog',     label: '待處理', emoji: '📋',
    headerBg: '#EFEBE9', borderColor: '#BCAAA4', dotColor: '#8D6E63' },
  { id: 'Todo',        label: '準備中', emoji: '📌',
    headerBg: '#FFF8E1', borderColor: '#FFB74D', dotColor: '#E65100' },
  { id: 'In Progress', label: '進行中', emoji: '🔥',
    headerBg: '#FFF3E0', borderColor: '#FF8A65', dotColor: '#BF360C' },
  { id: 'Done',        label: '已完成', emoji: '🎉',
    headerBg: '#E8F5E9', borderColor: '#66BB6A', dotColor: '#1B5E20' },
];

/* ── Sortable card wrapper ──────────────────────────────── */
function SortableCard({ item }: { item: OmniItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'card', status: item.status },
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
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
    <div className="mt-2 warm-card p-3 animate-fade-in">
      <textarea
        ref={ref} value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (val.trim()) onAdd(val.trim()); }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="輸入任務標題…"
        rows={2}
        className="w-full bg-transparent text-sm outline-none resize-none font-medium"
        style={{color:'#3E2723'}}
      />
      <div className="flex items-center gap-1.5 mt-2">
        <button
          onClick={() => { if (val.trim()) onAdd(val.trim()); }}
          className="btn-warm flex items-center gap-1 px-3 py-1.5 text-xs"
        >
          <Check size={11}/> 新增
        </button>
        <button onClick={onCancel} className="btn-ghost-warm p-1.5"><X size={13}/></button>
      </div>
    </div>
  );
}

/* ── Droppable Column ───────────────────────────────────── */
function KanbanColumn({
  col, items, isOver, onAddItem,
}: {
  col: typeof COLUMNS[0]; items: OmniItem[];
  isOver: boolean; onAddItem: (status: ItemStatus, title: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: col.id });
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding]       = useState(false);

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col rounded-3xl min-w-[272px] max-w-[300px] flex-shrink-0 transition-all duration-200"
      style={{
        background: isOver ? `${col.headerBg}CC` : '#FAF6F0',
        border: `1.5px solid ${isOver ? col.borderColor : '#EDDECC'}`,
        boxShadow: isOver ? `0 4px 20px ${col.borderColor}30` : '0 2px 8px rgba(139,90,43,0.06)',
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 rounded-t-3xl"
        style={{background: col.headerBg, borderBottom: `1.5px dashed ${col.borderColor}`}}>
        <button
          className="flex items-center gap-2 group"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed
            ? <ChevronRight size={14} style={{color:'#A1887F'}}/>
            : <ChevronDown  size={14} style={{color:'#A1887F'}}/>
          }
          <span className="text-sm">{col.emoji}</span>
          <span className="text-sm font-bold" style={{color:'#3E2723'}}>{col.label}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{background: col.borderColor, color:'#FFFFFF'}}>
            {items.length}
          </span>
        </button>
        <button
          onClick={() => { setAdding(true); setCollapsed(false); }}
          className="btn-ghost-warm p-1.5"
        >
          <Plus size={15}/>
        </button>
      </div>

      {/* Column Body */}
      {!collapsed && (
        <div className="flex-1 px-3 pb-3 pt-2 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-none">
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map(item => <SortableCard key={item.id} item={item}/>)}
          </SortableContext>

          {items.length === 0 && !adding && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <span className="text-3xl animate-float">{col.emoji}</span>
              <p className="text-xs font-semibold" style={{color:'#A1887F'}}>拖放卡片到這裡</p>
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
              className="w-full text-left text-xs font-semibold px-2 py-2 rounded-2xl transition-all flex items-center gap-1.5 mt-1 btn-ghost-warm"
              style={{color:'#A1887F'}}
            >
              <Plus size={12}/> 新增到{col.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Project filter bar ─────────────────────────────────── */
function ProjectBar({ projects, selected, onSelect }: {
  projects: OmniItem[]; selected: string | null; onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {[{ id: null, label: '所有任務', emoji: '📋' }, ...projects.map(p => ({ id: p.id, label: p.title, emoji: '📁' }))].map(p => (
        <button
          key={p.id ?? 'all'}
          onClick={() => onSelect(p.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all"
          style={selected === p.id ? {
            background: '#FFF8ED', border: '1.5px solid #FFB74D', color: '#E65100',
            boxShadow: '0 2px 8px rgba(255,183,77,0.25)'
          } : {
            background: '#FAF6F0', border: '1.5px solid #EDDECC', color: '#8D6E63'
          }}
        >
          <span>{p.emoji}</span>{p.label}
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const projects = items.filter(i => i.type === 'Project');

  let taskItems = filteredItems({ view: 'kanban' });
  if (selectedProjectId) {
    taskItems = taskItems.filter(i => i.project_id === selectedProjectId);
  } else {
    taskItems = taskItems.filter(i => i.type === 'Task' || i.type === 'Project');
  }

  function colItems(status: ItemStatus) { return taskItems.filter(i => i.status === status); }

  function onDragStart({ active }: DragStartEvent) { setActiveId(active.id as string); }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) { setOverColId(null); return; }
    const overId = over.id as string;
    const colMatch = COLUMNS.find(c => c.id === overId);
    if (colMatch) {
      setOverColId(colMatch.id);
      const draggedItem = taskItems.find(i => i.id === active.id);
      if (draggedItem && draggedItem.status !== colMatch.id) {
        updateItem(active.id as string, { status: colMatch.id });
      }
      return;
    }
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
    setActiveId(null); setOverColId(null);
    if (!over) return;
    const overId = over.id as string;
    const colMatch = COLUMNS.find(c => c.id === overId);
    if (colMatch) { updateItem(active.id as string, { status: colMatch.id }); return; }
    const overItem = taskItems.find(i => i.id === overId);
    if (overItem) { updateItem(active.id as string, { status: overItem.status }); }
  }

  async function handleAddItem(status: ItemStatus, title: string) {
    await addItem(createNewItem({
      title, user_id: user?.uid ?? ANONYMOUS_USER_ID,
      type: 'Task', status, project_id: selectedProjectId,
    }));
  }

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  return (
    <div className="flex flex-col h-full" style={{background:'#FDFBF7'}}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4" style={{borderBottom:'1.5px dashed #EDDECC'}}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📋</span>
            <h1 className="text-lg font-extrabold" style={{color:'#3E2723'}}>專案看板</h1>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full"
            style={{background:'#F5EBE0', color:'#8D6E63', border:'1.5px solid #EDDECC'}}>
            {taskItems.length} 個任務
          </span>
        </div>
        <ProjectBar projects={projects} selected={selectedProjectId} onSelect={setSelectedProjectId}/>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
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
                key={col.id} col={col}
                items={colItems(col.id)}
                isOver={overColId === col.id}
                onAddItem={handleAddItem}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
            {activeItem ? <ItemCard item={activeItem} compact dragging/> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
