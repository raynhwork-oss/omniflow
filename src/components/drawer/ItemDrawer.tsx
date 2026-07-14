// ============================================================
// OmniFlow - Right Drawer: Item Detail Panel
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  X, Trash2, Archive, Calendar, Tag, Flag, Folder,
  Plus, Check, Link2, Clock, FileText, MoreHorizontal,
  ChevronDown, CheckSquare, Square
} from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import type { OmniItem, ItemStatus, ItemPriority, ItemType, SubTask } from '../../types';
import { cn, PRIORITY_BG, STATUS_COLORS, generateId, createNewItem } from '../../lib/utils';
import { formatDate } from '../../lib/nlp';

interface FieldRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function FieldRow({ icon, label, children }: FieldRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex items-center gap-2 w-24 flex-shrink-0 pt-1">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

const STATUSES: ItemStatus[] = ['Backlog', 'Todo', 'In Progress', 'Done', 'Archived'];
const STATUS_LABELS: Record<ItemStatus, string> = {
  Backlog: '待處理', Todo: '準備中', 'In Progress': '進行中', Done: '已完成', Archived: '已封存'
};
const PRIORITIES: ItemPriority[] = ['High', 'Medium', 'Low', 'None'];
const PRIORITY_LABELS: Record<ItemPriority, string> = {
  High: '高優先', Medium: '中優先', Low: '低優先', None: '無優先級'
};
const TYPES: ItemType[] = ['Inbox', 'Task', 'Project', 'Note'];
const TYPE_LABELS: Record<ItemType, string> = {
  Inbox: '📥 收件夾', Task: '✅ 任務', Project: '📁 專案', Note: '📝 筆記'
};

function SelectField<T extends string>({
  value,
  options,
  labels,
  onChange,
  renderOption,
}: {
  value: T;
  options: T[];
  labels: Record<string, string>;
  onChange: (v: T) => void;
  renderOption?: (v: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors text-xs font-medium text-gray-700"
      >
        {renderOption ? renderOption(value) : labels[value]}
        <ChevronDown size={11} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-xl z-50 min-w-36 overflow-hidden">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn(
                'w-full text-left px-3 py-2 text-xs hover:bg-surface-50 transition-colors',
                value === opt ? 'text-brand-600 font-semibold bg-brand-50' : 'text-gray-700'
              )}
            >
              {renderOption ? renderOption(opt) : labels[opt]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DateField({ value, onChange, label }: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  label: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <input
        type="datetime-local"
        defaultValue={value ? value.slice(0, 16) : ''}
        onChange={e => {
          if (e.target.value) {
            onChange(new Date(e.target.value).toISOString());
          }
        }}
        onBlur={() => setEditing(false)}
        autoFocus
        className="text-xs border border-brand-300 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-brand-400"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
        value
          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          : 'bg-surface-100 text-gray-400 hover:bg-surface-200'
      )}
    >
      <Calendar size={11} />
      {value ? formatDate(value) : `設定${label}`}
    </button>
  );
}

function TagsField({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  function addTag() {
    const tag = input.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(tags.filter(t => t !== tag));
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map(tag => (
        <span key={tag} className="flex items-center gap-1 text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
          #{tag}
          <button onClick={() => removeTag(tag)} className="text-brand-400 hover:text-brand-700">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
        }}
        placeholder="新增標籤..."
        className="text-xs outline-none bg-transparent text-gray-500 placeholder-gray-300 w-20"
      />
    </div>
  );
}

function SubtaskList({ subtasks = [], onChange }: {
  subtasks: SubTask[];
  onChange: (subtasks: SubTask[]) => void;
}) {
  const [newTitle, setNewTitle] = useState('');
  const done = subtasks.filter(s => s.done).length;

  function addSubtask() {
    const title = newTitle.trim();
    if (!title) return;
    const newSubtask: SubTask = {
      id: generateId(),
      title,
      done: false,
      created_at: new Date().toISOString(),
    };
    onChange([...subtasks, newSubtask]);
    setNewTitle('');
  }

  function toggleSubtask(id: string) {
    onChange(subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s));
  }

  function deleteSubtask(id: string) {
    onChange(subtasks.filter(s => s.id !== id));
  }

  return (
    <div className="space-y-1">
      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 bg-surface-200 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{ width: `${subtasks.length > 0 ? (done / subtasks.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{done}/{subtasks.length}</span>
        </div>
      )}

      {/* Subtask items */}
      {subtasks.map(sub => (
        <div key={sub.id} className="flex items-center gap-2 group py-1">
          <button
            onClick={() => toggleSubtask(sub.id)}
            className={cn('flex-shrink-0 transition-colors', sub.done ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-400')}
          >
            {sub.done ? <CheckSquare size={14} /> : <Square size={14} />}
          </button>
          <span className={cn('flex-1 text-sm', sub.done && 'line-through text-gray-400')}>
            {sub.title}
          </span>
          <button
            onClick={() => deleteSubtask(sub.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {/* Add subtask */}
      <div className="flex items-center gap-2 pt-1">
        <Plus size={13} className="text-gray-300 flex-shrink-0" />
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addSubtask(); }}
          placeholder="新增子任務..."
          className="flex-1 text-sm text-gray-600 placeholder-gray-300 outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

export function ItemDrawer() {
  const { selectedItem, setSelectedItemId, updateItem, removeItem, items } = useApp();
  const item = selectedItem;

  if (!item) return null;

  function update(changes: Partial<OmniItem>) {
    if (!item) return;
    updateItem(item.id, changes);
  }

  async function handleDelete() {
    if (!item) return;
    if (confirm(`確定要刪除「${item.title}」嗎？`)) {
      await removeItem(item.id);
    }
  }

  const linkedItems = items.filter(i => item.backlinks?.includes(i.id) && i.id !== item.id);
  const projects = items.filter(i => i.type === 'Project');

  return (
    <div className="w-96 border-l border-surface-200 bg-white flex flex-col h-full animate-slide-in-right shadow-xl">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">{item.type === 'Note' ? '📝' : item.type === 'Project' ? '📁' : item.type === 'Task' ? '✅' : '📥'}</span>
          <SelectField
            value={item.type}
            options={TYPES}
            labels={TYPE_LABELS}
            onChange={v => update({ type: v })}
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => update({ status: 'Archived' })}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="封存"
          >
            <Archive size={15} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="刪除"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={() => setSelectedItemId(null)}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <div className="px-5 py-4">
          <textarea
            value={item.title}
            onChange={e => update({ title: e.target.value })}
            className="w-full text-lg font-bold text-gray-900 resize-none outline-none leading-snug placeholder-gray-300"
            placeholder="標題..."
            rows={2}
          />
        </div>

        {/* Fields */}
        <div className="px-5 border-t border-surface-100 divide-y divide-surface-50">
          <FieldRow icon={<Flag size={13} />} label="狀態">
            <SelectField
              value={item.status}
              options={STATUSES}
              labels={STATUS_LABELS}
              onChange={v => update({ status: v })}
              renderOption={v => (
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[v as ItemStatus])}>
                  {STATUS_LABELS[v as ItemStatus]}
                </span>
              )}
            />
          </FieldRow>

          <FieldRow icon={<Flag size={13} />} label="優先級">
            <SelectField
              value={item.priority}
              options={PRIORITIES}
              labels={PRIORITY_LABELS}
              onChange={v => update({ priority: v })}
              renderOption={v => (
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', PRIORITY_BG[v as ItemPriority])}>
                  {PRIORITY_LABELS[v as ItemPriority]}
                </span>
              )}
            />
          </FieldRow>

          <FieldRow icon={<Calendar size={13} />} label="開始">
            <DateField
              value={item.start_date}
              onChange={v => update({ start_date: v })}
              label="開始時間"
            />
          </FieldRow>

          <FieldRow icon={<Clock size={13} />} label="截止">
            <DateField
              value={item.due_date}
              onChange={v => update({ due_date: v })}
              label="截止時間"
            />
          </FieldRow>

          {(item.type === 'Task') && (
            <FieldRow icon={<Folder size={13} />} label="專案">
              <select
                value={item.project_id || ''}
                onChange={e => update({ project_id: e.target.value || null })}
                className="text-xs border border-surface-200 rounded-lg px-2 py-1 outline-none focus:border-brand-400 text-gray-700 bg-white"
              >
                <option value="">無專案</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </FieldRow>
          )}

          <FieldRow icon={<Tag size={13} />} label="標籤">
            <TagsField
              tags={item.tags}
              onChange={tags => update({ tags })}
            />
          </FieldRow>
        </div>

        {/* Content / Notes */}
        <div className="px-5 py-4 border-t border-surface-100">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
            內容 / 備忘
          </label>
          <textarea
            value={item.content}
            onChange={e => update({ content: e.target.value })}
            placeholder="新增備忘錄... 支援 Markdown 語法"
            rows={5}
            className="w-full text-sm text-gray-700 resize-none outline-none leading-relaxed placeholder-gray-300 font-mono bg-surface-50 rounded-xl p-3 focus:bg-white focus:ring-1 focus:ring-brand-200 transition-colors"
          />
        </div>

        {/* Subtasks (for Task/Project) */}
        {(item.type === 'Task' || item.type === 'Project') && (
          <div className="px-5 py-4 border-t border-surface-100">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">
              子任務
            </label>
            <SubtaskList
              subtasks={item.subtasks || []}
              onChange={subtasks => update({ subtasks })}
            />
          </div>
        )}

        {/* Linked References (Backlinks) */}
        {linkedItems.length > 0 && (
          <div className="px-5 py-4 border-t border-surface-100">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={13} className="text-brand-500" />
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                雙向連結 ({linkedItems.length})
              </label>
            </div>
            <div className="space-y-1.5">
              {linkedItems.map(linked => (
                <button
                  key={linked.id}
                  onClick={() => setSelectedItemId(linked.id)}
                  className="w-full text-left p-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-100 hover:border-brand-200 transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{linked.type === 'Note' ? '📝' : linked.type === 'Project' ? '📁' : '✅'}</span>
                    <span className="text-xs font-medium text-brand-700">{linked.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="px-5 py-4 border-t border-surface-100 text-xs text-gray-400 space-y-1">
          <p>建立於 {new Date(item.created_at).toLocaleString('zh-TW')}</p>
          <p>更新於 {new Date(item.updated_at).toLocaleString('zh-TW')}</p>
          <p className="font-mono text-gray-300 text-xs truncate">ID: {item.id}</p>
        </div>
      </div>
    </div>
  );
}
