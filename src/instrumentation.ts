import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME === "edge") return;

  const { recordSystemIncident } = await import("@/lib/system-incidents");
  const { formatServerError } = await import("@/lib/server-errors");

  const detail = formatServerError(error);
  recordSystemIncident({
    context: `${context.routeType}:${context.routePath}`,
    publicMessage: detail.publicMessage,
    developerMessage: `${request.method} ${request.path} — ${detail.developerMessage}`,
    error,
  });
};
