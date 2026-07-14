// ============================================================
// OmniFlow - Global State Management (Zustand-like with React)
// ============================================================

import { createContext, useContext } from 'react';
import type { OmniItem, SyncStatus, ViewType, AppUser } from '../types';

export interface AppState {
  // Data
  items: OmniItem[];
  setItems: (items: OmniItem[]) => void;
  addItem: (item: OmniItem) => void;
  updateItem: (id: string, changes: Partial<OmniItem>) => void;
  removeItem: (id: string) => void;

  // UI State
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Auth
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;

  // Sync
  syncStatus: SyncStatus;
  setSyncStatus: (s: SyncStatus) => void;

  // Derived
  selectedItem: OmniItem | null;
  filteredItems: (filter: Partial<OmniItem> & { view?: ViewType }) => OmniItem[];
}

export const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
