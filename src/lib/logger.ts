// Lightweight structured logger. Emits one JSON line per entry (parseable by
// Vercel / log drains) without pulling a heavy dependency into the Edge bundle.

type Level = "debug" | "info" | "warn" | "error";
type Meta = Record<string, unknown>;

function emit(level: Level, message: string, meta?: Meta) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...meta,
  };
  // In development, a readable line; in production, JSON for log processors.
  const line =
    process.env.NODE_ENV === "production"
      ? JSON.stringify(entry)
      : `[${level}] ${message}${meta ? " " + JSON.stringify(meta) : ""}`;

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (level === "debug") {
    if (process.env.NODE_ENV !== "production") console.debug(line);
  } else console.log(line);
}

export const logger = {
  debug: (message: string, meta?: Meta) => emit("debug", message, meta),
  info: (message: string, meta?: Meta) => emit("info", message, meta),
  warn: (message: string, meta?: Meta) => emit("warn", message, meta),
  error: (message: string, meta?: Meta) => emit("error", message, meta),
};

/** Normalize an unknown error into a loggable string. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : JSON.stringify(error);
}
