import { useSyncExternalStore } from "react";
import { methodGraph, type UserMethodContext } from "./method-graph";

export const METHOD_CONTEXT_KEY = "apiops.methodContext.v1";
export const CONTEXT_PROMPT_DISMISSED_KEY = "apiops.contextPrompt.dismissed";
const LEGACY_STAKEHOLDER_KEYS = ["apiops.selectedStakeholder", "selectedStakeholder"];
let snapshot: UserMethodContext = {};
const serverSnapshot: UserMethodContext = {};
let initialized = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
export function parseStoredMethodContext(value: string | null): UserMethodContext {
  try {
    const stored = JSON.parse(value ?? "{}") as Record<string, unknown>;
    return {
      ...(typeof stored.stakeholderId === "string" && stored.stakeholderId in methodGraph.byStakeholder ? { stakeholderId: stored.stakeholderId } : {}),
      ...(typeof stored.goalId === "string" && stored.goalId in methodGraph.byGoal ? { goalId: stored.goalId } : {}),
    };
  } catch { return {}; }
}
export function initializeMethodContext(storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage) {
  if (initialized) return snapshot;
  initialized = true;
  const storedValue = storage.getItem(METHOD_CONTEXT_KEY);
  snapshot = parseStoredMethodContext(storedValue);
  if (storedValue && !Object.keys(snapshot).length) storage.removeItem(METHOD_CONTEXT_KEY);
  if (!snapshot.stakeholderId) for (const key of LEGACY_STAKEHOLDER_KEYS) { const value = storage.getItem(key); if (value && value in methodGraph.byStakeholder) { snapshot = { ...snapshot, stakeholderId: value }; break; } }
  // Rewriting strips obsolete derived fields from the previous schema.
  if (Object.keys(snapshot).length) storage.setItem(METHOD_CONTEXT_KEY, JSON.stringify(snapshot));
  emit(); return snapshot;
}
export function setMethodContext(patch: Partial<UserMethodContext>, storage: Pick<Storage, "setItem"> = localStorage) { snapshot = { ...snapshot, ...patch }; for (const key of Object.keys(snapshot) as (keyof UserMethodContext)[]) if (!snapshot[key]) delete snapshot[key]; storage.setItem(METHOD_CONTEXT_KEY, JSON.stringify(snapshot)); emit(); }
export function resetMethodContext(storage: Pick<Storage, "removeItem"> = localStorage) { snapshot = {}; storage.removeItem(METHOD_CONTEXT_KEY); emit(); }
export function useMethodContext() { return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, () => snapshot, () => serverSnapshot); }
export function isContextPromptDismissed(storage: Pick<Storage, "getItem"> = localStorage) { return storage.getItem(CONTEXT_PROMPT_DISMISSED_KEY) === "true"; }
export function dismissContextPrompt(storage: Pick<Storage, "setItem"> = localStorage) { storage.setItem(CONTEXT_PROMPT_DISMISSED_KEY, "true"); }
