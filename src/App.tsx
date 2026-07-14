// ============================================================
// OmniFlow - Main Application Component
// ============================================================

import React from 'react';
import { AppProvider } from './store/AppProvider';
import { useApp } from './store/useAppStore';
import { Sidebar } from './components/layout/Sidebar';
import { QuickCapture } from './components/layout/QuickCapture';
import { ItemDrawer } from './components/drawer/ItemDrawer';
import { InboxView } from './components/views/InboxView';
import { KanbanView } from './components/views/KanbanView';
import { NotesView } from './components/views/NotesView';
import { CalendarView } from './components/views/CalendarView';
import { AllItemsView } from './components/views/AllItemsView';
import { cn } from './lib/utils';

function MainContent() {
  const { currentView, selectedItemId } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'inbox':
        return <InboxView view="inbox" />;
      case 'today':
        return <InboxView view="today" />;
      case 'kanban':
        return <KanbanView />;
      case 'calendar':
        return <CalendarView />;
      case 'notes':
        return <NotesView />;
      case 'all':
        return <AllItemsView />;
      default:
        return <InboxView view="inbox" />;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Work Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Quick Capture Bar (top-level, except in Calendar and Notes) */}
        {currentView !== 'notes' && (
          <div className="px-6 py-4 border-b border-surface-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <QuickCapture />
          </div>
        )}

        {/* View Content */}
        <div className="flex-1 overflow-hidden bg-surface-50">
          {renderView()}
        </div>
      </div>

      {/* Right Drawer */}
      {selectedItemId && (
        <ItemDrawer />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <div className="flex h-screen bg-white overflow-hidden font-sans">
        <Sidebar />
        <MainContent />
      </div>
    </AppProvider>
  );
}

export default App;
