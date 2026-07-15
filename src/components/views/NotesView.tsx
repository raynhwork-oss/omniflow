// ============================================================
// OmniFlow — NotesView · Warm Cat Theme Edition 🐾
// ============================================================

import React, { useState, useRef } from 'react';
import {
  FileText, Plus, Search, Link2, Eye, Edit3,
  Bold, Italic, Code, List, Heading1, Heading2,
} from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { createNewItem, ANONYMOUS_USER_ID, cn, truncate } from '../../lib/utils';
import type { OmniItem } from '../../types';

/* ── Markdown renderer — warm palette ───────────────── */
function renderMd(md: string): string {
  return md
    .replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-cream-100 border border-cream-300 text-espresso-700 p-4 rounded-2xl my-3 overflow-x-auto text-sm font-mono" style="background:#F5EBE0;border:1.5px solid #EDDECC;color:#5D3A1A">$1</pre>',
    )
    .replace(
      /^### (.+)$/gm,
      '<h3 style="font-size:1rem;font-weight:700;color:#3E2723;margin-top:1rem;margin-bottom:0.25rem">$1</h3>',
    )
    .replace(
      /^## (.+)$/gm,
      '<h2 style="font-size:1.125rem;font-weight:800;color:#3E2723;margin-top:1.25rem;margin-bottom:0.5rem">$1</h2>',
    )
    .replace(
      /^# (.+)$/gm,
      '<h1 style="font-size:1.375rem;font-weight:900;color:#3E2723;margin-top:1.5rem;margin-bottom:0.75rem">$1</h1>',
    )
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong style="font-weight:700;color:#3E2723">$1</strong>',
    )
    .replace(
      /\*(.+?)\*/g,
      '<em style="font-style:italic;color:#5D3A1A">$1</em>',
    )
    .replace(
      /`(.+?)`/g,
      '<code style="background:#F5EBE0;border:1.5px solid #EDDECC;color:#E68A00;padding:2px 6px;border-radius:6px;font-size:0.875rem;font-family:monospace">$1</code>',
    )
    .replace(
      /^\- (.+)$/gm,
      '<li style="display:flex;align-items:flex-start;gap:6px;margin:2px 0;color:#5D3A1A"><span style="color:#FFB74D;margin-top:2px">🐾</span><span>$1</span></li>',
    )
    .replace(
      /^\d+\. (.+)$/gm,
      '<li style="margin:2px 0 2px 16px;color:#5D3A1A">$1</li>',
    )
    .replace(
      /^> (.+)$/gm,
      '<blockquote style="border-left:3px solid #FFB74D;padding:6px 12px;margin:8px 0;color:#8D6E63;font-style:italic;background:rgba(255,183,77,0.06);border-radius:0 12px 12px 0">$1</blockquote>',
    )
    .replace(
      /\[\[([^\]]+)\]\]/g,
      '<span style="display:inline-flex;align-items:center;gap:4px;color:#E68A00;font-weight:600;cursor:pointer;background:rgba(255,183,77,0.12);border:1.5px solid rgba(255,183,77,0.35);padding:2px 8px;border-radius:8px;font-size:0.875rem">🔗 $1</span>',
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color:#E68A00;text-decoration:underline" target="_blank">$1</a>',
    )
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

/* ── Backlink panel ─────────────────────────────────── */
function BacklinkPanel({ noteId, allItems }: { noteId: string; allItems: OmniItem[] }) {
  const { setSelectedItemId } = useApp();
  const refs = allItems.filter(i => i.backlinks?.includes(noteId) && i.id !== noteId);
  if (!refs.length) return null;

  return (
    <div
      className="mt-6 pt-5"
      style={{ borderTop: '1.5px dashed #EDDECC' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Link2 size={13} style={{ color: '#E68A00' }} />
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: '#8D6E63' }}
        >
          提及此筆記 ({refs.length})
        </h3>
      </div>
      <div className="space-y-2">
        {refs.map(item => (
          <button
            key={item.id}
            onClick={() => setSelectedItemId(item.id)}
            className="w-full text-left p-3 rounded-2xl transition-all"
            style={{
              background: 'rgba(255,183,77,0.08)',
              border: '1.5px solid rgba(255,183,77,0.25)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,183,77,0.14)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,183,77,0.5)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,183,77,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,183,77,0.25)';
            }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <FileText size={12} style={{ color: '#E68A00' }} />
              <span className="text-xs font-semibold" style={{ color: '#E68A00' }}>
                {item.title}
              </span>
            </div>
            {item.content && (
              <p
                className="text-xs line-clamp-1 ml-5"
                style={{ color: '#8D6E63' }}
              >
                {truncate(item.content.replace(/[#*`\[\]]/g, ''), 100)}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Wiki-link popover — warm card ──────────────────── */
function WikiPopover({
  items,
  query,
  onSelect,
}: {
  items: OmniItem[];
  query: string;
  onSelect: (item: OmniItem) => void;
}) {
  const filtered = items
    .filter(i => i.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);
  if (!filtered.length) return null;

  return (
    <div
      className="absolute z-50 w-72 overflow-hidden rounded-2xl"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #EDDECC',
        boxShadow: '0 8px 28px rgba(139,90,43,0.15)',
        marginTop: '4px',
      }}
    >
      <div
        className="px-3 py-2"
        style={{ borderBottom: '1.5px dashed #EDDECC' }}
      >
        <p className="text-xs font-semibold" style={{ color: '#8D6E63' }}>
          🔗 選擇連結物件
        </p>
      </div>
      {filtered.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors"
          onMouseEnter={e =>
            ((e.currentTarget as HTMLElement).style.background = '#FFF8ED')
          }
          onMouseLeave={e =>
            ((e.currentTarget as HTMLElement).style.background = 'transparent')
          }
        >
          <span className="text-sm">
            {item.type === 'Note' ? '📝' : item.type === 'Project' ? '📁' : '✅'}
          </span>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: '#3E2723' }}
            >
              {item.title}
            </p>
            {item.content && (
              <p className="text-xs line-clamp-1" style={{ color: '#A1887F' }}>
                {truncate(item.content, 50)}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ── Toolbar button ─────────────────────────────────── */
function ToolBtn({
  icon,
  tip,
  onClick,
}: {
  icon: React.ReactNode;
  tip: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={tip}
      className="p-2 rounded-xl transition-all flex items-center justify-center"
      style={{ color: '#8D6E63' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = '#F5EBE0';
        (e.currentTarget as HTMLElement).style.color = '#E68A00';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.color = '#8D6E63';
      }}
    >
      {icon}
    </button>
  );
}

/* ── Markdown editor ────────────────────────────────── */
function MarkdownEditor({
  value,
  onChange,
  allItems,
  noteId,
}: {
  value: string;
  onChange: (v: string) => void;
  allItems: OmniItem[];
  noteId: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showWiki, setShowWiki] = useState(false);
  const [wikiQ, setWikiQ] = useState('');
  const [wikiStart, setWikiStart] = useState(-1);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    const before = text.slice(0, cursor);
    const m = before.match(/\[\[([^\[\]]*)$/);
    onChange(text);
    if (m) {
      setWikiQ(m[1]);
      setWikiStart(before.lastIndexOf('[['));
      setShowWiki(true);
    } else {
      setShowWiki(false);
    }
  }

  function handleWikiSelect(item: OmniItem) {
    if (!ref.current) return;
    const cursor = ref.current.selectionStart;
    const before = value.slice(0, wikiStart);
    const after = value.slice(cursor);
    onChange(`${before}[[${item.title}]]${after}`);
    setShowWiki(false);
  }

  function insert(pre: string, suf = '', ph = 'text') {
    const ta = ref.current;
    if (!ta) return;
    const s = ta.selectionStart,
      e = ta.selectionEnd;
    const sel = value.slice(s, e) || ph;
    onChange(value.slice(0, s) + pre + sel + suf + value.slice(e));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + pre.length, s + pre.length + sel.length);
    }, 0);
  }

  const toolbarBtns = [
    { icon: <Heading1 size={14} />, tip: 'H1', action: () => insert('# ', '', '大標題') },
    { icon: <Heading2 size={14} />, tip: 'H2', action: () => insert('## ', '', '小標題') },
    { icon: <Bold size={14} />, tip: '粗體', action: () => insert('**', '**', '粗體') },
    { icon: <Italic size={14} />, tip: '斜體', action: () => insert('*', '*', '斜體') },
    { icon: <Code size={14} />, tip: '程式碼', action: () => insert('`', '`', 'code') },
    { icon: <List size={14} />, tip: '列表', action: () => insert('- ', '', '項目') },
    { icon: <Link2 size={14} />, tip: '雙向連結', action: () => insert('[[', ']]', '物件名稱') },
  ];

  return (
    <div className="relative flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-4 py-2 flex-wrap"
        style={{ borderBottom: '1.5px dashed #EDDECC' }}
      >
        {toolbarBtns.map((btn, i) => (
          <ToolBtn key={i} icon={btn.icon} tip={btn.tip} onClick={btn.action} />
        ))}
        <div
          className="h-4 mx-2"
          style={{ borderLeft: '1.5px dashed #EDDECC' }}
        />
        <span className="text-xs font-medium" style={{ color: '#BCAAA4' }}>
          輸入 [[ 建立雙向連結 🐾
        </span>
      </div>

      {/* Wiki popover */}
      {showWiki && (
        <div className="absolute left-4 top-14 z-50">
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
        placeholder={'開始撰寫…\n\n# 大標題\n**粗體** *斜體* `程式碼`\n- 🐾 清單項目\n\n輸入 [[ 建立雙向連結'}
        className="flex-1 p-5 font-mono leading-relaxed outline-none bg-transparent resize-none"
        style={{
          fontSize: '0.9375rem',
          color: '#3E2723',
          caretColor: '#E68A00',
        }}
        spellCheck={false}
      />
    </div>
  );
}

/* ── Empty state for editor panel ───────────────────── */
function EditorEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-10">
      {/* Sleeping cat illustration */}
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{
          background: 'linear-gradient(135deg, #FFF3E0, #FFE8C2)',
          border: '1.5px dashed #FFB74D',
          boxShadow: '0 4px 16px rgba(255,183,77,0.15)',
        }}
      >
        <span className="text-5xl select-none" style={{ lineHeight: 1 }}>
          😺
        </span>
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: '#3E2723' }}>
        選擇或建立筆記
      </h3>
      <p className="text-sm mb-6" style={{ color: '#A1887F' }}>
        從左側選擇，或建立新的 Markdown 備忘錄
      </p>
      <button
        onClick={onCreate}
        className="btn-warm flex items-center gap-2 px-5 py-2.5 text-sm transition-all"
      >
        <Plus size={15} />
        建立新筆記 🐾
      </button>
    </div>
  );
}

/* ── Main NotesView ─────────────────────────────────── */
export function NotesView() {
  const { items, addItem, updateItem, user, setSelectedItemId } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [search, setSearch] = useState('');

  const notes = items.filter(i => i.type === 'Note' && i.status !== 'Archived');
  const filtered = notes.filter(
    n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()),
  );
  const editingNote = editingId ? items.find(i => i.id === editingId) : null;

  async function createNote() {
    const note = createNewItem({
      title: '未命名筆記',
      user_id: user?.uid ?? ANONYMOUS_USER_ID,
      type: 'Note',
      content: '',
    });
    await addItem(note);
    setEditingId(note.id);
    setSelectedItemId(note.id);
  }

  function updateContent(noteId: string, content: string) {
    const backlinkMatches = content.match(/\[\[([^\]]+)\]\]/g) || [];
    const refs = items
      .filter(i => backlinkMatches.map(m => m.slice(2, -2)).includes(i.title))
      .map(i => i.id);
    updateItem(noteId, { content, backlinks: refs });
  }

  return (
    <div className="flex h-full" style={{ background: '#FDFBF7' }}>
      {/* ── Notes list panel ────────────────────────────── */}
      <div
        className="w-64 flex flex-col flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, #FFF8ED 0%, #FAF6F0 100%)',
          borderRight: '1.5px dashed #EDDECC',
        }}
      >
        {/* List header */}
        <div
          className="p-4"
          style={{ borderBottom: '1.5px dashed #EDDECC' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📝</span>
              <h2
                className="text-sm font-bold"
                style={{ color: '#3E2723' }}
              >
                所有筆記
              </h2>
            </div>
            <button
              onClick={createNote}
              className="w-7 h-7 rounded-xl flex items-center justify-center transition-all font-bold"
              style={{
                background: 'linear-gradient(135deg, #FFB74D, #E68A00)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(230,138,0,0.3)',
              }}
              title="建立新筆記"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Search bar */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EDDECC',
            }}
          >
            <Search size={12} style={{ color: '#BCAAA4' }} />
            <input
              type="text"
              placeholder="搜尋筆記…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-xs outline-none w-full bg-transparent"
              style={{ color: '#3E2723' }}
            />
          </div>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <span className="text-4xl block mb-3">🐱</span>
              <p className="text-xs font-medium" style={{ color: '#BCAAA4' }}>
                {search ? '找不到符合的筆記' : '按右上角 + 建立筆記'}
              </p>
            </div>
          )}

          {filtered.map(note => {
            const isActive = editingId === note.id;
            return (
              <button
                key={note.id}
                onClick={() => {
                  setEditingId(note.id);
                  setSelectedItemId(note.id);
                }}
                className="w-full text-left p-3 rounded-2xl transition-all border"
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #FFF3E0, #FFE8C2)',
                        borderColor: 'rgba(255,183,77,0.5)',
                        boxShadow: '0 2px 8px rgba(255,183,77,0.2)',
                      }
                    : {
                        background: 'transparent',
                        borderColor: 'transparent',
                      }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = '#FFF8ED';
                    (e.currentTarget as HTMLElement).style.borderColor = '#EDDECC';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText
                    size={12}
                    style={{ color: isActive ? '#E68A00' : '#BCAAA4', flexShrink: 0 }}
                  />
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: isActive ? '#E65100' : '#3E2723' }}
                  >
                    {note.title}
                  </p>
                </div>

                {note.content && (
                  <p
                    className="text-xs line-clamp-2 ml-4"
                    style={{ color: '#A1887F' }}
                  >
                    {truncate(note.content.replace(/[#*`\[\]]/g, ''), 70)}
                  </p>
                )}

                <div className="flex items-center gap-1 mt-1.5 ml-4 flex-wrap">
                  {note.tags.slice(0, 2).map(t => (
                    <span
                      key={t}
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        background: 'rgba(255,183,77,0.12)',
                        border: '1px solid rgba(255,183,77,0.3)',
                        color: '#E68A00',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                  {(note.backlinks?.length ?? 0) > 0 && (
                    <span
                      className="text-xs flex items-center gap-0.5 ml-auto"
                      style={{ color: '#BCAAA4' }}
                    >
                      <Link2 size={9} />
                      {note.backlinks.length}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer count */}
        <div
          className="px-4 py-2"
          style={{ borderTop: '1.5px dashed #EDDECC' }}
        >
          <p className="text-xs font-medium text-center" style={{ color: '#BCAAA4' }}>
            🐾 共 {filtered.length} 篇筆記
          </p>
        </div>
      </div>

      {/* ── Editor / Preview panel ──────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {editingNote ? (
          <>
            {/* Note header */}
            <div
              className="flex items-center gap-4 px-6 py-4"
              style={{
                background: '#FFF8ED',
                borderBottom: '1.5px dashed #EDDECC',
              }}
            >
              <input
                type="text"
                value={editingNote.title}
                onChange={e => updateItem(editingNote.id, { title: e.target.value })}
                className="text-xl font-bold outline-none flex-1 bg-transparent"
                style={{
                  color: '#3E2723',
                }}
                placeholder="筆記標題…"
              />

              {/* Preview / Edit toggle */}
              <button
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                style={
                  preview
                    ? {
                        background: 'linear-gradient(135deg, #FFF3E0, #FFE8C2)',
                        borderColor: 'rgba(255,183,77,0.5)',
                        color: '#E65100',
                      }
                    : {
                        background: '#FFFFFF',
                        borderColor: '#EDDECC',
                        color: '#8D6E63',
                      }
                }
              >
                {preview ? <Edit3 size={12} /> : <Eye size={12} />}
                {preview ? '✏️ 編輯' : '👁 預覽'}
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto scrollbar-none">
              {preview ? (
                /* Preview mode */
                <div
                  className="px-8 py-6 max-w-3xl mx-auto"
                  style={{ color: '#3E2723' }}
                >
                  <div
                    className="leading-relaxed"
                    style={{ fontSize: '0.9375rem', color: '#3E2723' }}
                    dangerouslySetInnerHTML={{
                      __html: renderMd(editingNote.content || '*（空白筆記，切換到編輯模式開始撰寫）*'),
                    }}
                  />
                  <BacklinkPanel noteId={editingNote.id} allItems={items} />
                </div>
              ) : (
                /* Edit mode */
                <div className="h-full flex flex-col">
                  <MarkdownEditor
                    value={editingNote.content}
                    onChange={v => updateContent(editingNote.id, v)}
                    allItems={items}
                    noteId={editingNote.id}
                  />
                  <div
                    className="px-6 pb-5"
                    style={{ borderTop: '1.5px dashed #EDDECC' }}
                  >
                    <BacklinkPanel noteId={editingNote.id} allItems={items} />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom status bar */}
            <div
              className="px-6 py-2 flex items-center gap-4"
              style={{
                borderTop: '1.5px dashed #EDDECC',
                background: '#FFF8ED',
              }}
            >
              <span className="text-xs font-medium" style={{ color: '#BCAAA4' }}>
                {editingNote.content.length} 字
              </span>
              <span className="text-xs font-medium" style={{ color: '#BCAAA4' }}>
                {editingNote.content.split('\n').length} 行
              </span>
              <span className="text-xs font-medium" style={{ color: '#BCAAA4' }}>
                {(editingNote.backlinks?.length ?? 0) > 0
                  ? `🔗 ${editingNote.backlinks.length} 個連結`
                  : '無連結'}
              </span>
              <span className="ml-auto text-xs" style={{ color: '#BCAAA4' }}>
                {editingNote.tags.map(t => `#${t}`).join(' ') || '無標籤'}
              </span>
            </div>
          </>
        ) : (
          <EditorEmptyState onCreate={createNote} />
        )}
      </div>
    </div>
  );
}
