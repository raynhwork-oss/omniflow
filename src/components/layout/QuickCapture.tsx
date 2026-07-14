// ============================================================
// OmniFlow — Quick Capture · Dark Edition
// ============================================================

import React, { useState, useRef } from 'react';
import { Plus, Zap, Tag, Calendar, AlertTriangle, Sparkles } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { parseNaturalInput } from '../../lib/nlp';
import { createNewItem, ANONYMOUS_USER_ID, cn, PRIORITY_BADGE_CLASS, PRIORITY_LABEL } from '../../lib/utils';

export function QuickCapture() {
  const { addItem, user } = useApp();
  const [input, setInput]     = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof parseNaturalInput> | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(val: string) {
    setInput(val);
    setPreview(val.trim().length > 2 ? parseNaturalInput(val) : null);
  }

  async function handleSubmit() {
    const text = input.trim();
    if (!text) return;
    const parsed = parseNaturalInput(text);
    const userId = user?.uid ?? ANONYMOUS_USER_ID;

    await addItem(createNewItem({
      title:    parsed.title || text,
      user_id:  userId,
      type:     'Inbox',
      status:   'Todo',
      priority: parsed.priority ?? 'None',
      due_date: parsed.due_date,
      tags:     parsed.tags,
    }));

    setInput('');
    setPreview(null);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      {/* Input bar */}
      <div className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200',
        'bg-dark-600 border',
        focused
          ? 'border-brand-500/50 shadow-glow-sm'
          : 'border-white/07 hover:border-white/12',
      )}>
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <Plus size={15} className="text-white"/>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } if (e.key === 'Escape') { setInput(''); setPreview(null); inputRef.current?.blur(); } }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="快速捕捉… 試試「明天下午3點開會 #工作 !高」"
          className="flex-1 text-sm text-slate-200 placeholder-slate-600 outline-none bg-transparent"
        />

        {input && (
          <button
            onClick={handleSubmit}
            className="flex-shrink-0 bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-glow-sm"
          >
            新增
          </button>
        )}
      </div>

      {/* NLP Preview popover */}
      {preview && focused && input.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-4 z-50 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} className="text-brand-400"/>
            <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">AI 解析預覽</span>
          </div>

          <div className="space-y-2">
            {/* Title */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 w-10 flex-shrink-0">標題</span>
              <span className="text-sm font-medium text-slate-200">{preview.title || '(空白)'}</span>
            </div>

            {/* Date */}
            {preview.due_date && (
              <div className="flex items-center gap-3">
                <Calendar size={12} className="text-slate-600 flex-shrink-0"/>
                <span className="text-xs text-slate-600 w-8 flex-shrink-0">時間</span>
                <span className="text-sm text-amber-300 font-medium">
                  {new Date(preview.due_date).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}

            {/* Tags */}
            {preview.tags.length > 0 && (
              <div className="flex items-center gap-3">
                <Tag size={12} className="text-slate-600 flex-shrink-0"/>
                <span className="text-xs text-slate-600 w-8 flex-shrink-0">標籤</span>
                <div className="flex gap-1 flex-wrap">
                  {preview.tags.map(t => (
                    <span key={t} className="text-xs bg-brand-600/20 border border-brand-500/30 text-brand-300 px-2 py-0.5 rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Priority */}
            {preview.priority && preview.priority !== 'None' && (
              <div className="flex items-center gap-3">
                <AlertTriangle size={12} className="text-slate-600 flex-shrink-0"/>
                <span className="text-xs text-slate-600 w-8 flex-shrink-0">優先</span>
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', PRIORITY_BADGE_CLASS[preview.priority])}>
                  {PRIORITY_LABEL[preview.priority]}優先
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-white/06 text-xs text-slate-600">
            按 <kbd className="px-1.5 py-0.5 bg-dark-500 border border-white/10 text-slate-400 rounded text-xs font-mono">Enter</kbd> 確認
          </div>
        </div>
      )}
    </div>
  );
}
