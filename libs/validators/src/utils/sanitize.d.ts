/**
 * Data sanitization functions for security and data integrity
 * Prevents common security issues and normalizes input data
 */
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
export declare const sanitizeString: (input: unknown, options?: SanitizationOptions) => string;
export declare const escapeHtml: (input: string) => string;
export declare const removeSqlKeywords: (input: string) => string;
export declare const sanitizeSearchQuery: (query: unknown) => string;
export declare const sanitizeEmail: (email: unknown) => string;
export declare const sanitizeUrl: (url: unknown) => string;
/**
 * Numeric sanitization functions
 */
export declare const sanitizeNumber: (input: unknown, options?: {
    min?: number;
    max?: number;
    decimals?: number;
}) => number;
export declare const sanitizeInteger: (input: unknown, options?: {
    min?: number;
    max?: number;
}) => number;
export declare const sanitizePercentage: (input: unknown) => number;
export declare const sanitizeBasisPoints: (input: unknown) => number;
/**
 * Blockchain-specific sanitization
 */
export declare const sanitizeAddress: (address: unknown) => string;
export declare const sanitizeHash: (hash: unknown) => string;
export declare const sanitizeBigIntString: (input: unknown) => string;
/**
 * Object and array sanitization
 */
export declare const sanitizeObject: <T extends Record<string, unknown>>(obj: T, fieldSanitizers?: Partial<Record<keyof T, (value: unknown) => unknown>>) => Record<string, unknown>;
export declare const sanitizeArray: <T>(arr: unknown[], itemSanitizer: (item: unknown) => T, maxLength?: number) => T[];
/**
 * Financial data sanitization
 */
export declare const sanitizeAmount: (input: unknown) => string;
export declare const sanitizePrice: (input: unknown) => number;
/**
 * Batch sanitization utilities
 */
export declare const sanitizeBatch: <T extends Record<string, unknown>>(data: T, sanitizers: Record<string, (value: unknown) => unknown>) => Record<string, unknown>;
export declare const createSanitizer: <T>(sanitizerFn: (input: unknown) => T) => (input: unknown) => T;
/**
 * Security-focused sanitization presets
 */
export declare const sanitizeSecure: (input: unknown) => string;
export declare const sanitizeUserContent: (input: unknown) => string;
export declare const sanitizeConfig: (config: Record<string, unknown>) => Record<string, unknown>;
//# sourceMappingURL=sanitize.d.ts.map