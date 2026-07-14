// ============================================================
// OmniFlow - Right Drawer: Item Detail Panel — Dark Edition
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  X, Trash2, Archive, Calendar, Tag, Flag, Folder,
  Plus, Link2, Clock, ChevronDown, CheckSquare, Square,
  AlertCircle, Circle, Minus
} from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import type { OmniItem, ItemStatus, ItemPriority, ItemType, SubTask } from '../../types';
import {
  cn, PRIORITY_DOT_CLASS, PRIORITY_BADGE_CLASS, STATUS_BADGE_CLASS,
  STATUS_LABEL, PRIORITY_LABEL, generateId, createNewItem
} from '../../lib/utils';
import { formatDate } from '../../lib/nlp';

// ── Constants ────────────────────────────────────────────────
const STATUSES: ItemStatus[] = ['Backlog', 'Todo', 'In Progress', 'Done', 'Archived'];
const STATUS_LABELS: Record<ItemStatus, string> = {
  Backlog: '待處理', Todo: '準備中', 'In Progress': '進行中', Done: '已完成', Archived: '已封存'
};
const PRIORITIES: ItemPriority[] = ['High', 'Medium', 'Low', 'None'];
const PRIORITY_LABELS: Record<ItemPriority, string> = {
  High: '🔴 高優先', Medium: '🟡 中優先', Low: '🔵 低優先', None: '⚪ 無優先級'
};
const TYPES: ItemType[] = ['Inbox', 'Task', 'Project', 'Note'];
const TYPE_LABELS: Record<ItemType, string> = {
  Inbox: '📥 收件夾', Task: '✅ 任務', Project: '📁 專案', Note: '📝 筆記'
};

// ── Field Row ────────────────────────────────────────────────
interface FieldRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function FieldRow({ icon, label, children }: FieldRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
      <div className="flex items-center gap-2 w-20 flex-shrink-0 pt-1">
        <span className="text-slate-500">{icon}</span>
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ── Select Field ─────────────────────────────────────────────
function SelectField<T extends string>({
  value, options, labels, onChange, renderOption,
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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-700/60 hover:bg-dark-600/80 border border-white/[0.07] hover:border-white/[0.14] transition-all text-xs font-medium text-slate-300"
      >
        {renderOption ? renderOption(value) : labels[value]}
        <ChevronDown
          size={11}
          className={cn('text-slate-500 transition-transform duration-200 ml-0.5', open && 'rotate-180')}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl z-50 min-w-40"
            style={{ background: 'rgba(18,22,34,0.97)', backdropFilter: 'blur(20px)' }}
          >
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center gap-2',
                  value === opt
                    ? 'text-indigo-300 bg-indigo-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                )}
              >
                {renderOption ? renderOption(opt) : labels[opt]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Date Field ───────────────────────────────────────────────
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
          if (e.target.value) onChange(new Date(e.target.value).toISOString());
        }}
        onBlur={() => setEditing(false)}
        autoFocus
        className="text-xs border border-indigo-500/40 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500/50 bg-dark-700 text-slate-200 w-full"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
        value
          ? 'bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/15'
          : 'bg-dark-700/60 border border-white/[0.07] text-slate-500 hover:text-slate-300 hover:border-white/[0.14]'
      )}
    >
      <Calendar size={11} />
      {value ? formatDate(value) : `設定${label}`}
    </button>
  );
}

// ── Tags Field ───────────────────────────────────────────────
function TagsField({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  function addTag() {
    const tag = input.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(tags.filter(t => t !== tag));
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map(tag => (
        <span
          key={tag}
          className="flex items-center gap-1 text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20"
        >
          #{tag}
          <button
            onClick={() => removeTag(tag)}
            className="text-indigo-400/60 hover:text-indigo-300 transition-colors"
          >
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
        className="text-xs outline-none bg-transparent text-slate-400 placeholder-slate-600 w-20"
      />
    </div>
  );
}

// ── Subtask List ─────────────────────────────────────────────
function SubtaskList({ subtasks = [], onChange }: {
  subtasks: SubTask[];
  onChange: (subtasks: SubTask[]) => void;
}) {
  const [newTitle, setNewTitle] = useState('');
  const done = subtasks.filter(s => s.done).length;
  const percent = subtasks.length > 0 ? Math.round((done / subtasks.length) * 100) : 0;

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
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex-1 bg-dark-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 tabular-nums">{done}/{subtasks.length}</span>
        </div>
      )}

      {/* Subtask items */}
      {subtasks.map(sub => (
        <div key={sub.id} className="flex items-center gap-2 group py-1.5 px-2 rounded-lg hover:bg-dark-700/40 transition-colors">
          <button
            onClick={() => toggleSubtask(sub.id)}
            className={cn(
              'flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all duration-200',
              sub.done
                ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.4)]'
                : 'border-slate-600 hover:border-emerald-400'
            )}
          >
            {sub.done && (
              <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className={cn('flex-1 text-xs', sub.done ? 'line-through text-slate-600' : 'text-slate-300')}>
            {sub.title}
          </span>
          <button
            onClick={() => deleteSubtask(sub.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
          >
            <X size={11} />
          </button>
        </div>
      ))}

      {/* Add subtask input */}
      <div className="flex items-center gap-2 px-2 pt-1.5">
        <Plus size={12} className="text-slate-600 flex-shrink-0" />
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addSubtask(); }}
          placeholder="新增子任務..."
          className="flex-1 text-xs text-slate-400 placeholder-slate-600 outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

// ── Priority Render Helper ────────────────────────────────────
function PriorityOption({ value }: { value: ItemPriority }) {
  return (
    <span className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', PRIORITY_BADGE_CLASS[value])}>
      <span className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOT_CLASS[value])} />
      {PRIORITY_LABELS[value].replace(/^[🔴🟡🔵⚪]\s/, '')}
    </span>
  );
}

// ── Status Render Helper ──────────────────────────────────────
function StatusOption({ value }: { value: ItemStatus }) {
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_BADGE_CLASS[value])}>
      {STATUS_LABELS[value]}
    </span>
  );
}

// ── Main Drawer ───────────────────────────────────────────────
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
    <div
      className="w-96 flex flex-col h-full border-l border-white/[0.06] animate-slide-in-right"
      style={{ background: 'rgba(14,18,28,0.95)', backdropFilter: 'blur(20px)' }}
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <SelectField
          value={item.type}
          options={TYPES}
          labels={TYPE_LABELS}
          onChange={v => update({ type: v })}
        />
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => update({ status: 'Archived' })}
            className="p-1.5 rounded-lg hover:bg-dark-600 text-slate-500 hover:text-slate-300 transition-all"
            title="封存"
          >
            <Archive size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
            title="刪除"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setSelectedItemId(null)}
            className="p-1.5 rounded-lg hover:bg-dark-600 text-slate-500 hover:text-slate-300 transition-all"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-transparent">
        {/* Title */}
        <div className="px-5 py-4 border-b border-white/[0.05]">
          <textarea
            value={item.title}
            onChange={e => update({ title: e.target.value })}
            className="w-full text-base font-bold text-white resize-none outline-none leading-snug placeholder-slate-600 bg-transparent"
            placeholder="標題..."
            rows={2}
          />
        </div>

        {/* Fields Block */}
        <div className="px-5 py-2">
          <FieldRow icon={<Flag size={12} />} label="狀態">
            <SelectField
              value={item.status}
              options={STATUSES}
              labels={STATUS_LABELS}
              onChange={v => update({ status: v })}
              renderOption={v => <StatusOption value={v as ItemStatus} />}
            />
          </FieldRow>

          <FieldRow icon={<AlertCircle size={12} />} label="優先">
            <SelectField
              value={item.priority}
              options={PRIORITIES}
              labels={PRIORITY_LABELS}
              onChange={v => update({ priority: v })}
              renderOption={v => <PriorityOption value={v as ItemPriority} />}
            />
          </FieldRow>

          <FieldRow icon={<Calendar size={12} />} label="開始">
            <DateField
              value={item.start_date}
              onChange={v => update({ start_date: v })}
              label="開始時間"
            />
          </FieldRow>

          <FieldRow icon={<Clock size={12} />} label="截止">
            <DateField
              value={item.due_date}
              onChange={v => update({ due_date: v })}
              label="截止時間"
            />
          </FieldRow>

          {item.type === 'Task' && (
            <FieldRow icon={<Folder size={12} />} label="專案">
              <select
                value={item.project_id || ''}
                onChange={e => update({ project_id: e.target.value || null })}
                className="text-xs border border-white/[0.07] rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500/40 text-slate-300 bg-dark-700/60 appearance-none cursor-pointer"
              >
                <option value="" className="bg-dark-800 text-slate-400">無專案</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-dark-800 text-slate-200">{p.title}</option>
                ))}
              </select>
            </FieldRow>
          )}

          <FieldRow icon={<Tag size={12} />} label="標籤">
            <TagsField
              tags={item.tags}
              onChange={tags => update({ tags })}
            />
          </FieldRow>
        </div>

        {/* Content / Notes */}
        <div className="px-5 py-4 border-t border-white/[0.05]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
            內容 / 備忘
          </label>
          <textarea
            value={item.content}
            onChange={e => update({ content: e.target.value })}
            placeholder="新增備忘錄... 支援 Markdown 語法"
            rows={5}
            className="w-full text-sm text-slate-300 resize-none outline-none leading-relaxed placeholder-slate-600 font-mono bg-dark-800/60 rounded-xl p-3.5 border border-white/[0.06] focus:border-indigo-500/30 focus:bg-dark-800/80 transition-all"
          />
        </div>

        {/* Subtasks (for Task/Project) */}
        {(item.type === 'Task' || item.type === 'Project') && (
          <div className="px-5 py-4 border-t border-white/[0.05]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
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
          <div className="px-5 py-4 border-t border-white/[0.05]">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={12} className="text-indigo-400" />
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                雙向連結 ({linkedItems.length})
              </label>
            </div>
            <div className="space-y-1.5">
              {linkedItems.map(linked => (
                <button
                  key={linked.id}
                  onClick={() => setSelectedItemId(linked.id)}
                  className="w-full text-left p-2.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/15 hover:border-indigo-500/25 transition-all group"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{linked.type === 'Note' ? '📝' : linked.type === 'Project' ? '📁' : '✅'}</span>
                    <span className="text-xs font-medium text-indigo-300 group-hover:text-indigo-200 transition-colors truncate">{linked.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="px-5 py-4 border-t border-white/[0.04] space-y-1">
          <p className="text-xs text-slate-600">建立於 {new Date(item.created_at).toLocaleString('zh-TW')}</p>
          <p className="text-xs text-slate-600">更新於 {new Date(item.updated_at).toLocaleString('zh-TW')}</p>
          <p className="font-mono text-slate-700 text-[10px] truncate mt-1">ID: {item.id}</p>
        </div>
      </div>
    </div>
  );
}
