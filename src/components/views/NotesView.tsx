// ============================================================
// OmniFlow — NotesView · Dark Glassmorphism Edition
// ============================================================

import React, { useState, useRef } from 'react';
import {
  FileText, Plus, Search, Link2, Eye, Edit3,
  Bold, Italic, Code, List, Heading1, Heading2, X
} from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { createNewItem, ANONYMOUS_USER_ID, cn, truncate } from '../../lib/utils';
import type { OmniItem } from '../../types';

/* ── Markdown renderer ──────────────────────────────── */
function renderMd(md: string): string {
  return md
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-dark-800 border border-white/08 text-emerald-300 p-4 rounded-xl my-3 overflow-x-auto text-sm font-mono">$1</pre>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-slate-200 mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 class="text-base font-bold text-slate-100 mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 class="text-xl font-bold text-slate-50 mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-100">$1</strong>')
    .replace(/\*(.+?)\*/g,    '<em class="italic text-slate-300">$1</em>')
    .replace(/`(.+?)`/g,      '<code class="bg-dark-400 border border-white/08 text-rose-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^\- (.+)$/gm,   '<li class="flex items-start gap-2 my-0.5 text-slate-300"><span class="text-brand-400 mt-0.5">•</span><span>$1</span></li>')
    .replace(/^\d+\. (.+)$/gm,'<li class="my-0.5 ml-4 text-slate-300">$1</li>')
    .replace(/^> (.+)$/gm,    '<blockquote class="border-l-2 border-brand-500/50 pl-4 py-1 my-2 text-slate-500 italic bg-brand-600/05 rounded-r-lg">$1</blockquote>')
    .replace(/\[\[([^\]]+)\]\]/g, '<span class="inline-flex items-center gap-1 text-brand-300 font-medium cursor-pointer hover:text-brand-200 bg-brand-600/15 border border-brand-500/25 px-1.5 py-0.5 rounded-lg text-sm">🔗 $1</span>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-400 underline hover:text-brand-300 transition-colors" target="_blank">$1</a>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

/* ── Backlink panel ─────────────────────────────────── */
function BacklinkPanel({ noteId, allItems }: { noteId: string; allItems: OmniItem[] }) {
  const { setSelectedItemId } = useApp();
  const refs = allItems.filter(i => i.backlinks?.includes(noteId) && i.id !== noteId);
  if (!refs.length) return null;
  return (
    <div className="mt-6 border-t border-white/06 pt-5">
      <div className="flex items-center gap-2 mb-3">
        <Link2 size={13} className="text-brand-400"/>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          提及此筆記 ({refs.length})
        </h3>
      </div>
      <div className="space-y-1.5">
        {refs.map(item => (
          <button
            key={item.id}
            onClick={() => setSelectedItemId(item.id)}
            className="w-full text-left p-3 rounded-xl bg-brand-600/10 border border-brand-500/20 hover:border-brand-500/40 hover:bg-brand-600/15 transition-all"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <FileText size={12} className="text-brand-400"/>
              <span className="text-xs font-semibold text-brand-300">{item.title}</span>
            </div>
            {item.content && (
              <p className="text-xs text-slate-600 line-clamp-1 ml-5">
                {truncate(item.content.replace(/[#*`\[\]]/g, ''), 100)}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Wiki-link popover ──────────────────────────────── */
function WikiPopover({ items, query, onSelect }: {
  items: OmniItem[]; query: string; onSelect: (item: OmniItem) => void;
}) {
  const filtered = items.filter(i => i.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  if (!filtered.length) return null;
  return (
    <div className="absolute z-50 glass-card w-72 overflow-hidden animate-fade-in mt-1">
      <div className="px-3 py-2 border-b border-white/06">
        <p className="text-xs text-slate-600 font-medium">選擇連結物件</p>
      </div>
      {filtered.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="w-full text-left px-4 py-2.5 hover:bg-white/04 transition-colors flex items-center gap-3"
        >
          <span className="text-sm">{item.type === 'Note' ? '📝' : item.type === 'Project' ? '📁' : '✅'}</span>
          <div>
            <p className="text-sm font-medium text-slate-300">{item.title}</p>
            {item.content && (
              <p className="text-xs text-slate-600 line-clamp-1">{truncate(item.content, 50)}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ── Markdown editor ────────────────────────────────── */
function MarkdownEditor({ value, onChange, allItems, noteId }: {
  value: string; onChange: (v: string) => void;
  allItems: OmniItem[]; noteId: string;
}) {
  const ref   = useRef<HTMLTextAreaElement>(null);
  const [showWiki, setShowWiki] = useState(false);
  const [wikiQ, setWikiQ]       = useState('');
  const [wikiStart, setWikiStart] = useState(-1);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text   = e.target.value;
    const cursor = e.target.selectionStart;
    const before = text.slice(0, cursor);
    const m      = before.match(/\[\[([^\[\]]*)$/);
    onChange(text);
    if (m) { setWikiQ(m[1]); setWikiStart(before.lastIndexOf('[[')); setShowWiki(true); }
    else setShowWiki(false);
  }

  function handleWikiSelect(item: OmniItem) {
    if (!ref.current) return;
    const cursor = ref.current.selectionStart;
    const before = value.slice(0, wikiStart);
    const after  = value.slice(cursor);
    onChange(`${before}[[${item.title}]]${after}`);
    setShowWiki(false);
  }

  function insert(pre: string, suf = '', ph = 'text') {
    const ta = ref.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = value.slice(s, e) || ph;
    onChange(value.slice(0, s) + pre + sel + suf + value.slice(e));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + pre.length, s + pre.length + sel.length); }, 0);
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-white/06 flex-wrap">
        {[
          { icon: <Heading1 size={13}/>, tip: 'H1',     action: () => insert('# ', '', '標題') },
          { icon: <Heading2 size={13}/>, tip: 'H2',     action: () => insert('## ', '', '標題') },
          { icon: <Bold     size={13}/>, tip: '粗體',   action: () => insert('**', '**', '粗體') },
          { icon: <Italic   size={13}/>, tip: '斜體',   action: () => insert('*', '*', '斜體') },
          { icon: <Code     size={13}/>, tip: '程式碼', action: () => insert('`', '`', 'code') },
          { icon: <List     size={13}/>, tip: '列表',   action: () => insert('- ', '', '項目') },
          { icon: <Link2    size={13}/>, tip: '雙向連結', action: () => insert('[[', ']]', '物件名稱') },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action} title={btn.tip}
            className="btn-ghost p-1.5 rounded-lg">{btn.icon}</button>
        ))}
        <span className="ml-2 text-xs text-slate-700 border-l border-white/06 pl-2">
          輸入 [[ 建立雙向連結
        </span>
      </div>

      {/* Wiki popover */}
      {showWiki && (
        <div className="absolute left-4 top-12 z-50">
          <WikiPopover
            items={allItems.filter(i => i.id !== noteId)}
            query={wikiQ}
            onSelect={handleWikiSelect}
          />
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={handleInput}
        placeholder={'開始撰寫…\n\n# 標題\n**粗體** *斜體* `程式碼`\n- 清單項目\n\n輸入 [[ 建立雙向連結'}
        className="flex-1 p-5 text-sm text-slate-300 font-mono leading-relaxed outline-none bg-transparent placeholder-slate-700 resize-none"
        spellCheck={false}
      />
    </div>
  );
}

/* ── Main NotesView ─────────────────────────────────── */
export function NotesView() {
  const { items, addItem, updateItem, user, setSelectedItemId } = useApp();
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [preview, setPreview]       = useState(false);
  const [search, setSearch]         = useState('');

  const notes = items.filter(i => i.type === 'Note' && i.status !== 'Archived');
  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()),
  );
  const editingNote = editingId ? items.find(i => i.id === editingId) : null;

  async function createNote() {
    const note = createNewItem({ title: '未命名筆記', user_id: user?.uid ?? ANONYMOUS_USER_ID, type: 'Note', content: '' });
    await addItem(note);
    setEditingId(note.id);
    setSelectedItemId(note.id);
  }

  function updateContent(noteId: string, content: string) {
    const backlinkMatches = content.match(/\[\[([^\]]+)\]\]/g) || [];
    const refs = items.filter(i => backlinkMatches.map(m => m.slice(2,-2)).includes(i.title)).map(i => i.id);
    updateItem(noteId, { content, backlinks: refs });
  }

  return (
    <div className="flex h-full">
      {/* Notes list */}
      <div className="w-64 border-r border-white/06 flex flex-col bg-dark-700/50 flex-shrink-0">
        <div className="p-4 border-b border-white/06">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-200">所有筆記</h2>
            <button
              onClick={createNote}
              className="w-6 h-6 bg-brand-600 hover:bg-brand-500 text-white rounded-lg flex items-center justify-center transition-all shadow-glow-sm"
            >
              <Plus size={12}/>
            </button>
          </div>
          <div className="flex items-center gap-2 bg-dark-600 border border-white/07 rounded-xl px-3 py-2 focus-within:border-brand-500/40 transition-all">
            <Search size={12} className="text-slate-600"/>
            <input
              type="text" placeholder="搜尋筆記…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-xs outline-none w-full text-slate-300 placeholder-slate-600 bg-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-none">
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <FileText size={22} className="text-slate-700 mx-auto mb-2"/>
              <p className="text-xs text-slate-700">
                {search ? '找不到筆記' : '按右上角 + 建立筆記'}
              </p>
            </div>
          )}
          {filtered.map(note => (
            <button
              key={note.id}
              onClick={() => { setEditingId(note.id); setSelectedItemId(note.id); }}
              className={cn(
                'w-full text-left p-3 rounded-xl transition-all border',
                editingId === note.id
                  ? 'bg-brand-600/15 border-brand-500/30'
                  : 'border-transparent hover:bg-white/04 hover:border-white/06',
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText size={12} className="text-emerald-400 flex-shrink-0"/>
                <p className="text-xs font-semibold text-slate-300 truncate">{note.title}</p>
              </div>
              {note.content && (
                <p className="text-xs text-slate-600 line-clamp-2 ml-4">
                  {truncate(note.content.replace(/[#*`\[\]]/g,''), 70)}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1.5 ml-4">
                {note.tags.slice(0,2).map(t => (
                  <span key={t} className="text-xs text-brand-400 bg-brand-600/12 border border-brand-500/20 px-1.5 py-0.5 rounded-full">#{t}</span>
                ))}
                {(note.backlinks?.length ?? 0) > 0 && (
                  <span className="text-xs text-slate-600 flex items-center gap-0.5 ml-auto">
                    <Link2 size={9}/>{note.backlinks.length}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {editingNote ? (
          <>
            {/* Note header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-white/06">
              <input
                type="text"
                value={editingNote.title}
                onChange={e => updateItem(editingNote.id, { title: e.target.value })}
                className="text-lg font-bold text-slate-100 outline-none flex-1 bg-transparent placeholder-slate-600"
                placeholder="筆記標題…"
              />
              <button
                onClick={() => setPreview(!preview)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                  preview
                    ? 'bg-brand-600/25 border-brand-500/40 text-brand-300'
                    : 'border-white/07 text-slate-500 hover:border-brand-500/30 hover:text-slate-300 bg-dark-600',
                )}
              >
                {preview ? <Edit3 size={12}/> : <Eye size={12}/>}
                {preview ? '編輯' : '預覽'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {preview ? (
                <div className="px-6 py-5 max-w-3xl">
                  <div
                    className="text-sm text-slate-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMd(editingNote.content || '*（空白筆記）*') }}
                  />
                  <BacklinkPanel noteId={editingNote.id} allItems={items}/>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <MarkdownEditor
                    value={editingNote.content}
                    onChange={v => updateContent(editingNote.id, v)}
                    allItems={items}
                    noteId={editingNote.id}
                  />
                  <div className="px-6 pb-4 border-t border-white/06">
                    <BacklinkPanel noteId={editingNote.id} allItems={items}/>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-3xl bg-dark-500 border border-white/07 flex items-center justify-center mb-5 animate-float">
              <FileText size={34} className="text-slate-600"/>
            </div>
            <h3 className="text-base font-bold text-slate-300 mb-2">選擇或建立筆記</h3>
            <p className="text-slate-600 text-sm mb-5">從左側選擇，或建立新的 Markdown 備忘錄</p>
            <button
              onClick={createNote}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-glow-sm"
            >
              <Plus size={15}/>建立新筆記
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
