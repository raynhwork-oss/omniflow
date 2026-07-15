// ============================================================
// OmniFlow — Item Drawer · Warm Cat Theme Edition 🐾
// ============================================================

import React, { useState } from 'react';
import {
  X, Trash2, Archive, Calendar, Tag, Flag, Folder,
  Plus, Link2, Clock, ChevronDown, CheckSquare, Square,
} from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import type { OmniItem, ItemStatus, ItemPriority, ItemType, SubTask } from '../../types';
import {
  cn, PRIORITY_DOT_CLASS, PRIORITY_BADGE_CLASS, STATUS_BADGE_CLASS,
  STATUS_LABEL, PRIORITY_LABEL, generateId,
} from '../../lib/utils';
import { formatDate } from '../../lib/nlp';

// ── Constants ─────────────────────────────────────────────
const STATUSES: ItemStatus[] = ['Backlog', 'Todo', 'In Progress', 'Done', 'Archived'];
const STATUS_LABELS: Record<ItemStatus, string> = {
  Backlog: '待處理', Todo: '準備中', 'In Progress': '進行中', Done: '已完成', Archived: '已封存'
};
const PRIORITIES: ItemPriority[] = ['High', 'Medium', 'Low', 'None'];
const PRIORITY_LABELS: Record<ItemPriority, string> = {
  High: '🔴 高優先', Medium: '🟡 中優先', Low: '🟢 低優先', None: '⚪ 無優先'
};
const TYPES: ItemType[] = ['Inbox', 'Task', 'Project', 'Note'];
const TYPE_LABELS: Record<ItemType, string> = {
  Inbox: '📥 收件夾', Task: '✅ 任務', Project: '📁 專案', Note: '📝 筆記'
};

// ── Field Row ──────────────────────────────────────────────
function FieldRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{borderBottom:'1.5px dashed #EDDECC'}}>
      <div className="flex items-center gap-2 w-20 flex-shrink-0 pt-1">
        <span style={{color:'#A1887F'}}>{icon}</span>
        <span className="text-xs font-bold whitespace-nowrap" style={{color:'#8D6E63'}}>{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ── Select Field ───────────────────────────────────────────
function SelectField<T extends string>({
  value, options, labels, onChange, renderOption,
}: {
  value: T; options: T[]; labels: Record<string, string>;
  onChange: (v: T) => void; renderOption?: (v: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl text-xs font-bold transition-all"
        style={{background:'#FAF6F0', border:'1.5px solid #EDDECC', color:'#3E2723'}}
      >
        {renderOption ? renderOption(value) : labels[value]}
        <ChevronDown size={11} className={cn('transition-transform duration-200 ml-0.5', open && 'rotate-180')}
          style={{color:'#A1887F'}}/>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}/>
          <div className="absolute top-full left-0 mt-1.5 rounded-2xl overflow-hidden z-50 min-w-40 warm-card animate-fade-in">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-xs font-semibold transition-colors flex items-center gap-2"
                style={{
                  color: value === opt ? '#E68A00' : '#3E2723',
                  background: value === opt ? '#FFF8ED' : 'transparent',
                }}
                onMouseEnter={e => { if (value !== opt) (e.currentTarget as HTMLElement).style.background = '#FAF6F0'; }}
                onMouseLeave={e => { if (value !== opt) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
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

// ── Date Field ─────────────────────────────────────────────
function DateField({ value, onChange, label }: {
  value: string | undefined; onChange: (v: string | undefined) => void; label: string;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input
        type="datetime-local"
        defaultValue={value ? value.slice(0, 16) : ''}
        onChange={e => { if (e.target.value) onChange(new Date(e.target.value).toISOString()); }}
        onBlur={() => setEditing(false)}
        autoFocus
        className="input-warm text-xs px-2.5 py-1.5 w-full"
      />
    );
  }
  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl text-xs font-bold transition-all"
      style={value ? {
        background: '#FFF8E1', border: '1.5px solid #FFB74D', color: '#E65100'
      } : {
        background: '#FAF6F0', border: '1.5px solid #EDDECC', color: '#A1887F'
      }}
    >
      <Calendar size={11}/>
      {value ? formatDate(value) : `設定${label}`}
    </button>
  );
}

// ── Tags Field ─────────────────────────────────────────────
function TagsField({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');
  function addTag() {
    const tag = input.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput('');
  }
  function removeTag(tag: string) { onChange(tags.filter(t => t !== tag)); }
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map(tag => (
        <span key={tag} className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{background:'#FFE8C2', border:'1.5px solid #FFB74D', color:'#E65100'}}>
          #{tag}
          <button onClick={() => removeTag(tag)} style={{color:'#E68A00'}} className="hover:opacity-70"><X size={10}/></button>
        </span>
      ))}
      <input
        type="text" value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
        placeholder="新增標籤..."
        className="text-xs outline-none bg-transparent font-semibold"
        style={{color:'#8D6E63', width:'80px'}}
      />
    </div>
  );
}

// ── Cat Paw Subtask List ───────────────────────────────────
function SubtaskList({ subtasks = [], onChange }: {
  subtasks: SubTask[]; onChange: (subtasks: SubTask[]) => void;
}) {
  const [newTitle, setNewTitle] = useState('');
  const done    = subtasks.filter(s => s.done).length;
  const percent = subtasks.length > 0 ? Math.round((done / subtasks.length) * 100) : 0;

  function addSubtask() {
    const title = newTitle.trim();
    if (!title) return;
    onChange([...subtasks, { id: generateId(), title, done: false, created_at: new Date().toISOString() }]);
    setNewTitle('');
  }

  function toggleSubtask(id: string) { onChange(subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s)); }
  function deleteSubtask(id: string)  { onChange(subtasks.filter(s => s.id !== id)); }

  return (
    <div className="space-y-1">
      {/* Cat paw progress bar */}
      {subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold" style={{color:'#8D6E63'}}>{done}/{subtasks.length} 子任務</span>
            <span className="text-xs font-bold" style={{color: percent === 100 ? '#2E7D32' : '#E65100'}}>
              {percent === 100 ? '🎉 完成！' : `${percent}%`}
            </span>
          </div>
          {/* Track */}
          <div className="relative h-5 rounded-full cat-progress-track">
            <div className="cat-progress-fill h-full absolute left-0 top-0 rounded-full"
              style={{width:`${Math.min(percent, 95)}%`}}/>
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-700"
              style={{left:`${Math.max(8, Math.min(percent, 94))}%`}}>
              <span className="text-sm">🐾</span>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm">
              {percent >= 100 ? '💀' : '🐟'}
            </div>
          </div>
        </div>
      )}

      {/* Subtask items */}
      {subtasks.map(sub => (
        <div key={sub.id} className="flex items-center gap-2 group py-1.5 px-2 rounded-xl transition-colors"
          style={{}} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='#FAF6F0'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
          <button
            onClick={() => toggleSubtask(sub.id)}
            className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
            style={sub.done ? {
              background:'#FFB74D', borderColor:'#FFB74D', boxShadow:'0 0 6px rgba(255,183,77,0.5)'
            } : {
              borderColor:'#EDDECC', background:'#FFF'
            }}
          >
            {sub.done && <span className="text-xs text-white">🐾</span>}
          </button>
          <span className={cn('flex-1 text-xs font-semibold', sub.done && 'line-through opacity-50')}
            style={{color:'#3E2723'}}>{sub.title}</span>
          <button onClick={() => deleteSubtask(sub.id)}
            className="opacity-0 group-hover:opacity-100 transition-all"
            style={{color:'#BCAAA4'}}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='#EF5350'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='#BCAAA4'}>
            <X size={11}/>
          </button>
        </div>
      ))}

      {/* Add subtask */}
      <div className="flex items-center gap-2 px-2 pt-1.5">
        <Plus size={12} style={{color:'#BCAAA4'}} className="flex-shrink-0"/>
        <input
          type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addSubtask(); }}
          placeholder="新增子任務..."
          className="flex-1 text-xs outline-none bg-transparent font-semibold"
          style={{color:'#3E2723'}}
        />
      </div>
    </div>
  );
}

// ── Main Drawer ────────────────────────────────────────────
export function ItemDrawer() {
  const { selectedItem, setSelectedItemId, updateItem, removeItem, items } = useApp();
  const item = selectedItem;
  if (!item) return null;

  function update(changes: Partial<OmniItem>) { if (!item) return; updateItem(item.id, changes); }

  async function handleDelete() {
    if (!item) return;
    if (confirm(`確定要刪除「${item.title}」嗎？🐾`)) { await removeItem(item.id); }
  }

  const linkedItems = items.filter(i => item.backlinks?.includes(i.id) && i.id !== item.id);
  const projects    = items.filter(i => i.type === 'Project');

  return (
    <div className="w-96 flex flex-col h-full animate-slide-in-right"
      style={{background:'#FDFBF7', borderLeft:'1.5px dashed #EDDECC', boxShadow:'-4px 0 24px rgba(139,90,43,0.08)'}}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1.5px dashed #EDDECC', background:'#FFF8ED'}}>
        <SelectField value={item.type} options={TYPES} labels={TYPE_LABELS} onChange={v => update({ type: v })}/>
        <div className="flex items-center gap-0.5">
          <button onClick={() => update({ status: 'Archived' })} className="btn-ghost-warm p-1.5" title="封存">
            <Archive size={14}/>
          </button>
          <button onClick={handleDelete} className="p-1.5 rounded-xl transition-all btn-ghost-warm" title="刪除"
            style={{color:'#A1887F'}}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='#EF5350'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='#A1887F'}>
            <Trash2 size={14}/>
          </button>
          <button onClick={() => setSelectedItemId(null)} className="btn-ghost-warm p-1.5"><X size={14}/></button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <div className="px-5 py-4" style={{borderBottom:'1.5px dashed #EDDECC'}}>
          <textarea
            value={item.title} onChange={e => update({ title: e.target.value })}
            className="w-full text-base font-extrabold resize-none outline-none leading-snug bg-transparent"
            style={{color:'#3E2723'}} placeholder="標題..." rows={2}
          />
        </div>

        {/* Fields */}
        <div className="px-5 py-2">
          <FieldRow icon={<Flag size={12}/>} label="狀態">
            <SelectField value={item.status} options={STATUSES} labels={STATUS_LABELS}
              onChange={v => update({ status: v })}
              renderOption={v => (
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', STATUS_BADGE_CLASS[v as ItemStatus])}>
                  {STATUS_LABELS[v as ItemStatus]}
                </span>
              )}
            />
          </FieldRow>

          <FieldRow icon={<Flag size={12}/>} label="優先">
            <SelectField value={item.priority} options={PRIORITIES} labels={PRIORITY_LABELS}
              onChange={v => update({ priority: v })}
              renderOption={v => (
                <span className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold', PRIORITY_BADGE_CLASS[v as ItemPriority])}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOT_CLASS[v as ItemPriority])}/>
                  {PRIORITY_LABELS[v as ItemPriority].replace(/^[🔴🟡🟢⚪]\s/,'')}
                </span>
              )}
            />
          </FieldRow>

          <FieldRow icon={<Calendar size={12}/>} label="開始">
            <DateField value={item.start_date} onChange={v => update({ start_date: v })} label="開始時間"/>
          </FieldRow>

          <FieldRow icon={<Clock size={12}/>} label="截止">
            <DateField value={item.due_date} onChange={v => update({ due_date: v })} label="截止時間"/>
          </FieldRow>

          {item.type === 'Task' && (
            <FieldRow icon={<Folder size={12}/>} label="專案">
              <select
                value={item.project_id || ''}
                onChange={e => update({ project_id: e.target.value || null })}
                className="input-warm text-xs px-2.5 py-1.5 appearance-none cursor-pointer"
              >
                <option value="">無專案</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </FieldRow>
          )}

          <FieldRow icon={<Tag size={12}/>} label="標籤">
            <TagsField tags={item.tags} onChange={tags => update({ tags })}/>
          </FieldRow>
        </div>

        {/* Content */}
        <div className="px-5 py-4" style={{borderTop:'1.5px dashed #EDDECC'}}>
          <label className="text-xs font-bold uppercase tracking-wider block mb-2.5" style={{color:'#8D6E63'}}>
            📝 內容 / 備忘
          </label>
          <textarea
            value={item.content} onChange={e => update({ content: e.target.value })}
            placeholder="新增備忘錄... 支援 Markdown 語法"
            rows={5}
            className="input-warm w-full text-sm leading-relaxed font-mono p-3.5"
            style={{resize:'none'}}
          />
        </div>

        {/* Subtasks */}
        {(item.type === 'Task' || item.type === 'Project') && (
          <div className="px-5 py-4" style={{borderTop:'1.5px dashed #EDDECC'}}>
            <label className="text-xs font-bold uppercase tracking-wider block mb-3" style={{color:'#8D6E63'}}>
              🐾 子任務
            </label>
            <SubtaskList subtasks={item.subtasks || []} onChange={subtasks => update({ subtasks })}/>
          </div>
        )}

        {/* Backlinks */}
        {linkedItems.length > 0 && (
          <div className="px-5 py-4" style={{borderTop:'1.5px dashed #EDDECC'}}>
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={12} style={{color:'#E68A00'}}/>
              <label className="text-xs font-bold uppercase tracking-wider" style={{color:'#8D6E63'}}>
                雙向連結 ({linkedItems.length})
              </label>
            </div>
            <div className="space-y-1.5">
              {linkedItems.map(linked => (
                <button key={linked.id} onClick={() => setSelectedItemId(linked.id)}
                  className="w-full text-left p-2.5 rounded-2xl transition-all group warm-card"
                  style={{background:'#FFF8ED', borderColor:'#FFB74D'}}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow='0 2px 8px rgba(255,183,77,0.2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow=''}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{linked.type === 'Note' ? '📝' : linked.type === 'Project' ? '📁' : '✅'}</span>
                    <span className="text-xs font-bold truncate" style={{color:'#E65100'}}>{linked.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="px-5 py-4 space-y-1" style={{borderTop:'1.5px dashed #EDDECC'}}>
          <p className="text-xs font-medium" style={{color:'#BCAAA4'}}>建立於 {new Date(item.created_at).toLocaleString('zh-TW')}</p>
          <p className="text-xs font-medium" style={{color:'#BCAAA4'}}>更新於 {new Date(item.updated_at).toLocaleString('zh-TW')}</p>
          <p className="font-mono text-xs truncate mt-1" style={{color:'#D7CCC8'}}>ID: {item.id}</p>
        </div>
      </div>
    </div>
  );
}
