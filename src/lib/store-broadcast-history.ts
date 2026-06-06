export const MAX_STORE_BROADCAST_HISTORY = 10;

export type StoreBroadcastEntry = {
  message: string;
  sentAt: string;
};

function isEntry(value: unknown): value is StoreBroadcastEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as StoreBroadcastEntry;
  return (
    typeof row.message === "string" &&
    row.message.trim().length > 0 &&
    typeof row.sentAt === "string" &&
    row.sentAt.length > 0
  );
}

export function parseStoreBroadcastHistory(
  json: string | null | undefined
): StoreBroadcastEntry[] {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry).map((item) => ({
      message: item.message.trim(),
      sentAt: item.sentAt,
    }));
  } catch {
    return [];
  }
}

export function dedupeBroadcastEntries(
  entries: StoreBroadcastEntry[]
): StoreBroadcastEntry[] {
  const seen = new Set<string>();
  const result: StoreBroadcastEntry[] = [];
  for (const entry of entries) {
    if (seen.has(entry.sentAt)) continue;
    seen.add(entry.sentAt);
    result.push(entry);
  }
  return result;
}

export function sortBroadcastEntriesNewestFirst(
  entries: StoreBroadcastEntry[]
): StoreBroadcastEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
}

export function trimBroadcastHistory(
  entries: StoreBroadcastEntry[],
  max = MAX_STORE_BROADCAST_HISTORY
): StoreBroadcastEntry[] {
  return sortBroadcastEntriesNewestFirst(dedupeBroadcastEntries(entries)).slice(
    0,
    max
  );
}

export function serializeStoreBroadcastHistory(
  entries: StoreBroadcastEntry[]
): string | null {
  const trimmed = trimBroadcastHistory(entries);
  if (trimmed.length === 0) return null;
  return JSON.stringify(trimmed);
}

export function mergeBroadcastHistory(
  storedJson: string | null | undefined,
  currentMessage: string | null | undefined,
  currentSentAt: Date | string | null | undefined
): StoreBroadcastEntry[] {
  const stored = parseStoreBroadcastHistory(storedJson);
  const current =
    currentMessage?.trim() && currentSentAt
      ? [
          {
            message: currentMessage.trim(),
            sentAt:
              currentSentAt instanceof Date
                ? currentSentAt.toISOString()
                : currentSentAt,
          },
        ]
      : [];

  if (stored.length > 0) {
    return trimBroadcastHistory([...stored, ...current]);
  }

  return trimBroadcastHistory(current);
}

export function appendBroadcastUpdate(
  storedJson: string | null | undefined,
  currentMessage: string | null | undefined,
  currentSentAt: Date | string | null | undefined,
  nextMessage: string
): StoreBroadcastEntry[] {
  const sentAt = new Date().toISOString();
  const nextEntry: StoreBroadcastEntry = {
    message: nextMessage.trim(),
    sentAt,
  };

  const existing = mergeBroadcastHistory(
    storedJson,
    currentMessage,
    currentSentAt
  ).filter((entry) => entry.sentAt !== nextEntry.sentAt);

  return trimBroadcastHistory([nextEntry, ...existing]);
}
