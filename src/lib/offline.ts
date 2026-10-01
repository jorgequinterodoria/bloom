export interface QueuedMutation {
  id: string;
  endpoint: string;
  body: unknown;
}

const KEY = "bloom-offline-queue";

export function readOfflineQueue(): QueuedMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function enqueueMutation(endpoint: string, body: unknown) {
  if (typeof window === "undefined") return;
  const queue = readOfflineQueue();
  queue.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, endpoint, body });
  localStorage.setItem(KEY, JSON.stringify(queue.slice(-20)));
}

export async function flushOfflineQueue() {
  if (typeof window === "undefined" || !navigator.onLine) return 0;
  const queue = readOfflineQueue();
  if (!queue.length) return 0;
  const pending: QueuedMutation[] = [];
  let synced = 0;
  for (const mutation of queue) {
    try {
      const response = await fetch(mutation.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mutation.body) });
      if (response.ok) synced += 1;
      else pending.push(mutation);
    } catch {
      pending.push(mutation);
      break;
    }
  }
  localStorage.setItem(KEY, JSON.stringify(pending));
  return synced;
}
