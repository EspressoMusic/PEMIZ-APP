import { formatServerError } from "@/lib/server-errors";

/** @deprecated Prefer jsonServerError — returns only the public user message. */
export function prismaErrorResponse(error: unknown): {
  message: string;
  status: number;
  developerMessage: string;
} {
  const detail = formatServerError(error);
  return {
    message: detail.publicMessage,
    status: detail.status,
    developerMessage: detail.developerMessage,
  };
}
