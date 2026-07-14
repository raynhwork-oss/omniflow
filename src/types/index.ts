// ============================================================
// OmniFlow - Core Type Definitions
// ============================================================

export type ItemType = 'Inbox' | 'Task' | 'Project' | 'Note';
export type ItemStatus = 'Backlog' | 'Todo' | 'In Progress' | 'Done' | 'Archived';
export type ItemPriority = 'High' | 'Medium' | 'Low' | 'None';

export interface OmniItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: ItemType;
  status: ItemStatus;
  priority: ItemPriority;
  start_date?: string; // ISO DateTime
  due_date?: string;   // ISO DateTime
  project_id?: string | null;
  tags: string[];
  backlinks: string[];
  created_at: string;  // ISO DateTime
  updated_at: string;  // ISO DateTime
  // Sub-tasks support
  subtasks?: SubTask[];
  // Synced to cloud?
  synced?: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
  created_at: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export type ViewType = 'inbox' | 'today' | 'kanban' | 'calendar' | 'notes' | 'all';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface ParsedInput {
  title: string;
  due_date?: string;
  tags: string[];
  priority?: ItemPriority;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  itemId: string;
  color?: string;
}

export type KanbanColumn = {
  id: ItemStatus;
  title: string;
  color: string;
};
