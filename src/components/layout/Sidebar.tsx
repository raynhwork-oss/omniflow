// ============================================================
// OmniFlow — Sidebar · Warm Cat Theme Edition 🐾
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Inbox, Star, Kanban, Calendar, FileText, List,
  User, Cloud, CloudOff, Loader2, Search, Plus,
  ChevronLeft, ChevronRight, LogOut, LogIn,
  AlertCircle, X, Shield
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
  id: ViewType; label: string; icon: React.ReactNode; emoji: string;
}[] = [
  { id: 'inbox',    label: '收件夾',    icon: <Inbox    size={17}/>, emoji: '📥' },
  { id: 'today',    label: '今日專注',  icon: <Star     size={17}/>, emoji: '⭐' },
  { id: 'kanban',   label: '專案看板',  icon: <Kanban   size={17}/>, emoji: '📋' },
  { id: 'calendar', label: '行事曆',    icon: <Calendar size={17}/>, emoji: '🗓️' },
  { id: 'notes',    label: '所有筆記',  icon: <FileText size={17}/>, emoji: '📝' },
  { id: 'all',      label: '全部項目',  icon: <List     size={17}/>, emoji: '🗂️' },
];

// ── Cute Cat Mascot Component ──────────────────────────────
function CatMascot({ expanded }: { expanded: boolean }) {
  const [mood, setMood] = useState<'idle' | 'wink' | 'stretch' | 'sleep'>('idle');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const moods: Array<typeof mood> = ['idle', 'idle', 'idle', 'wink', 'stretch', 'sleep'];
      setMood(moods[Math.floor(Math.random() * moods.length)]);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const catSvg = (
    <svg
      viewBox="0 0 64 64"
      className={cn(
        'w-full h-full transition-all duration-500',
        mood === 'stretch' && 'animate-cat-stretch',
        mood === 'sleep'   && 'animate-cat-sleep',
        isHovered          && 'scale-110',
      )}
      style={{ filter: 'drop-shadow(0 2px 6px rgba(230,138,0,0.25))' }}
    >
      {/* Body */}
      <ellipse cx="32" cy="42" rx="16" ry="13" fill="#FFD8B1"/>
      {/* Head */}
      <ellipse cx="32" cy="26" rx="15" ry="14" fill="#FFD8B1"/>
      {/* Ears */}
      <polygon points="14,16 18,6 22,16" fill="#FFD8B1"/>
      <polygon points="42,16 46,6 50,16" fill="#FFD8B1"/>
      {/* Inner ears */}
      <polygon points="15.5,15 18.5,8.5 21.5,15" fill="#FFB8B8"/>
      <polygon points="43.5,15 46.5,8.5 49.5,15" fill="#FFB8B8"/>
      {/* Eyes */}
      {(mood === 'wink') ? (
        <>
          {/* Left eye normal */}
          <ellipse cx="25" cy="25" rx="3" ry="3.5" fill="#3E2723"/>
          <circle cx="26" cy="24" r="1" fill="white"/>
          {/* Right eye winking */}
          <path d="M37,25 Q40,23 43,25" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </>
      ) : (mood === 'sleep') ? (
        <>
          <path d="M22,25 Q25,23 28,25" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M36,25 Q39,23 42,25" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round"/>
          {/* ZZZ */}
          <text x="46" y="16" fontSize="7" fill="#FFB74D" fontWeight="bold" opacity="0.8">z</text>
          <text x="50" y="12" fontSize="5.5" fill="#FFB74D" fontWeight="bold" opacity="0.6">z</text>
        </>
      ) : (
        <>
          <ellipse cx="25" cy="25" rx="3" ry="3.5" fill="#3E2723"/>
          <circle cx="26" cy="24" r="1" fill="white"/>
          <ellipse cx="39" cy="25" rx="3" ry="3.5" fill="#3E2723"/>
          <circle cx="40" cy="24" r="1" fill="white"/>
        </>
      )}
      {/* Nose */}
      <ellipse cx="32" cy="30" rx="2" ry="1.5" fill="#FF8A80"/>
      {/* Mouth */}
      <path d="M32,31.5 Q29,34 27,32.5" stroke="#C0795E" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M32,31.5 Q35,34 37,32.5" stroke="#C0795E" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Whiskers */}
      <line x1="14" y1="29" x2="24" y2="30" stroke="#8D6E63" strokeWidth="0.9" opacity="0.7"/>
      <line x1="14" y1="32" x2="24" y2="31.5" stroke="#8D6E63" strokeWidth="0.9" opacity="0.7"/>
      <line x1="50" y1="29" x2="40" y2="30" stroke="#8D6E63" strokeWidth="0.9" opacity="0.7"/>
      <line x1="50" y1="32" x2="40" y2="31.5" stroke="#8D6E63" strokeWidth="0.9" opacity="0.7"/>
      {/* Blush */}
      <ellipse cx="21" cy="31" rx="3.5" ry="2" fill="#FFB8B8" opacity="0.6"/>
      <ellipse cx="43" cy="31" rx="3.5" ry="2" fill="#FFB8B8" opacity="0.6"/>
      {/* Tail */}
      <path
        d="M46,50 Q58,46 56,38 Q54,32 50,34"
        stroke="#FFCC80" strokeWidth="5" fill="none" strokeLinecap="round"
        className={mood === 'idle' || mood === 'wink' ? 'animate-cat-tail' : ''}
        style={{ transformOrigin: '46px 50px' }}
      />
      {/* Paw spots on body */}
      <ellipse cx="26" cy="52" rx="4" ry="2.5" fill="#FFCC80" opacity="0.7"/>
      <ellipse cx="38" cy="52" rx="4" ry="2.5" fill="#FFCC80" opacity="0.7"/>
    </svg>
  );

  if (!expanded) {
    return (
      <button
        className="w-10 h-10 mx-auto block cursor-pointer transition-transform"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setMood('wink')}
        title="點我！"
      >
        {catSvg}
      </button>
    );
  }

  return (
    <div
      className="relative mx-3 mb-2 p-3 rounded-2xl cursor-pointer select-none"
      style={{ background: 'linear-gradient(135deg, #FFF8ED, #FFE8C2)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setMood(prev => prev === 'wink' ? 'idle' : 'wink')}
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 flex-shrink-0">{catSvg}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-espresso-700" style={{color:'#5D3A1A'}}>咪咪</p>
          <p className="text-xs mt-0.5" style={{color:'#8D6E63'}}>
            {mood === 'sleep' ? '😴 小睡一下...' :
             mood === 'wink'  ? '😸 汪！（才怪）' :
             mood === 'stretch' ? '🙆 伸懶腰～' :
             '🐾 陪你工作中'}
          </p>
        </div>
      </div>
      <div className="absolute top-2 right-2 text-xs" style={{color:'rgba(139,90,43,0.4)'}}>點我互動</div>
    </div>
  );
}

// ── Sync Indicator ─────────────────────────────────────────
function SyncIndicator({ status }: { status: string }) {
  const base = 'flex items-center gap-1.5 text-xs font-semibold';
  if (status === 'synced')
    return <span className={cn(base)} style={{color:'#2E7D32'}}><Cloud size={12}/>已同步</span>;
  if (status === 'syncing')
    return <span className={cn(base)} style={{color:'#E65100'}}><Loader2 size={12} className="animate-spin"/>同步中</span>;
  if (status === 'error')
    return <span className={cn(base)} style={{color:'#C62828'}}><AlertCircle size={12}/>同步失敗</span>;
  return <span className={cn(base)} style={{color:'#8D6E63'}}><CloudOff size={12}/>本地模式</span>;
}

// ── Auth Modal ────────────────────────────────────────────
function AuthModal({ onClose }: { onClose: () => void }) {
  const { setUser } = useApp();
  const [mode, setMode]         = useState<'login' | 'register'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

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

  const overlayContent = !isFirebaseConfigured() ? (
    <div className="warm-card w-96 p-6 animate-scale-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold flex items-center gap-2" style={{color:'#3E2723'}}>
          <span>🐾</span> Firebase 尚未設定
        </h2>
        <button onClick={onClose} className="btn-ghost-warm p-1.5"><X size={15}/></button>
      </div>
      <p className="text-sm mb-4" style={{color:'#5D3A1A'}}>
        雲端同步需要配置 Firebase 環境變數：
      </p>
      <ul className="font-mono text-xs rounded-2xl p-3 space-y-1 mb-4" style={{background:'#FFF8ED', border:'1.5px dashed #EDDECC'}}>
        {['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID',
          'VITE_FIREBASE_STORAGE_BUCKET','VITE_FIREBASE_MESSAGING_SENDER_ID','VITE_FIREBASE_APP_ID']
          .map(k => <li key={k} style={{color:'#E65100'}}>{k}</li>)}
      </ul>
      <p className="text-xs mb-4 font-semibold" style={{color:'#2E7D32'}}>✓ 目前本地模式完整運行，資料安全儲存在瀏覽器中。</p>
      <button onClick={onClose} className="btn-warm w-full py-2.5 text-sm">繼續本地使用 🐱</button>
    </div>
  ) : (
    <div className="warm-card w-96 p-6 animate-scale-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <h2 className="font-bold" style={{color:'#3E2723'}}>
            {mode === 'login' ? '歡迎回來！' : '加入 OmniFlow'}
          </h2>
        </div>
        <button onClick={onClose} className="btn-ghost-warm p-1.5"><X size={15}/></button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl text-sm font-medium" style={{background:'#FFF0F0', border:'1.5px solid rgba(239,83,80,0.3)', color:'#C62828'}}>
          {error}
        </div>
      )}

      <button
        onClick={handleGoogle} disabled={loading}
        className="w-full flex items-center justify-center gap-3 rounded-2xl py-3 mb-4 text-sm font-semibold transition-all hover:scale-[1.01]"
        style={{background:'#FAF6F0', border:'1.5px solid #EDDECC', color:'#3E2723'}}
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
        <hr className="separator-paw"/>
        <div className="absolute inset-0 flex justify-center">
          <span className="px-3 text-xs font-medium" style={{background:'#FFFFFF', color:'#A1887F', marginTop:'-9px'}}>或用電子郵件</span>
        </div>
      </div>

      <div className="space-y-3">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="電子郵件" className="input-warm w-full px-4 py-2.5 text-sm"/>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEmail()}
          placeholder="密碼" className="input-warm w-full px-4 py-2.5 text-sm"/>
      </div>

      <button onClick={handleEmail} disabled={loading}
        className="btn-warm w-full mt-4 py-2.5 text-sm disabled:opacity-50">
        {loading ? '處理中…' : mode === 'login' ? '登入' : '建立帳號'}
      </button>

      <p className="mt-3 text-center text-sm" style={{color:'#8D6E63'}}>
        {mode === 'login' ? '還沒帳號？' : '已有帳號？'}
        {' '}
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="font-bold transition-colors" style={{color:'#E68A00'}}>
          {mode === 'login' ? '建立帳號' : '登入'}
        </button>
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{background:'rgba(62,39,35,0.35)', backdropFilter:'blur(6px)'}}>
      {overlayContent}
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────
export function Sidebar() {
  const {
    currentView, setCurrentView,
    sidebarOpen, setSidebarOpen,
    user, syncStatus, items,
    setUser, searchQuery, setSearchQuery,
  } = useApp();
  const [showAuth, setShowAuth] = useState(false);

  const todayCount   = items.filter(i => i.due_date && isToday(i.due_date) && i.status !== 'Done' && i.status !== 'Archived').length;
  const inboxCount   = items.filter(i => (i.type === 'Inbox' || (i.type === 'Task' && !i.project_id)) && i.status !== 'Archived').length;
  const overdueCount = items.filter(i => i.due_date && isOverdue(i.due_date) && i.status !== 'Done' && i.status !== 'Archived').length;

  const counts: Partial<Record<ViewType, number>> = { inbox: inboxCount, today: todayCount };

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)}/>}

      <aside className={cn(
        'sidebar-warm flex flex-col h-full transition-all duration-300 relative flex-shrink-0',
        sidebarOpen ? 'w-60' : 'w-16',
      )}>
        {/* ── Logo & collapse ───── */}
        <div className="flex items-center justify-between px-3 py-4" style={{borderBottom:'1.5px dashed #EDDECC'}}>
          {sidebarOpen && (
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🐾</span>
              <span className="font-extrabold text-base text-gradient-warm tracking-wide">OmniFlow</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost-warm p-1.5 ml-auto"
            title={sidebarOpen ? '收合側邊欄' : '展開側邊欄'}
          >
            {sidebarOpen ? <ChevronLeft size={15}/> : <ChevronRight size={15}/>}
          </button>
        </div>

        {/* ── Cat Mascot ─────────── */}
        <div className="py-3">
          <CatMascot expanded={sidebarOpen}/>
        </div>

        {/* ── Search ───────────── */}
        {sidebarOpen && (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 input-warm px-3 py-2">
              <Search size={14} style={{color:'#A1887F'}} className="flex-shrink-0"/>
              <input
                type="text" placeholder="搜尋…" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm w-full outline-none" style={{color:'#3E2723'}}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="btn-ghost-warm p-0.5">
                  <X size={12}/>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Nav ──────────────── */}
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto scrollbar-none">
          {NAV_ITEMS.map(navItem => {
            const count  = counts[navItem.id];
            const active = currentView === navItem.id;
            return (
              <button
                key={navItem.id}
                onClick={() => setCurrentView(navItem.id)}
                title={!sidebarOpen ? navItem.label : undefined}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl transition-all text-sm group font-medium',
                  active ? 'nav-active' : 'btn-ghost-warm',
                  !sidebarOpen && 'justify-center',
                )}
              >
                <span className="flex-shrink-0 transition-transform group-hover:scale-110">
                  {sidebarOpen ? navItem.icon : <span className="text-base">{navItem.emoji}</span>}
                </span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{navItem.label}</span>
                    {count !== undefined && count > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center"
                        style={{background:'#FFB74D', color:'#FFFFFF'}}>
                        {count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}

          {/* Overdue paw warning */}
          {sidebarOpen && overdueCount > 0 && (
            <button
              onClick={() => setCurrentView('inbox')}
              className="mx-1 mt-2 w-[calc(100%-8px)] flex items-center gap-2 p-2.5 rounded-2xl transition-all"
              style={{background:'#FFF0F0', border:'1.5px solid rgba(239,83,80,0.3)'}}
            >
              <span className="text-sm">🚨</span>
              <span className="text-xs font-semibold" style={{color:'#C62828'}}>{overdueCount} 項已逾期</span>
            </button>
          )}
        </nav>

        {/* ── Footer ───────────── */}
        <div className="p-3 space-y-2" style={{borderTop:'1.5px dashed #EDDECC'}}>
          {sidebarOpen && (
            <div className="px-1.5 pb-1">
              <SyncIndicator status={syncStatus}/>
            </div>
          )}

          {user ? (
            <div className={cn('flex items-center gap-2', !sidebarOpen && 'justify-center')}>
              {user.photoURL
                ? <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full flex-shrink-0" style={{border:'2px solid #FFB74D'}}/>
                : <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                    style={{background:'#FFE8C2', border:'2px solid #FFB74D'}}>
                    <User size={14} style={{color:'#E68A00'}}/>
                  </div>
              }
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{color:'#3E2723'}}>
                    {user.displayName || user.email || '用戶'}
                  </p>
                  <button
                    onClick={() => { signOutUser(); setUser(null); }}
                    className="text-xs flex items-center gap-0.5 font-medium transition-colors"
                    style={{color:'#A1887F'}}
                    onMouseEnter={e => (e.currentTarget.style.color = '#C62828')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#A1887F')}
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
                'w-full flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium btn-ghost-warm',
                !sidebarOpen && 'justify-center',
              )}
            >
              <LogIn size={15} style={{color:'#E68A00'}}/>
              {sidebarOpen && <span style={{color:'#5D3A1A'}}>登入以同步雲端</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
