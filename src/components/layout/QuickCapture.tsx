// ============================================================
// OmniFlow - Quick Capture Bar (with NLP)
// ============================================================

import React, { useState, useRef } from 'react';
import { Plus, Zap, Tag, Calendar, AlertTriangle } from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import { parseNaturalInput } from '../../lib/nlp';
import { createNewItem } from '../../lib/utils';
import { ANONYMOUS_USER_ID } from '../../lib/utils';
import { cn } from '../../lib/utils';

export function QuickCapture() {
  const { addItem, user } = useApp();
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof parseNaturalInput> | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(val: string) {
    setInput(val);
    if (val.trim().length > 2) {
      const parsed = parseNaturalInput(val);
      setPreview(parsed);
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit() {
    const text = input.trim();
    if (!text) return;

    const parsed = parseNaturalInput(text);
    const userId = user?.uid ?? ANONYMOUS_USER_ID;

    const newItem = createNewItem({
      title: parsed.title || text,
      user_id: userId,
      type: 'Inbox',
      status: 'Todo',
      priority: parsed.priority ?? 'None',
      due_date: parsed.due_date,
      tags: parsed.tags,
    });

    await addItem(newItem);
    setInput('');
    setPreview(null);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setInput('');
      setPreview(null);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="relative">
      <div className={cn(
        'flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 transition-all duration-200',
        focused
          ? 'border-brand-400 shadow-md shadow-brand-100 ring-1 ring-brand-200'
          : 'border-surface-200 hover:border-surface-300 shadow-sm'
      )}>
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
          <Plus size={16} className="text-white" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="快速捕捉... 試試「明天下午3點開會 #工作」"
          className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
        />
        {input && (
          <button
            onClick={handleSubmit}
            className="flex-shrink-0 bg-brand-500 text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            新增
          </button>
        )}
      </div>

      {/* NLP Preview */}
      {preview && focused && input.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-surface-200 rounded-2xl shadow-xl p-4 z-50 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-brand-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">AI 解析預覽</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 w-12 flex-shrink-0 pt-0.5">標題</span>
              <span className="text-sm font-medium text-gray-900">{preview.title || '(空白)'}</span>
            </div>

            {preview.due_date && (
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-400 w-10 flex-shrink-0">時間</span>
                <span className="text-sm text-amber-600 font-medium">
                  {new Date(preview.due_date).toLocaleString('zh-TW', {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            )}

            {preview.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag size={12} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-400 w-10 flex-shrink-0">標籤</span>
                <div className="flex gap-1 flex-wrap">
                  {preview.tags.map(t => (
                    <span key={t} className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {preview.priority && preview.priority !== 'None' && (
              <div className="flex items-center gap-2">
                <AlertTriangle size={12} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-400 w-10 flex-shrink-0">優先</span>
                <span className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  preview.priority === 'High' ? 'bg-red-100 text-red-700' :
                    preview.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                )}>
                  {preview.priority}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-surface-100">
            <p className="text-xs text-gray-400">
              按 <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">Enter</kbd> 確認新增
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
