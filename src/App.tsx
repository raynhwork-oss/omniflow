// ============================================================
// OmniFlow - Main Application — Dark Glassmorphism Edition
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
      case 'inbox':    return <InboxView view="inbox" />;
      case 'today':    return <InboxView view="today" />;
      case 'kanban':   return <KanbanView />;
      case 'calendar': return <CalendarView />;
      case 'notes':    return <NotesView />;
      case 'all':      return <AllItemsView />;
      default:         return <InboxView view="inbox" />;
    }
  };

  // Views that don't show the top QuickCapture bar
  const hideCapture = currentView === 'notes' || currentView === 'calendar';

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Work Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Quick Capture Bar — sticky top, glassmorphism */}
        {!hideCapture && (
          <div
            className="px-6 py-3 border-b border-white/[0.05] sticky top-0 z-10"
            style={{
              background: 'rgba(11,15,25,0.80)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <QuickCapture />
          </div>
        )}

        {/* View Content */}
        <div className="flex-1 overflow-hidden bg-dark-base">
          {renderView()}
        </div>
      </div>

      {/* Right Drawer — slides in from right */}
      {selectedItemId && <ItemDrawer />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      {/*
        Root shell — dark base background, full viewport, no scroll.
        Inter / system-ui font is set in index.css via font-family.
      */}
      <div className="flex h-screen bg-dark-base overflow-hidden font-sans antialiased">
        <Sidebar />
        <MainContent />
      </div>
    </AppProvider>
  );
}

export default App;
