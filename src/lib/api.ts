import { NextResponse } from "next/server";
import { formatServerError } from "@/lib/server-errors";
import { recordSystemIncident } from "@/lib/system-incidents";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Log full technical details for the developer panel; return a safe public message. */
export function jsonServerError(
  error: unknown,
  context: string,
  options?: { status?: number }
) {
  const detail = formatServerError(error);
  recordSystemIncident({
    context,
    publicMessage: detail.publicMessage,
    developerMessage: detail.developerMessage,
    error,
  });
  return jsonError(detail.publicMessage, options?.status ?? detail.status);
}

/** Record infrastructure misconfiguration without exposing setup hints to users. */
export function jsonInfrastructureError(
  developerMessage: string,
  context: string,
  publicMessage?: string
) {
  const detail = formatServerError(new Error(developerMessage));
  const message = publicMessage ?? detail.publicMessage;
  recordSystemIncident({
    context,
    publicMessage: message,
    developerMessage,
  });
  return jsonError(message, 503);
}
