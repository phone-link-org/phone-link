export const LogLevel = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  file?: string;
  line?: number;
  function?: string;
  stack?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  data?: any;
}

class Logger {
  private sessionId: string;
  private userId?: string;
  private isDevelopment: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isDevelopment = import.meta.env.DEV;

    // 사용자 ID 가져오기 (localStorage에서)
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userId = user.id;
      } catch (error) {
        console.warn("Failed to parse user data from localStorage", error);
      }
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCallerInfo(): { file: string; line: number; function: string } {
    const stack = new Error().stack;
    if (!stack) {
      return { file: "unknown", line: 0, function: "unknown" };
    }

    const lines = stack.split("\n");
    // 4번째 줄이 실제 호출한 함수
    const callerLine = lines[4] || lines[3];

    if (!callerLine) {
      return { file: "unknown", line: 0, function: "unknown" };
    }

    const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):\d+\)/) || callerLine.match(/at\s+(.+?):(\d+):\d+/);

    if (match) {
      return {
        function: match[1] || "anonymous",
        file: match[2] || "unknown",
        line: parseInt(match[3] || "0", 10),
      };
    }

    return { file: "unknown", line: 0, function: "unknown" };
  }

  private createLogEntry(level: LogLevel, message: string, error?: Error, additionalData?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...(error && {
        stack: error.stack,
        file: this.getCallerInfo().file,
        line: this.getCallerInfo().line,
        function: this.getCallerInfo().function,
      }),
      ...(additionalData && { data: additionalData }),
    };

    return entry;
  }

  private async sendToServer(entry: LogEntry): Promise<void> {
    try {
      // 개발 환경에서는 서버로 전송하지 않음
      if (this.isDevelopment) {
        return;
      }

      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.warn("Failed to send log to server:", error);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const formattedMessage = `[${entry.timestamp}] ${entry.level}: ${entry.message}`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.data);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage, entry.data);
        }
        break;
    }
  }

  async error(message: string, error?: Error, additionalData?: any): Promise<void> {
    const entry = this.createLogEntry(LogLevel.ERROR, message, error, additionalData);

    this.logToConsole(entry);
    await this.sendToServer(entry);
  }

  async warn(message: string, additionalData?: any): Promise<void> {
    const entry = this.createLogEntry(LogLevel.WARN, message, undefined, additionalData);

    this.logToConsole(entry);
    await this.sendToServer(entry);
  }

  async info(message: string, additionalData?: any): Promise<void> {
    const entry = this.createLogEntry(LogLevel.INFO, message, undefined, additionalData);

    this.logToConsole(entry);
    await this.sendToServer(entry);
  }

  async debug(message: string, additionalData?: any): Promise<void> {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, undefined, additionalData);

    this.logToConsole(entry);
    await this.sendToServer(entry);
  }

  // 사용자 ID 업데이트 (로그인/로그아웃 시)
  updateUserId(userId?: string): void {
    this.userId = userId;
  }
}

export const logger = new Logger();
