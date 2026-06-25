type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PREFIX: Record<LogLevel, string> = {
  debug: "🔍",
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
};

function formatTimestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const prefix = LEVEL_PREFIX[level];
  const ts = formatTimestamp();
  const ctx = context ? ` ${JSON.stringify(context)}` : "";
  const line = `${prefix} [${ts}] [${level.toUpperCase()}] ${message}${ctx}`;

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => log("error", message, context),
};
