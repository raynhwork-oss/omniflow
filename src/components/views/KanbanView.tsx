// ============================================================
// OmniFlow - Kanban Board View (Module B) with DnD Kit
// ============================================================

import React, { useState } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, DragOverlay, closestCorners
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Kanban, Folder, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { ItemCard } from '../items/ItemCard';
import type { OmniItem, ItemStatus } from '../../types';
import { cn, createNewItem, ANONYMOUS_USER_ID } from '../../lib/utils';

const COLUMNS: { id: ItemStatus; label: string; color: string; headerBg: string }[] = [
  { id: 'Backlog', label: '待處理', color: 'border-t-gray-400', headerBg: 'bg-gray-50' },
  { id: 'Todo', label: '準備中', color: 'border-t-sky-400', headerBg: 'bg-sky-50' },
  { id: 'In Progress', label: '進行中', color: 'border-t-violet-400', headerBg: 'bg-violet-50' },
  { id: 'Done', label: '已完成', color: 'border-t-emerald-400', headerBg: 'bg-emerald-50' },
];

function SortableItemCard({ item }: { item: OmniItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ItemCard item={item} compact />
    </div>
  );
}

function KanbanColumn({
  column,
  items,
  onAddItem,
}: {
  column: typeof COLUMNS[0];
  items: OmniItem[];
  onAddItem: (status: ItemStatus) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      'flex flex-col bg-surface-50 rounded-2xl border-t-4 min-w-[280px] max-w-[320px] flex-shrink-0',
      column.color
    )}>
      {/* Column Header */}
      <div className={cn('flex items-center justify-between px-4 py-3 rounded-t-xl', column.headerBg)}>
        <button
          className="flex items-center gap-2"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
          <span className="font-semibold text-gray-800 text-sm">{column.label}</span>
          <span className="text-xs text-gray-400 bg-white/60 px-1.5 py-0.5 rounded-full font-medium">
            {items.length}
          </span>
        </button>
        <button
          onClick={() => onAddItem(column.id)}
          className="p-1 rounded-lg hover:bg-white/60 transition-colors text-gray-500 hover:text-gray-700"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Items */}
      {!collapsed && (
        <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map(item => (
              <SortableItemCard key={item.id} item={item} />
            ))}
          </SortableContext>

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-8 h-8 rounded-xl bg-surface-200 flex items-center justify-center mb-2">
                <Kanban size={14} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-400">拖放或新增項目</p>
            </div>
          )}

          <button
            onClick={() => onAddItem(column.id)}
            className="w-full text-left text-xs text-gray-400 hover:text-gray-600 px-2 py-2 rounded-xl hover:bg-surface-200 transition-colors flex items-center gap-1.5 mt-1"
          >
            <Plus size={12} />
            新增到{column.label}
          </button>
        </div>
      )}
    </div>
  );
}

function ProjectTree({
  projects,
  selectedProjectId,
  onSelect,
}: {
  projects: OmniItem[];
  selectedProjectId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all',
          selectedProjectId === null
            ? 'bg-brand-500 text-white'
            : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
        )}
      >
        <Kanban size={12} />
        所有任務
      </button>
      {projects.map(p => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all',
            selectedProjectId === p.id
              ? 'bg-brand-500 text-white'
              : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
          )}
        >
          <Folder size={12} />
          {p.title}
        </button>
      ))}
    </div>
  );
}

export function KanbanView() {
  const { items, updateItem, addItem, user, filteredItems } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const projects = items.filter(i => i.type === 'Project');

  // Get tasks for kanban
  let taskItems = filteredItems({ view: 'kanban' });
  if (selectedProjectId) {
    taskItems = taskItems.filter(i => i.project_id === selectedProjectId);
  } else {
    taskItems = taskItems.filter(i => i.type === 'Task' || i.type === 'Project');
  }

  function getColumnItems(status: ItemStatus) {
    return taskItems.filter(i => i.status === status);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = COLUMNS.find(c => c.id === overId);
    if (targetColumn) {
      updateItem(active.id as string, { status: targetColumn.id });
      return;
    }

    // Dropped on another item - find that item's column
    const targetItem = taskItems.find(i => i.id === overId);
    if (targetItem) {
      updateItem(active.id as string, { status: targetItem.status });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id as string;
    const targetColumn = COLUMNS.find(c => c.id === overId);
    if (targetColumn) {
      updateItem(active.id as string, { status: targetColumn.id });
    }
  }

  async function handleAddItem(status: ItemStatus) {
    const title = prompt(`新增${COLUMNS.find(c => c.id === status)?.label}任務：`);
    if (!title?.trim()) return;

    const userId = user?.uid ?? ANONYMOUS_USER_ID;
    const newItem = createNewItem({
      title: title.trim(),
      user_id: userId,
      type: 'Task',
      status,
      project_id: selectedProjectId,
    });
    await addItem(newItem);
  }

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">專案看板</h1>
          <span className="text-sm text-gray-400">{taskItems.length} 個任務</span>
        </div>

        {/* Project selector */}
        <ProjectTree
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelect={setSelectedProjectId}
        />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex gap-4 h-full overflow-x-auto pb-2">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                column={col}
                items={getColumnItems(col.id)}
                onAddItem={handleAddItem}
              />
            ))}
          </div>

          <DragOverlay>
            {activeItem ? <ItemCard item={activeItem} compact dragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
