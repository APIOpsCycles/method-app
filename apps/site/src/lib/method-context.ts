import { useSyncExternalStore } from "react";
import type { UserMethodContext } from "./method-graph";

export const METHOD_CONTEXT_KEY = "apiops.methodContext.v1";
const LEGACY_STAKEHOLDER_KEYS = ["apiops.selectedStakeholder", "selectedStakeholder"];
let snapshot: UserMethodContext = {};
const serverSnapshot: UserMethodContext = {};
let initialized = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
export function initializeMethodContext(storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage) {
  if (initialized) return snapshot;
  initialized = true;
  try { snapshot = JSON.parse(storage.getItem(METHOD_CONTEXT_KEY) ?? "{}") as UserMethodContext; } catch { storage.removeItem(METHOD_CONTEXT_KEY); snapshot = {}; }
  if (!snapshot.stakeholderId) for (const key of LEGACY_STAKEHOLDER_KEYS) { const value = storage.getItem(key); if (value) { snapshot = { ...snapshot, stakeholderId: value }; break; } }
  if (Object.keys(snapshot).length) storage.setItem(METHOD_CONTEXT_KEY, JSON.stringify(snapshot));
  emit(); return snapshot;
}
export function setMethodContext(patch: Partial<UserMethodContext>, storage: Pick<Storage, "setItem"> = localStorage) { snapshot = { ...snapshot, ...patch }; for (const key of Object.keys(snapshot) as (keyof UserMethodContext)[]) if (!snapshot[key]) delete snapshot[key]; storage.setItem(METHOD_CONTEXT_KEY, JSON.stringify(snapshot)); emit(); }
export function resetMethodContext(storage: Pick<Storage, "removeItem"> = localStorage) { snapshot = {}; storage.removeItem(METHOD_CONTEXT_KEY); emit(); }
export function useMethodContext() { return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, () => snapshot, () => serverSnapshot); }
