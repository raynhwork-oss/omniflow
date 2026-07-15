// ============================================================
// OmniFlow - Main Application — Warm Cat Theme Edition 🐾
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

  const hideCapture = currentView === 'notes' || currentView === 'calendar';

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Quick Capture Bar — warm sticky top */}
        {!hideCapture && (
          <div className="capture-warm px-6 py-3 sticky top-0 z-10">
            <QuickCapture />
          </div>
        )}

        {/* View Content — cream background */}
        <div className="flex-1 overflow-hidden" style={{background:'#FDFBF7'}}>
          {renderView()}
        </div>
      </div>

      {/* Right Drawer */}
      {selectedItemId && <ItemDrawer />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden font-sans antialiased" style={{background:'#FDFBF7'}}>
        <Sidebar />
        <MainContent />
      </div>
    </AppProvider>
  );
}

export default App;
