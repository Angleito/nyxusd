/**
 * Structured logging utility for NYXUSD frontend
 * Provides consistent logging across the application with context and timestamps
 */

export interface LogContext {
  readonly service?: string;
  readonly operation?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly errorCode?: string;
  readonly timestamp?: string;
  readonly [key: string]: any;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const formattedContext = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedContext}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorDetails = error instanceof Error 
        ? { name: error.name, message: error.message, stack: error.stack?.split('\n').slice(0, 5).join('\n') }
        : { error: String(error) };
      
      const enrichedContext = { ...context, ...errorDetails };
      console.error(this.formatMessage('error', message, enrichedContext));
    }
  }

  // Service-specific loggers for better organization
  voice(level: LogLevel, message: string, context?: LogContext): void {
    this[level](message, { ...context, service: 'voice' });
  }

  ai(level: LogLevel, message: string, context?: LogContext): void {
    this[level](message, { ...context, service: 'ai' });
  }

  memory(level: LogLevel, message: string, context?: LogContext): void {
    this[level](message, { ...context, service: 'memory' });
  }

  token(level: LogLevel, message: string, context?: LogContext): void {
    this[level](message, { ...context, service: 'token' });
  }
}

export const logger = new Logger();

// Convenience exports for specific services
export const voiceLogger = {
  debug: (message: string, context?: LogContext) => logger.voice('debug', message, context),
  info: (message: string, context?: LogContext) => logger.voice('info', message, context),
  warn: (message: string, context?: LogContext) => logger.voice('warn', message, context),
  error: (message: string, error?: Error | unknown, context?: LogContext) => logger.voice('error', message, { ...context, error }),
};

export const aiLogger = {
  debug: (message: string, context?: LogContext) => logger.ai('debug', message, context),
  info: (message: string, context?: LogContext) => logger.ai('info', message, context),
  warn: (message: string, context?: LogContext) => logger.ai('warn', message, context),
  error: (message: string, error?: Error | unknown, context?: LogContext) => logger.ai('error', message, { ...context, error }),
};

export const memoryLogger = {
  debug: (message: string, context?: LogContext) => logger.memory('debug', message, context),
  info: (message: string, context?: LogContext) => logger.memory('info', message, context),
  warn: (message: string, context?: LogContext) => logger.memory('warn', message, context),
  error: (message: string, error?: Error | unknown, context?: LogContext) => logger.memory('error', message, { ...context, error }),
};

export const tokenLogger = {
  debug: (message: string, context?: LogContext) => logger.token('debug', message, context),
  info: (message: string, context?: LogContext) => logger.token('info', message, context),
  warn: (message: string, context?: LogContext) => logger.token('warn', message, context),
  error: (message: string, error?: Error | unknown, context?: LogContext) => logger.token('error', message, { ...context, error }),
};