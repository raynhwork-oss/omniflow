// ============================================================
// OmniFlow — Sidebar · Dark Glassmorphism Edition
// ============================================================

import React, { useState } from 'react';
import {
  Inbox, Star, Kanban, Calendar, FileText, List,
  User, Cloud, CloudOff, Loader2, Search, Plus,
  ChevronLeft, ChevronRight, LogOut, LogIn,
  Zap, AlertCircle, X, Shield
} from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import type { ViewType } from '../../types';
import { cn } from '../../lib/utils';
import {
  signOutUser, signInWithGoogle, signInWithEmail,
  registerWithEmail, isFirebaseConfigured,
} from '../../lib/firebase';
import { isOverdue, isToday } from '../../lib/nlp';

const NAV_ITEMS: {
  id: ViewType; label: string; icon: React.ReactNode; accent: string;
}[] = [
  { id: 'inbox',    label: '收件夾',    icon: <Inbox    size={16}/>, accent: 'text-cyan-400'   },
  { id: 'today',    label: '今日專注',  icon: <Star     size={16}/>, accent: 'text-amber-400'  },
  { id: 'kanban',   label: '專案看板',  icon: <Kanban   size={16}/>, accent: 'text-violet-400' },
  { id: 'calendar', label: '行事曆',    icon: <Calendar size={16}/>, accent: 'text-brand-400'  },
  { id: 'notes',    label: '所有筆記',  icon: <FileText size={16}/>, accent: 'text-emerald-400'},
  { id: 'all',      label: '全部項目',  icon: <List     size={16}/>, accent: 'text-slate-400'  },
];

/* ── Sync Indicator ─────────────────────────────────────── */
function SyncIndicator({ status }: { status: string }) {
  const base = 'flex items-center gap-1.5 text-xs font-medium';
  if (status === 'synced')
    return <span className={cn(base,'text-emerald-400')}><Cloud size={11}/>已同步</span>;
  if (status === 'syncing')
    return <span className={cn(base,'text-amber-400')}><Loader2 size={11} className="animate-spin"/>同步中</span>;
  if (status === 'error')
    return <span className={cn(base,'text-rose-400')}><AlertCircle size={11}/>同步失敗</span>;
  return <span className={cn(base,'text-slate-500')}><CloudOff size={11}/>本地模式</span>;
}

/* ── Auth Modal ─────────────────────────────────────────── */
function AuthModal({ onClose }: { onClose: () => void }) {
  const { setUser } = useApp();
  const [mode, setMode]       = useState<'login' | 'register'>('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleGoogle() {
    setLoading(true); setError('');
    try {
      const u = await signInWithGoogle();
      if (u) { setUser({ uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL }); onClose(); }
    } catch (e: any) { setError(e.message || 'Google 登入失敗'); }
    finally { setLoading(false); }
  }

  async function handleEmail() {
    setLoading(true); setError('');
    try {
      const fn = mode === 'login' ? signInWithEmail : registerWithEmail;
      const u  = await fn(email, password);
      if (u) { setUser({ uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL }); onClose(); }
    } catch (e: any) { setError(e.message || '操作失敗'); }
    finally { setLoading(false); }
  }

  /* Firebase not configured → info screen */
  if (!isFirebaseConfigured()) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-card w-96 p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Shield size={16} className="text-brand-400"/> Firebase 尚未設定
            </h2>
            <button onClick={onClose} className="btn-ghost p-1.5"><X size={15}/></button>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            雲端同步需要配置 Firebase。請在 Netlify Dashboard 設定環境變數：
          </p>
          <ul className="font-mono text-xs bg-dark-700 rounded-xl p-3 space-y-1 text-slate-300 mb-4">
            {['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_STORAGE_BUCKET','VITE_FIREBASE_MESSAGING_SENDER_ID','VITE_FIREBASE_APP_ID']
              .map(k => <li key={k} className="text-brand-300">{k}</li>)}
          </ul>
          <p className="text-xs text-emerald-400 mb-4">✓ 目前以本地模式完整運行，資料安全儲存於瀏覽器中。</p>
          <button onClick={onClose} className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all">
            繼續本地使用
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card w-96 p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-sm">
              <Zap size={14} className="text-white"/>
            </div>
            <h2 className="font-semibold text-slate-200">
              {mode === 'login' ? '登入 OmniFlow' : '建立帳號'}
            </h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={15}/></button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Google */}
        <button
          onClick={handleGoogle} disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-xl py-3 hover:bg-white/05 hover:border-brand-500/30 transition-all text-sm font-medium text-slate-300 mb-4"
        >
          <svg viewBox="0 0 24 24" width="17" height="17">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          使用 Google 繼續
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/08"/>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-dark-600 px-3 text-xs text-slate-500">或用電子郵件</span>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="電子郵件"
            className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-brand-500/50 focus:bg-dark-600 transition-all"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmail()}
            placeholder="密碼"
            className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-brand-500/50 focus:bg-dark-600 transition-all"
          />
        </div>

        <button
          onClick={handleEmail} disabled={loading}
          className="w-full mt-4 bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 shadow-glow-sm"
        >
          {loading ? '處理中…' : mode === 'login' ? '登入' : '建立帳號'}
        </button>

        <p className="mt-3 text-center text-sm text-slate-500">
          {mode === 'login' ? '還沒帳號？' : '已有帳號？'}
          {' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            {mode === 'login' ? '建立帳號' : '登入'}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ── Main Sidebar ────────────────────────────────────────── */
export function Sidebar() {
  const {
    currentView, setCurrentView,
    sidebarOpen, setSidebarOpen,
    user, syncStatus, items,
    setUser, searchQuery, setSearchQuery,
  } = useApp();
  const [showAuth, setShowAuth] = useState(false);

  const todayCount    = items.filter(i => i.due_date && isToday(i.due_date) && i.status !== 'Done' && i.status !== 'Archived').length;
  const inboxCount    = items.filter(i => (i.type === 'Inbox' || (i.type === 'Task' && !i.project_id)) && i.status !== 'Archived').length;
  const overdueCount  = items.filter(i => i.due_date && isOverdue(i.due_date) && i.status !== 'Done' && i.status !== 'Archived').length;

  const counts: Partial<Record<ViewType, number>> = { inbox: inboxCount, today: todayCount };

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)}/>}

      <aside className={cn(
        'sidebar-glass flex flex-col h-full transition-all duration-300 relative flex-shrink-0',
        sidebarOpen ? 'w-56' : 'w-14',
      )}>

        {/* ── Logo & collapse ───── */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/06">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-sm flex-shrink-0">
                <Zap size={14} className="text-white"/>
              </div>
              <span className="font-bold text-sm text-gradient-brand tracking-wide">OmniFlow</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost p-1.5 ml-auto"
            title={sidebarOpen ? '收合側邊欄' : '展開側邊欄'}
          >
            {sidebarOpen ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
          </button>
        </div>

        {/* ── Search ───────────── */}
        {sidebarOpen && (
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-2 bg-dark-700 border border-white/07 rounded-xl px-3 py-2 focus-within:border-brand-500/40 transition-all">
              <Search size={13} className="text-slate-500 flex-shrink-0"/>
              <input
                type="text" placeholder="搜尋…" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm w-full outline-none text-slate-300 placeholder-slate-600"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <X size={11}/>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Nav ──────────────── */}
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto scrollbar-none">
          {NAV_ITEMS.map(item => {
            const count   = counts[item.id];
            const active  = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm group',
                  active
                    ? 'bg-brand-600/20 border border-brand-500/25 text-brand-300 shadow-glow-sm'
                    : 'text-slate-400 hover:bg-white/05 hover:text-slate-200 border border-transparent',
                  !sidebarOpen && 'justify-center',
                )}
              >
                <span className={cn('flex-shrink-0 transition-colors', active ? item.accent : 'group-hover:' + item.accent)}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {count !== undefined && count > 0 && (
                      <span className={cn(
                        'text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                        active ? 'bg-brand-500/30 text-brand-300' : 'bg-dark-300 text-slate-400',
                      )}>
                        {count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}

          {/* Overdue warning */}
          {sidebarOpen && overdueCount > 0 && (
            <button
              onClick={() => setCurrentView('inbox')}
              className="mx-1 mt-2 w-[calc(100%-8px)] flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/15 transition-all"
            >
              <AlertCircle size={13} className="text-rose-400 flex-shrink-0"/>
              <span className="text-xs text-rose-300 font-medium">{overdueCount} 項已過期</span>
            </button>
          )}
        </nav>

        {/* ── Footer ───────────── */}
        <div className="border-t border-white/06 p-3 space-y-2">
          {sidebarOpen && (
            <div className="px-1.5">
              <SyncIndicator status={syncStatus}/>
            </div>
          )}

          {user ? (
            <div className={cn('flex items-center gap-2', !sidebarOpen && 'justify-center')}>
              {user.photoURL
                ? <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full ring-1 ring-brand-500/30 flex-shrink-0"/>
                : <div className="w-7 h-7 rounded-full bg-brand-600/20 border border-brand-500/25 flex items-center justify-center flex-shrink-0">
                    <User size={13} className="text-brand-400"/>
                  </div>
              }
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-300 truncate">
                    {user.displayName || user.email || '用戶'}
                  </p>
                  <button
                    onClick={() => { signOutUser(); setUser(null); }}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-0.5"
                  >
                    <LogOut size={10}/> 登出
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              title={!sidebarOpen ? '登入同步' : undefined}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400',
                'hover:bg-white/05 hover:text-slate-200 border border-transparent hover:border-brand-500/20 transition-all',
                !sidebarOpen && 'justify-center',
              )}
            >
              <LogIn size={15}/>
              {sidebarOpen && <span className="text-xs font-medium">登入以同步雲端</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
