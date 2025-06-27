/**
 * Data sanitization functions for security and data integrity
 * Prevents common security issues and normalizes input data
 */

// Security-related sanitization options
export interface SanitizationOptions {
  readonly maxLength?: number;
  readonly allowedChars?: RegExp;
  readonly trim?: boolean;
  readonly toLowerCase?: boolean;
  readonly toUpperCase?: boolean;
  readonly removeNulls?: boolean;
  readonly escapeHtml?: boolean;
  readonly removeSqlKeywords?: boolean;
  readonly maxDecimalPlaces?: number;
}

/**
 * String sanitization functions
 */

// Basic string sanitization with common security measures
export const sanitizeString = (
  input: unknown,
  options: SanitizationOptions = {},
): string => {
  if (input == null) {
    return "";
  }

  let str = String(input);

  // Remove null bytes and other control characters
  if (options.removeNulls !== false) {
    str = str.replace(/[\x00-\x1F\x7F]/g, "");
  }

  // Trim whitespace
  if (options.trim !== false) {
    str = str.trim();
  }

  // Case transformations
  if (options.toLowerCase) {
    str = str.toLowerCase();
  } else if (options.toUpperCase) {
    str = str.toUpperCase();
  }

  // Limit length
  if (options.maxLength && str.length > options.maxLength) {
    str = str.substring(0, options.maxLength);
  }

  // Filter allowed characters
  if (options.allowedChars) {
    str = str.replace(new RegExp(`[^${options.allowedChars.source}]`, "g"), "");
  }

  // HTML escape
  if (options.escapeHtml) {
    str = escapeHtml(str);
  }

  // Remove SQL keywords (basic protection)
  if (options.removeSqlKeywords) {
    str = removeSqlKeywords(str);
  }

  return str;
};

// HTML escape function
export const escapeHtml = (input: string): string => {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match] || match);
};

// Remove common SQL injection keywords
export const removeSqlKeywords = (input: string): string => {
  const sqlKeywords = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "CREATE",
    "ALTER",
    "EXEC",
    "EXECUTE",
    "UNION",
    "SCRIPT",
    "DECLARE",
    "CAST",
    "CONVERT",
    "INFORMATION_SCHEMA",
    "SYSOBJECTS",
    "SYSCOLUMNS",
    "DATABASE",
    "TABLE",
    "COLUMN",
    "INDEX",
    "VIEW",
    "PROCEDURE",
    "FUNCTION",
    "TRIGGER",
  ];

  let sanitized = input;
  sqlKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    sanitized = sanitized.replace(regex, "");
  });

  return sanitized;
};

// Sanitize user input for search queries
export const sanitizeSearchQuery = (query: unknown): string => {
  return sanitizeString(query, {
    maxLength: 255,
    allowedChars: /a-zA-Z0-9\s\-_.,!?@#$%^&*()+=\[\]{}|\\:";'<>?,./,
    trim: true,
    escapeHtml: true,
    removeSqlKeywords: true,
  });
};

// Sanitize email addresses
export const sanitizeEmail = (email: unknown): string => {
  const sanitized = sanitizeString(email, {
    maxLength: 254, // RFC 5321 limit
    allowedChars: /a-zA-Z0-9._%+-@/,
    trim: true,
    toLowerCase: true,
  });

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : "";
};

// Sanitize URLs
export const sanitizeUrl = (url: unknown): string => {
  const sanitized = sanitizeString(url, {
    maxLength: 2048,
    trim: true,
  });

  // Only allow http/https protocols
  try {
    const urlObj = new URL(sanitized);
    if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
      return urlObj.toString();
    }
  } catch {
    // Invalid URL
  }

  return "";
};

/**
 * Numeric sanitization functions
 */

// Sanitize and normalize numbers
export const sanitizeNumber = (
  input: unknown,
  options: { min?: number; max?: number; decimals?: number } = {},
): number => {
  let num: number;

  if (typeof input === "number") {
    num = input;
  } else if (typeof input === "string") {
    // Remove non-numeric characters except decimal point and minus sign
    const cleaned = input.replace(/[^\d.-]/g, "");
    num = parseFloat(cleaned);
  } else {
    num = Number(input);
  }

  // Handle NaN and infinite values
  if (!isFinite(num)) {
    return 0;
  }

  // Apply min/max constraints
  if (options.min !== undefined && num < options.min) {
    num = options.min;
  }
  if (options.max !== undefined && num > options.max) {
    num = options.max;
  }

  // Round to specified decimal places
  if (options.decimals !== undefined) {
    const factor = Math.pow(10, options.decimals);
    num = Math.round(num * factor) / factor;
  }

  return num;
};

// Sanitize integer values
export const sanitizeInteger = (
  input: unknown,
  options: { min?: number; max?: number } = {},
): number => {
  const num = sanitizeNumber(input, options);
  return Math.trunc(num);
};

// Sanitize percentage values (0-100)
export const sanitizePercentage = (input: unknown): number => {
  return sanitizeNumber(input, { min: 0, max: 100, decimals: 2 });
};

// Sanitize basis points (0-10000)
export const sanitizeBasisPoints = (input: unknown): number => {
  return sanitizeInteger(input, { min: 0, max: 10000 });
};

/**
 * Blockchain-specific sanitization
 */

// Sanitize Ethereum addresses
export const sanitizeAddress = (address: unknown): string => {
  const sanitized = sanitizeString(address, {
    maxLength: 42,
    allowedChars: /0-9a-fA-Fx/,
    trim: true,
  });

  // Check if it matches Ethereum address format
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (addressRegex.test(sanitized)) {
    return sanitized.toLowerCase(); // Normalize to lowercase
  }

  return "";
};

// Sanitize transaction hashes
export const sanitizeHash = (hash: unknown): string => {
  const sanitized = sanitizeString(hash, {
    maxLength: 66,
    allowedChars: /0-9a-fA-Fx/,
    trim: true,
  });

  // Check if it matches hash format (32 bytes hex)
  const hashRegex = /^0x[a-fA-F0-9]{64}$/;
  if (hashRegex.test(sanitized)) {
    return sanitized.toLowerCase();
  }

  return "";
};

// Sanitize BigInt string representations
export const sanitizeBigIntString = (input: unknown): string => {
  const sanitized = sanitizeString(input, {
    allowedChars: /0-9/,
    trim: true,
  });

  // Remove leading zeros but keep at least one digit
  return sanitized.replace(/^0+/, "") || "0";
};

/**
 * Object and array sanitization
 */

// Deep sanitize objects
export const sanitizeObject = <T extends Record<string, unknown>>(
  obj: T,
  fieldSanitizers: Partial<Record<keyof T, (value: unknown) => unknown>> = {},
): Record<string, unknown> => {
  if (!obj || typeof obj !== "object") {
    return {};
  }

  const sanitized: Record<string, unknown> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const sanitizer = fieldSanitizers[key as keyof T];

    if (sanitizer) {
      sanitized[key] = sanitizer(value);
    } else if (value !== null && value !== undefined) {
      // Default sanitization based on type
      if (typeof value === "string") {
        sanitized[key] = sanitizeString(value, { trim: true });
      } else if (typeof value === "number") {
        sanitized[key] = sanitizeNumber(value);
      } else if (typeof value === "object" && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
  });

  return sanitized;
};

// Sanitize arrays
export const sanitizeArray = <T>(
  arr: unknown[],
  itemSanitizer: (item: unknown) => T,
  maxLength: number = 1000,
): T[] => {
  if (!Array.isArray(arr)) {
    return [];
  }

  // Limit array length to prevent DoS attacks
  const limitedArray = arr.slice(0, maxLength);

  return limitedArray
    .map(itemSanitizer)
    .filter((item) => item !== null && item !== undefined);
};

/**
 * Financial data sanitization
 */

// Sanitize monetary amounts
export const sanitizeAmount = (input: unknown): string => {
  const sanitized = sanitizeString(input, {
    allowedChars: /0-9./,
    trim: true,
  });

  // Ensure only one decimal point
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }

  // Convert to BigInt-compatible string (remove decimal)
  if (parts.length === 2 && parts[1]) {
    // Assuming 18 decimal places for most tokens
    const decimals = parts[1].padEnd(18, "0").substring(0, 18);
    return (parts[0] || "0") + decimals;
  }

  return (parts[0] || "0") + "0".repeat(18);
};

// Sanitize price values
export const sanitizePrice = (input: unknown): number => {
  return sanitizeNumber(input, { min: 0, decimals: 6 });
};

/**
 * Batch sanitization utilities
 */

// Sanitize multiple values with different sanitizers
export const sanitizeBatch = <T extends Record<string, unknown>>(
  data: T,
  sanitizers: Record<string, (value: unknown) => unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    const sanitizer = sanitizers[key];
    if (sanitizer) {
      result[key] = sanitizer(value);
    } else {
      result[key] = value;
    }
  });

  return result;
};

// Create a sanitizer function for reuse
export const createSanitizer =
  <T>(sanitizerFn: (input: unknown) => T) =>
  (input: unknown): T =>
    sanitizerFn(input);

/**
 * Security-focused sanitization presets
 */

// High-security string sanitization
export const sanitizeSecure = (input: unknown): string => {
  return sanitizeString(input, {
    maxLength: 255,
    allowedChars: /a-zA-Z0-9\s\-_/,
    trim: true,
    escapeHtml: true,
    removeSqlKeywords: true,
    removeNulls: true,
  });
};

// Sanitize user-generated content
export const sanitizeUserContent = (input: unknown): string => {
  return sanitizeString(input, {
    maxLength: 10000,
    trim: true,
    escapeHtml: true,
    removeSqlKeywords: true,
    removeNulls: true,
  });
};

// Sanitize configuration values
export const sanitizeConfig = (
  config: Record<string, unknown>,
): Record<string, unknown> => {
  return sanitizeObject(config, {
    // Add specific sanitizers for known config fields
    port: (value) => sanitizeInteger(value, { min: 1, max: 65535 }),
    timeout: (value) => sanitizeInteger(value, { min: 0, max: 300000 }),
    maxConnections: (value) => sanitizeInteger(value, { min: 1, max: 10000 }),
    apiKey: (value) => sanitizeString(value, { maxLength: 256, trim: true }),
    url: sanitizeUrl,
    email: sanitizeEmail,
  });
};
