type LogLevel = "debug" | "info" | "warn" | "error";

function formatTimestamp(): string {
  return new Date().toISOString();
}

export const convexLogger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    console.log(`[CONVEX] [${formatTimestamp()}] [DEBUG] ${message}`, context ?? "");
  },
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(`[CONVEX] [${formatTimestamp()}] [INFO] ${message}`, context ?? "");
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(`[CONVEX] [${formatTimestamp()}] [WARN] ${message}`, context ?? "");
  },
  error: (message: string, context?: Record<string, unknown>) => {
    console.error(`[CONVEX] [${formatTimestamp()}] [ERROR] ${message}`, context ?? "");
  },
};
