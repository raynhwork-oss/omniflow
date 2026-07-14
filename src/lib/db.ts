// ============================================================
// OmniFlow - Dexie.js Local Database (IndexedDB)
// ============================================================

import Dexie, { type Table } from 'dexie';
import type { OmniItem } from '../types';

export class OmniFlowDB extends Dexie {
  items!: Table<OmniItem, string>;

  constructor() {
    super('OmniFlowDB');
    this.version(1).stores({
      items: 'id, user_id, type, status, priority, project_id, due_date, start_date, updated_at, created_at, *tags',
    });
  }
}

export const db = new OmniFlowDB();

// ============================================================
// CRUD Helpers
// ============================================================

export async function createItem(item: OmniItem): Promise<void> {
  await db.items.put(item);
}

export async function updateItem(id: string, changes: Partial<OmniItem>): Promise<void> {
  await db.items.update(id, {
    ...changes,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteItem(id: string): Promise<void> {
  await db.items.delete(id);
}

export async function getItem(id: string): Promise<OmniItem | undefined> {
  return db.items.get(id);
}

export async function getAllItems(userId: string): Promise<OmniItem[]> {
  return db.items.where('user_id').equals(userId).toArray();
}

export async function getItemsByType(userId: string, type: OmniItem['type']): Promise<OmniItem[]> {
  return db.items
    .where('user_id').equals(userId)
    .and(item => item.type === type)
    .toArray();
}

export async function getItemsByProject(projectId: string): Promise<OmniItem[]> {
  return db.items.where('project_id').equals(projectId).toArray();
}

export async function searchItems(userId: string, query: string): Promise<OmniItem[]> {
  const q = query.toLowerCase();
  return db.items
    .where('user_id').equals(userId)
    .and(item =>
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    )
    .toArray();
}

export async function getItemsUpdatedAfter(userId: string, timestamp: string): Promise<OmniItem[]> {
  return db.items
    .where('user_id').equals(userId)
    .and(item => item.updated_at > timestamp)
    .toArray();
}

export async function upsertItems(items: OmniItem[]): Promise<void> {
  await db.items.bulkPut(items);
}
