import { NextResponse } from "next/server";
import { logger, errorMessage } from "@/lib/logger";

/**
 * Log an error and return a safe JSON 500 response for an API route handler.
 * Never leaks internal error details to the client.
 */
export function handleApiError(error: unknown, context?: string) {
  logger.error(context ?? "API route error", { error: errorMessage(error) });
  return NextResponse.json(
    { error: "Terjadi kesalahan. Silakan coba lagi." },
    { status: 500 }
  );
}

/** Wrap an API route handler so any thrown error becomes a logged 500. */
export function withApiErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
  context?: string
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}
