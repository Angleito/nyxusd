import { z } from "zod";

/**
 * Common validation utilities and base schemas
 */

// Basic primitive schemas with enhanced validation
export const AddressSchema = z
  .string()
  .min(1, "Address cannot be empty")
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
  .transform((val) => val.toLowerCase());

export const HashSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid hash format (must be 32 bytes hex)");

export const TimestampSchema = z
  .number()
  .int("Timestamp must be an integer")
  .positive("Timestamp must be positive")
  .max(4102444800, "Timestamp too far in the future"); // Year 2100

// BigInt validation with custom transformations
export const BigIntStringSchema = z
  .string()
  .regex(/^\d+$/, "Must be a valid numeric string")
  .transform((val) => BigInt(val))
  .refine((val) => val >= 0n, "BigInt value must be non-negative");

export const BigIntNumberSchema = z
  .number()
  .int("Must be an integer")
  .nonnegative("Must be non-negative")
  .transform((val) => BigInt(val));

export const BigIntSchema = z.union([
  z.bigint().nonnegative("BigInt must be non-negative"),
  BigIntStringSchema,
  BigIntNumberSchema,
]);

// Percentage validation (0-10000 basis points = 0-100%)
export const BasisPointsSchema = z
  .number()
  .int("Basis points must be an integer")
  .min(0, "Basis points cannot be negative")
  .max(10000, "Basis points cannot exceed 10000 (100%)");

export const PercentageSchema = z
  .number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100");

// Price validation with precision constraints
export const PriceSchema = z
  .number()
  .positive("Price must be positive")
  .finite("Price must be finite")
  .multipleOf(0.000001, "Price precision limited to 6 decimal places");

// Asset amount validation
export const AmountSchema = BigIntSchema.refine(
  (val) => val > 0n,
  "Amount must be positive",
);

export const OptionalAmountSchema = BigIntSchema.refine(
  (val) => val >= 0n,
  "Amount must be non-negative",
);

// Status and state enums
export const TransactionStatusSchema = z.enum([
  "pending",
  "confirmed",
  "failed",
  "cancelled",
]);

export const AssetTypeSchema = z.enum([
  "native",
  "erc20",
  "wrapped",
  "synthetic",
]);

// Network and chain validation
export const ChainIdSchema = z
  .number()
  .int("Chain ID must be an integer")
  .positive("Chain ID must be positive");

export const NetworkSchema = z.enum(["mainnet", "testnet", "devnet", "local"]);

// Generic ID schemas
export const UUIDSchema = z.string().uuid("Invalid UUID format");

export const NumericIdSchema = z
  .number()
  .int("ID must be an integer")
  .positive("ID must be positive");

export const StringIdSchema = z
  .string()
  .min(1, "ID cannot be empty")
  .max(128, "ID too long");

// Pagination schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100, "Limit cannot exceed 100")
    .default(20),
  offset: z.number().int().min(0).optional(),
});

export const SortOrderSchema = z.enum(["asc", "desc"]);

export const SortSchema = z.object({
  field: z.string().min(1, "Sort field cannot be empty"),
  order: SortOrderSchema.default("asc"),
});

// Date range validation
export const DateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine(
    (data) => data.startDate <= data.endDate,
    "Start date must be before or equal to end date",
  );

// Generic metadata schema
export const MetadataSchema = z.record(z.string(), z.unknown());

// Error handling schemas
export const ErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "INSUFFICIENT_FUNDS",
  "INVALID_COLLATERAL",
  "LIQUIDATION_THRESHOLD_EXCEEDED",
  "ORACLE_ERROR",
  "NETWORK_ERROR",
  "UNAUTHORIZED",
  "NOT_FOUND",
  "INTERNAL_ERROR",
]);

export const ValidationErrorSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string().min(1, "Error message cannot be empty"),
  field: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

// Health factor and risk metrics
export const HealthFactorSchema = z
  .number()
  .nonnegative("Health factor cannot be negative")
  .finite("Health factor must be finite");

export const RiskLevelSchema = z.enum(["low", "medium", "high", "critical"]);

// Configuration schemas
export const ConfigValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.unknown()),
  z.record(z.string(), z.unknown()),
]);

export const ConfigSchema = z.record(z.string(), ConfigValueSchema);

// Event and log schemas
export const EventTypeSchema = z.enum([
  "cdp_created",
  "cdp_updated",
  "cdp_liquidated",
  "cdp_closed",
  "collateral_deposited",
  "collateral_withdrawn",
  "debt_minted",
  "debt_repaid",
  "price_updated",
  "system_parameter_changed",
]);

export const LogLevelSchema = z.enum([
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
]);

/**
 * Type exports for TypeScript inference
 */
export type Address = z.infer<typeof AddressSchema>;
export type Hash = z.infer<typeof HashSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
export type BigIntValue = z.infer<typeof BigIntSchema>;
export type BasisPoints = z.infer<typeof BasisPointsSchema>;
export type Percentage = z.infer<typeof PercentageSchema>;
export type Price = z.infer<typeof PriceSchema>;
export type Amount = z.infer<typeof AmountSchema>;
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;
export type AssetType = z.infer<typeof AssetTypeSchema>;
export type ChainId = z.infer<typeof ChainIdSchema>;
export type Network = z.infer<typeof NetworkSchema>;
export type UUID = z.infer<typeof UUIDSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type SortOrder = z.infer<typeof SortOrderSchema>;
export type Sort = z.infer<typeof SortSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type SchemaValidationError = z.infer<typeof ValidationErrorSchema>;
export type HealthFactor = z.infer<typeof HealthFactorSchema>;
export type RiskLevel = z.infer<typeof RiskLevelSchema>;
export type ConfigValue = z.infer<typeof ConfigValueSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type EventType = z.infer<typeof EventTypeSchema>;
export type LogLevel = z.infer<typeof LogLevelSchema>;
