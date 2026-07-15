// ============================================================
// OmniFlow — Quick Capture · Warm Cat Theme Edition 🐾
// ============================================================

import React, { useState, useRef } from 'react';
import { Plus, Tag, Calendar, AlertTriangle, Sparkles } from 'lucide-react';
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
        'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 warm-card',
        focused && 'border-orange-300 shadow-warm-md',
      )}>
        {/* Cat paw add button */}
        <button
          onClick={handleSubmit}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all btn-warm hover:scale-110 active:scale-95"
          style={{background:'linear-gradient(135deg, #FFB74D, #E68A00)'}}
          title="新增 (Enter)"
        >
          <span className="text-base leading-none">🐾</span>
        </button>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
            if (e.key === 'Escape') { setInput(''); setPreview(null); inputRef.current?.blur(); }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="快速捕捉… 試試「明天下午3點開會 #工作 !高」"
          className="flex-1 text-sm outline-none bg-transparent font-medium"
          style={{color:'#3E2723'}}
        />

        {input && (
          <button
            onClick={handleSubmit}
            className="flex-shrink-0 btn-warm px-4 py-1.5 text-xs"
          >
            新增
          </button>
        )}
      </div>

      {/* NLP Preview popover */}
      {preview && focused && input.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 warm-card p-4 z-50 animate-fade-in" style={{zIndex:50}}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">✨</span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{color:'#E68A00'}}>NLP 解析預覽</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold w-10 flex-shrink-0" style={{color:'#A1887F'}}>標題</span>
              <span className="text-sm font-semibold" style={{color:'#3E2723'}}>{preview.title || '(空白)'}</span>
            </div>

            {preview.due_date && (
              <div className="flex items-center gap-3">
                <Calendar size={13} style={{color:'#A1887F'}} className="flex-shrink-0"/>
                <span className="text-xs font-semibold w-8 flex-shrink-0" style={{color:'#A1887F'}}>時間</span>
                <span className="text-sm font-bold" style={{color:'#E65100'}}>
                  {new Date(preview.due_date).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}

            {preview.tags.length > 0 && (
              <div className="flex items-center gap-3">
                <Tag size={13} style={{color:'#A1887F'}} className="flex-shrink-0"/>
                <span className="text-xs font-semibold w-8 flex-shrink-0" style={{color:'#A1887F'}}>標籤</span>
                <div className="flex gap-1 flex-wrap">
                  {preview.tags.map(t => (
                    <span key={t} className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{background:'#FFE8C2', border:'1.5px solid #FFB74D', color:'#E65100'}}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {preview.priority && preview.priority !== 'None' && (
              <div className="flex items-center gap-3">
                <AlertTriangle size={13} style={{color:'#A1887F'}} className="flex-shrink-0"/>
                <span className="text-xs font-semibold w-8 flex-shrink-0" style={{color:'#A1887F'}}>優先</span>
                <span className={cn('text-xs font-bold px-2.5 py-0.5 rounded-full', PRIORITY_BADGE_CLASS[preview.priority])}>
                  {PRIORITY_LABEL[preview.priority]}優先
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 text-xs font-medium" style={{borderTop:'1.5px dashed #EDDECC', color:'#A1887F'}}>
            按 <kbd className="px-1.5 py-0.5 rounded-lg text-xs font-bold mx-0.5"
              style={{background:'#F5EBE0', border:'1.5px solid #EDDECC', color:'#5D3A1A'}}>Enter</kbd> 確認新增 🐾
          </div>
        </div>
      )}
    </div>
  );
}
