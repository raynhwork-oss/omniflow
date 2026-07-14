// ============================================================
// OmniFlow - Left Sidebar
// ============================================================

import React, { useState } from 'react';
import {
  Inbox, CheckSquare, Kanban, Calendar, FileText,
  List, User, Cloud, CloudOff, Loader2, Search, Plus,
  ChevronLeft, ChevronRight, Settings, LogOut, LogIn,
  Zap, Star, AlertCircle, X
} from 'lucide-react';
import { useApp } from '../../store/useAppStore';
import type { ViewType } from '../../types';
import { cn } from '../../lib/utils';
import { signOutUser, signInWithGoogle, signInWithEmail, registerWithEmail, isFirebaseConfigured } from '../../lib/firebase';
import { useApp as useAppHook } from '../../store/useAppStore';
import { isOverdue, isToday } from '../../lib/nlp';

const NAV_ITEMS: { id: ViewType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'inbox', label: '收件夾', icon: <Inbox size={18} />, description: '所有未分類項目' },
  { id: 'today', label: '今日任務', icon: <Star size={18} />, description: '今天到期的事項' },
  { id: 'kanban', label: '專案看板', icon: <Kanban size={18} />, description: '看板視角管理' },
  { id: 'calendar', label: '行事曆', icon: <Calendar size={18} />, description: '時間區塊規劃' },
  { id: 'notes', label: '所有筆記', icon: <FileText size={18} />, description: 'Markdown 備忘錄' },
  { id: 'all', label: '全部項目', icon: <List size={18} />, description: '所有物件列表' },
];

function SyncIndicator({ status }: { status: string }) {
  if (status === 'synced') {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600">
        <Cloud size={12} className="text-emerald-500" />
        已同步
      </span>
    );
  }
  if (status === 'syncing') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-600">
        <Loader2 size={12} className="animate-spin text-amber-500" />
        同步中
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs text-red-500">
        <AlertCircle size={12} />
        同步失敗
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-gray-400">
      <CloudOff size={12} />
      本地模式
    </span>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const { setUser, setSyncStatus } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      if (user) {
        setUser({ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL });
        onClose();
      }
    } catch (e: any) {
      setError(e.message || '登入失敗');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth() {
    setLoading(true);
    setError('');
    try {
      const fn = mode === 'login' ? signInWithEmail : registerWithEmail;
      const user = await fn(email, password);
      if (user) {
        setUser({ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL });
        onClose();
      }
    } catch (e: any) {
      setError(e.message || '操作失敗');
    } finally {
      setLoading(false);
    }
  }

  if (!isFirebaseConfigured()) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Firebase 未設定</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <div className="text-sm text-gray-600 space-y-2">
            <p>雲端同步功能需要配置 Firebase。</p>
            <p>請在 Netlify Dashboard 設定以下環境變數：</p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-xs bg-gray-50 p-3 rounded">
              <li>VITE_FIREBASE_API_KEY</li>
              <li>VITE_FIREBASE_AUTH_DOMAIN</li>
              <li>VITE_FIREBASE_PROJECT_ID</li>
              <li>VITE_FIREBASE_STORAGE_BUCKET</li>
              <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
              <li>VITE_FIREBASE_APP_ID</li>
            </ul>
            <p className="text-emerald-600 font-medium">目前以本地模式運行，所有資料安全儲存在您的瀏覽器中。</p>
          </div>
          <button onClick={onClose} className="mt-4 w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition-colors">
            繼續本地使用
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-brand-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'login' ? '登入 OmniFlow' : '建立帳號'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition-colors mb-4 font-medium text-sm"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          使用 Google 繼續
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white px-2">或使用電子郵件</span>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="電子郵件"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          className="w-full mt-4 bg-brand-500 text-white py-2.5 rounded-xl hover:bg-brand-600 transition-colors font-medium text-sm disabled:opacity-60"
        >
          {loading ? '處理中...' : mode === 'login' ? '登入' : '建立帳號'}
        </button>

        <p className="mt-3 text-center text-sm text-gray-500">
          {mode === 'login' ? '還沒有帳號？' : '已有帳號？'}
          {' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-brand-500 hover:text-brand-600 font-medium"
          >
            {mode === 'login' ? '建立帳號' : '登入'}
          </button>
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, user, syncStatus, items, setUser, searchQuery, setSearchQuery } = useApp();
  const [showAuth, setShowAuth] = useState(false);

  const todayCount = items.filter(i => i.due_date && isToday(i.due_date) && i.status !== 'Done' && i.status !== 'Archived').length;
  const inboxCount = items.filter(i => (i.type === 'Inbox' || (i.type === 'Task' && !i.project_id)) && i.status !== 'Archived').length;
  const overdueCount = items.filter(i => i.due_date && isOverdue(i.due_date) && i.status !== 'Done' && i.status !== 'Archived').length;

  const counts: Partial<Record<ViewType, number>> = {
    inbox: inboxCount,
    today: todayCount,
  };

  async function handleSignOut() {
    await signOutUser();
    setUser(null);
  }

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col h-full bg-surface-50 border-r border-surface-200 transition-all duration-300 relative',
          sidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-surface-200">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">OmniFlow</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-surface-200 transition-colors text-gray-500"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="px-3 py-3">
            <div className="flex items-center gap-2 bg-surface-200 rounded-lg px-3 py-2">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="搜尋..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm w-full outline-none text-gray-700 placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const count = counts[item.id];
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm',
                  currentView === item.id
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-surface-200 hover:text-gray-900'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {count !== undefined && count > 0 && (
                      <span className={cn(
                        'text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                        currentView === item.id
                          ? 'bg-white/20 text-white'
                          : 'bg-brand-100 text-brand-600'
                      )}>
                        {count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}

          {/* Overdue alert */}
          {sidebarOpen && overdueCount > 0 && (
            <div
              className="mx-1 mt-2 p-2.5 bg-red-50 border border-red-100 rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => setCurrentView('inbox')}
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-600 font-medium">{overdueCount} 項已過期</span>
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-surface-200 p-3 space-y-2">
          {/* Sync Status */}
          {sidebarOpen && (
            <div className="px-2 py-1">
              <SyncIndicator status={syncStatus} />
            </div>
          )}

          {/* User Area */}
          {user ? (
            <div className={cn('flex items-center gap-2', sidebarOpen ? 'px-2' : 'justify-center')}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-brand-600" />
                </div>
              )}
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {user.displayName || user.email || '用戶'}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <LogOut size={10} />
                    登出
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-200 transition-colors text-sm text-gray-600',
                !sidebarOpen && 'justify-center'
              )}
              title={!sidebarOpen ? '登入同步' : undefined}
            >
              <LogIn size={16} />
              {sidebarOpen && <span>登入以同步</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
