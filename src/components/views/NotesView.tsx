// ============================================================
// OmniFlow - Markdown Notes & Backlinks View (Module C)
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Search, Link2, Eye, Edit3, Bold, Italic,
  Code, List, Heading1, Heading2, Hash, ChevronRight
} from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { createNewItem, ANONYMOUS_USER_ID, cn, truncate } from '../../lib/utils';
import type { OmniItem } from '../../types';

// Simple Markdown Renderer
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-gray-800 mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-xl my-3 overflow-x-auto text-sm font-mono">$1</pre>')
    .replace(/^\- (.+)$/gm, '<li class="flex items-start gap-2 my-0.5"><span class="text-brand-500 mt-1">•</span><span>$1</span></li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="my-0.5 ml-4">$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-brand-300 pl-4 py-1 my-2 text-gray-600 italic bg-brand-50 rounded-r-lg">$1</blockquote>')
    .replace(/\[\[([^\]]+)\]\]/g, '<span class="inline-flex items-center gap-1 text-brand-600 font-medium cursor-pointer hover:underline bg-brand-50 px-1.5 py-0.5 rounded">🔗 $1</span>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-600 underline hover:text-brand-700" target="_blank">$1</a>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

interface BacklinkMentionPanelProps {
  noteId: string;
  allItems: OmniItem[];
}

function BacklinkMentionPanel({ noteId, allItems }: BacklinkMentionPanelProps) {
  const { setSelectedItemId } = useApp();
  const mentioningItems = allItems.filter(
    item => item.backlinks?.includes(noteId) && item.id !== noteId
  );

  if (mentioningItems.length === 0) return null;

  return (
    <div className="mt-6 border-t border-surface-200 pt-5">
      <div className="flex items-center gap-2 mb-3">
        <Link2 size={14} className="text-brand-500" />
        <h3 className="text-sm font-semibold text-gray-700">提及此筆記的連結 ({mentioningItems.length})</h3>
      </div>
      <div className="space-y-2">
        {mentioningItems.map(item => (
          <button
            key={item.id}
            onClick={() => setSelectedItemId(item.id)}
            className="w-full text-left p-3 rounded-xl bg-brand-50 border border-brand-100 hover:border-brand-300 hover:bg-brand-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText size={13} className="text-brand-500" />
              <span className="text-sm font-medium text-brand-700">{item.title}</span>
            </div>
            {item.content && (
              <p className="text-xs text-gray-500 line-clamp-2 ml-5">
                {truncate(item.content.replace(/[#*`\[\]]/g, ''), 120)}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Wiki-link autocomplete popover
interface WikiLinkPopoverProps {
  items: OmniItem[];
  query: string;
  onSelect: (item: OmniItem) => void;
  position: { top: number; left: number };
}

function WikiLinkPopover({ items, query, onSelect, position }: WikiLinkPopoverProps) {
  const filtered = items
    .filter(i => i.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  if (filtered.length === 0) return null;

  return (
    <div
      style={{ top: position.top, left: position.left }}
      className="absolute z-50 bg-white border border-surface-200 rounded-xl shadow-2xl w-72 overflow-hidden animate-fade-in"
    >
      <div className="px-3 py-2 border-b border-surface-100">
        <p className="text-xs text-gray-400 font-medium">選擇連結物件</p>
      </div>
      {filtered.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="w-full text-left px-4 py-2.5 hover:bg-brand-50 transition-colors flex items-center gap-3"
        >
          <span className="text-sm">
            {item.type === 'Note' ? '📝' : item.type === 'Project' ? '📁' : '✅'}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-800">{item.title}</p>
            {item.content && (
              <p className="text-xs text-gray-400 line-clamp-1">{truncate(item.content, 60)}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function MarkdownEditor({
  value,
  onChange,
  allItems,
  currentNoteId,
}: {
  value: string;
  onChange: (v: string) => void;
  allItems: OmniItem[];
  currentNoteId: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showWikiPopover, setShowWikiPopover] = useState(false);
  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiPos, setWikiPos] = useState({ top: 0, left: 0 });
  const [wikiStart, setWikiStart] = useState(-1);

  function handleKeyInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    onChange(text);

    // Detect [[ wiki link trigger
    const cursor = e.target.selectionStart;
    const before = text.slice(0, cursor);
    const match = before.match(/\[\[([^\[\]]*?)$/);

    if (match) {
      setWikiQuery(match[1]);
      setWikiStart(before.lastIndexOf('[['));
      setShowWikiPopover(true);
      // Calculate position (simplified)
      const textarea = textareaRef.current;
      if (textarea) {
        setWikiPos({ top: 200, left: 80 });
      }
    } else {
      setShowWikiPopover(false);
    }
  }

  function handleWikiSelect(item: OmniItem) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const before = value.slice(0, wikiStart);
    const after = value.slice(cursor);
    const newText = `${before}[[${item.title}]]${after}`;
    onChange(newText);
    setShowWikiPopover(false);

    // Update backlinks on both sides
    // (handled in parent via updateItem)
  }

  function insertMarkdown(prefix: string, suffix = '', placeholder = '文字') {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const newText = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-surface-100 flex-wrap">
        {[
          { icon: <Heading1 size={14} />, action: () => insertMarkdown('# ', '', '標題'), tip: 'H1' },
          { icon: <Heading2 size={14} />, action: () => insertMarkdown('## ', '', '標題'), tip: 'H2' },
          { icon: <Bold size={14} />, action: () => insertMarkdown('**', '**', '粗體'), tip: '粗體' },
          { icon: <Italic size={14} />, action: () => insertMarkdown('*', '*', '斜體'), tip: '斜體' },
          { icon: <Code size={14} />, action: () => insertMarkdown('`', '`', '程式碼'), tip: '程式碼' },
          { icon: <List size={14} />, action: () => insertMarkdown('- ', '', '項目'), tip: '列表' },
          { icon: <Link2 size={14} />, action: () => insertMarkdown('[[', ']]', '物件名稱'), tip: '雙向連結' },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            title={btn.tip}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {btn.icon}
          </button>
        ))}
        <div className="ml-1 pl-1 border-l border-surface-200">
          <span className="text-xs text-gray-400 px-2">支援 Markdown · 輸入 [[ 建立連結</span>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleKeyInput}
        placeholder="開始撰寫... 支援 Markdown 語法&#10;&#10;輸入 [[ 建立雙向連結&#10;# 使用 # 作為標題&#10;**粗體** *斜體* `程式碼`"
        className="flex-1 p-4 text-sm text-gray-800 font-mono leading-relaxed resize-none outline-none bg-transparent placeholder-gray-300"
        spellCheck={false}
      />

      {/* Wiki Link Popover */}
      {showWikiPopover && (
        <WikiLinkPopover
          items={allItems.filter(i => i.id !== currentNoteId)}
          query={wikiQuery}
          onSelect={handleWikiSelect}
          position={wikiPos}
        />
      )}
    </div>
  );
}

export function NotesView() {
  const { items, addItem, updateItem, user, setSelectedItemId, selectedItemId } = useApp();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notes = items.filter(i => i.type === 'Note' && i.status !== 'Archived');
  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const editingNote = editingNoteId ? items.find(i => i.id === editingNoteId) : null;

  async function createNote() {
    const userId = user?.uid ?? ANONYMOUS_USER_ID;
    const note = createNewItem({
      title: '未命名筆記',
      user_id: userId,
      type: 'Note',
      status: 'Todo',
      content: '',
    });
    await addItem(note);
    setEditingNoteId(note.id);
    setSelectedItemId(note.id);
  }

  function handleContentChange(noteId: string, content: string) {
    // Extract backlinks from [[...]] patterns
    const backlinkMatches = content.match(/\[\[([^\]]+)\]\]/g) || [];
    const referencedTitles = backlinkMatches.map(m => m.slice(2, -2));
    const referencedIds = items
      .filter(i => referencedTitles.includes(i.title))
      .map(i => i.id);

    updateItem(noteId, { content, backlinks: referencedIds });
  }

  function handleTitleChange(noteId: string, title: string) {
    updateItem(noteId, { title });
  }

  return (
    <div className="flex h-full">
      {/* Note List Panel */}
      <div className="w-72 border-r border-surface-200 flex flex-col bg-surface-50">
        <div className="p-4 border-b border-surface-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">所有筆記</h2>
            <button
              onClick={createNote}
              className="w-7 h-7 bg-brand-500 text-white rounded-lg flex items-center justify-center hover:bg-brand-600 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-3 py-2">
            <Search size={13} className="text-gray-400" />
            <input
              type="text"
              placeholder="搜尋筆記..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="text-xs outline-none w-full text-gray-700 placeholder-gray-400 bg-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <FileText size={24} className="text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">
                {searchQuery ? '找不到符合的筆記' : '按右上角 + 建立第一則筆記'}
              </p>
            </div>
          )}
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => { setEditingNoteId(note.id); setSelectedItemId(note.id); }}
              className={cn(
                'w-full text-left p-3 rounded-xl transition-all',
                editingNoteId === note.id
                  ? 'bg-brand-50 border border-brand-200'
                  : 'hover:bg-surface-100 border border-transparent'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText size={13} className="text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-800 truncate">{note.title}</p>
              </div>
              {note.content && (
                <p className="text-xs text-gray-400 line-clamp-2 ml-5">
                  {truncate(note.content.replace(/[#*`\[\]]/g, ''), 80)}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1.5 ml-5">
                {note.tags.slice(0, 2).map(t => (
                  <span key={t} className="text-xs text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-full">#{t}</span>
                ))}
                {note.backlinks?.length > 0 && (
                  <span className="text-xs text-gray-400 flex items-center gap-0.5 ml-auto">
                    <Link2 size={10} />{note.backlinks.length}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor / Preview Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {editingNote ? (
          <>
            {/* Note Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
              <input
                type="text"
                value={editingNote.title}
                onChange={e => handleTitleChange(editingNote.id, e.target.value)}
                className="text-xl font-bold text-gray-900 outline-none flex-1 bg-transparent placeholder-gray-300"
                placeholder="筆記標題..."
              />
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all',
                    previewMode
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
                  )}
                >
                  {previewMode ? <Edit3 size={13} /> : <Eye size={13} />}
                  {previewMode ? '編輯' : '預覽'}
                </button>
              </div>
            </div>

            {/* Editor or Preview */}
            <div className="flex-1 overflow-y-auto">
              {previewMode ? (
                <div className="px-6 py-5 max-w-3xl">
                  <div
                    className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(editingNote.content || '*（空白筆記）*')
                    }}
                  />
                  <BacklinkMentionPanel noteId={editingNote.id} allItems={items} />
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <MarkdownEditor
                    value={editingNote.content}
                    onChange={v => handleContentChange(editingNote.id, v)}
                    allItems={items}
                    currentNoteId={editingNote.id}
                  />
                  <div className="px-4 pb-4 border-t border-surface-100">
                    <BacklinkMentionPanel noteId={editingNote.id} allItems={items} />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-5">
              <FileText size={36} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">選擇或建立筆記</h3>
            <p className="text-gray-400 text-sm mb-5">從左側選擇筆記，或建立新的 Markdown 備忘錄</p>
            <button
              onClick={createNote}
              className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors font-medium text-sm"
            >
              <Plus size={16} />
              建立新筆記
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
