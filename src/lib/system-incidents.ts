import { randomUUID } from "crypto";

export type SystemIncident = {
  id: string;
  at: string;
  context: string;
  publicMessage: string;
  developerMessage: string;
  stack?: string;
};

const MAX_INCIDENTS = 40;
const incidents: SystemIncident[] = [];

export function recordSystemIncident(input: {
  context: string;
  publicMessage: string;
  developerMessage: string;
  error?: unknown;
}) {
  const entry: SystemIncident = {
    id: randomUUID(),
    at: new Date().toISOString(),
    context: input.context,
    publicMessage: input.publicMessage,
    developerMessage: input.developerMessage,
    stack:
      input.error instanceof Error
        ? input.error.stack
        : input.error != null
          ? String(input.error)
          : undefined,
  };

  incidents.unshift(entry);
  if (incidents.length > MAX_INCIDENTS) {
    incidents.length = MAX_INCIDENTS;
  }

  console.error(
    `[system-incident] ${entry.context}: ${entry.developerMessage}`,
    input.error ?? ""
  );
}

export function getSystemIncidents(): SystemIncident[] {
  return [...incidents];
}

export function clearSystemIncidents() {
  incidents.length = 0;
}
