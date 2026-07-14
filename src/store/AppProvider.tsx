// ============================================================
// OmniFlow - App State Provider
// ============================================================

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AppContext, type AppState } from './useAppStore';
import type { OmniItem, SyncStatus, ViewType, AppUser } from '../types';
import { db, createItem, updateItem as dbUpdate, deleteItem as dbDelete } from '../lib/db';
import { isToday, isOverdue } from '../lib/nlp';
import {
  onAuthChange,
  syncWithFirestore,
  pushItemToCloud,
  deleteItemFromCloud,
  initFirebase,
  isFirebaseConfigured,
} from '../lib/firebase';
import { ANONYMOUS_USER_ID } from '../lib/utils';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [items, setItemsState] = useState<OmniItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('inbox');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUserState] = useState<AppUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');

  const userId = user?.uid ?? ANONYMOUS_USER_ID;

  // Load items from IndexedDB on mount / user change
  useEffect(() => {
    loadItems();
  }, [userId]);

  // Init Firebase & Auth listener
  useEffect(() => {
    if (isFirebaseConfigured()) {
      initFirebase();
      const unsub = onAuthChange(async (firebaseUser) => {
        if (firebaseUser) {
          const appUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          setUserState(appUser);
          // Sync with Firestore
          setSyncStatus('syncing');
          try {
            await syncWithFirestore(firebaseUser.uid);
            await loadItems(firebaseUser.uid);
            setSyncStatus('synced');
          } catch {
            setSyncStatus('error');
          }
        } else {
          setUserState(null);
          setSyncStatus('offline');
          await loadItems(ANONYMOUS_USER_ID);
        }
      });
      return unsub;
    }
  }, []);

  async function loadItems(uid?: string) {
    const id = uid ?? userId;
    const data = await db.items.where('user_id').equals(id).toArray();
    setItemsState(data.sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
  }

  const setItems = useCallback((items: OmniItem[]) => {
    setItemsState(items);
  }, []);

  const addItem = useCallback(async (item: OmniItem) => {
    await createItem(item);
    setItemsState(prev => [item, ...prev]);
    // Push to cloud if logged in
    if (user && isFirebaseConfigured()) {
      pushItemToCloud(item).catch(console.error);
    }
  }, [user]);

  const updateItem = useCallback(async (id: string, changes: Partial<OmniItem>) => {
    await dbUpdate(id, changes);
    setItemsState(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, ...changes, updated_at: new Date().toISOString() }
          : item
      )
    );
    // Push updated item to cloud if logged in
    if (user && isFirebaseConfigured()) {
      const updated = await db.items.get(id);
      if (updated) pushItemToCloud(updated).catch(console.error);
    }
  }, [user]);

  const removeItem = useCallback(async (id: string) => {
    await dbDelete(id);
    setItemsState(prev => prev.filter(item => item.id !== id));
    setSelectedItemId(prev => prev === id ? null : prev);
    // Delete from cloud
    if (user && isFirebaseConfigured()) {
      deleteItemFromCloud(id).catch(console.error);
    }
  }, [user]);

  const setUser = useCallback((u: AppUser | null) => {
    setUserState(u);
  }, []);

  const selectedItem = useMemo(
    () => selectedItemId ? items.find(i => i.id === selectedItemId) ?? null : null,
    [selectedItemId, items]
  );

  const filteredItems = useCallback(
    (filter: Partial<OmniItem> & { view?: ViewType }) => {
      let result = items.filter(i => i.status !== 'Archived');

      if (filter.view === 'today') {
        result = result.filter(i =>
          (i.due_date && isToday(i.due_date)) ||
          (i.start_date && isToday(i.start_date))
        );
      } else if (filter.view === 'inbox') {
        result = result.filter(i => i.type === 'Inbox' || (i.type === 'Task' && !i.project_id));
      } else if (filter.view === 'kanban') {
        result = result.filter(i => i.type === 'Project' || i.type === 'Task');
      } else if (filter.view === 'notes') {
        result = result.filter(i => i.type === 'Note');
      }

      if (filter.type) result = result.filter(i => i.type === filter.type);
      if (filter.status) result = result.filter(i => i.status === filter.status);
      if (filter.priority) result = result.filter(i => i.priority === filter.priority);
      if (filter.project_id !== undefined) result = result.filter(i => i.project_id === filter.project_id);

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(i =>
          i.title.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q) ||
          i.tags.some(t => t.toLowerCase().includes(q))
        );
      }

      return result;
    },
    [items, searchQuery]
  );

  const value: AppState = {
    items,
    setItems,
    addItem,
    updateItem,
    removeItem,
    currentView,
    setCurrentView,
    selectedItemId,
    setSelectedItemId,
    sidebarOpen,
    setSidebarOpen,
    searchQuery,
    setSearchQuery,
    user,
    setUser,
    syncStatus,
    setSyncStatus,
    selectedItem,
    filteredItems,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
