import winston from "winston";
import { Request, Response, NextFunction } from "express";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(
  ({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}] ${message}`;

    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }

    if (stack) {
      msg += `\n${stack}`;
    }

    return msg;
  },
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// AI-specific logger
export const aiLogger = logger.child({ service: "ai" });

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  // Log request
  logger.info("Incoming request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Log response
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

// AI request logging middleware
export const aiRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  // Log AI request details
  aiLogger.info("AI request received", {
    sessionId: req.body?.sessionId,
    conversationStep: req.body?.context?.conversationStep,
    messageLength: req.body?.message?.length,
    hasWalletData: !!req.body?.context?.walletData,
  });

  // Log response
  res.on("finish", () => {
    const duration = Date.now() - start;
    aiLogger.info("AI request completed", {
      sessionId: req.body?.sessionId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: res.get("content-length"),
    });
  });

  next();
};

// Error logging
export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  next(err);
};

// Performance logging
export const performanceLogger = {
  startTimer: (operation: string) => {
    const start = Date.now();
    return {
      end: (metadata?: any) => {
        const duration = Date.now() - start;
        logger.info(`Performance: ${operation}`, {
          duration: `${duration}ms`,
          ...metadata,
        });
      },
    };
  },
};

// AI metrics logging
export const aiMetrics = {
  logIntent: (intent: any, confidence: number) => {
    aiLogger.info("Intent detected", {
      action: intent.action,
      confidence,
      extractedValue: intent.extractedValue,
    });
  },

  logConversationStep: (from: string, to: string) => {
    aiLogger.info("Conversation transition", {
      from,
      to,
    });
  },

  logApiCall: (model: string, tokens: number, duration: number) => {
    aiLogger.info("OpenAI API call", {
      model,
      tokens,
      duration: `${duration}ms`,
      cost: (tokens * 0.00002).toFixed(4), // Rough cost estimate
    });
  },

  logError: (error: any, context: any) => {
    aiLogger.error("AI service error", {
      error: error.message,
      code: error.code,
      context,
    });
  },
};
