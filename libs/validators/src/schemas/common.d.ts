import { z } from "zod";
/**
 * Common validation utilities and base schemas
 */
export declare const AddressSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const HashSchema: z.ZodString;
export declare const TimestampSchema: z.ZodNumber;
export declare const BigIntStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>;
export declare const BigIntNumberSchema: z.ZodEffects<z.ZodNumber, bigint, number>;
export declare const BigIntSchema: z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>;
export declare const BasisPointsSchema: z.ZodNumber;
export declare const PercentageSchema: z.ZodNumber;
export declare const PriceSchema: z.ZodNumber;
export declare const AmountSchema: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
export declare const OptionalAmountSchema: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
export declare const TransactionStatusSchema: z.ZodEnum<["pending", "confirmed", "failed", "cancelled"]>;
export declare const AssetTypeSchema: z.ZodEnum<["native", "erc20", "wrapped", "synthetic"]>;
export declare const ChainIdSchema: z.ZodNumber;
export declare const NetworkSchema: z.ZodEnum<["mainnet", "testnet", "devnet", "local"]>;
export declare const UUIDSchema: z.ZodString;
export declare const NumericIdSchema: z.ZodNumber;
export declare const StringIdSchema: z.ZodString;
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    offset?: number | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const SortOrderSchema: z.ZodEnum<["asc", "desc"]>;
export declare const SortSchema: z.ZodObject<{
    field: z.ZodString;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    field: string;
    order: "asc" | "desc";
}, {
    field: string;
    order?: "asc" | "desc" | undefined;
}>;
export declare const DateRangeSchema: z.ZodEffects<z.ZodObject<{
    startDate: z.ZodDate;
    endDate: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    startDate: Date;
    endDate: Date;
}, {
    startDate: Date;
    endDate: Date;
}>, {
    startDate: Date;
    endDate: Date;
}, {
    startDate: Date;
    endDate: Date;
}>;
export declare const MetadataSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const ErrorCodeSchema: z.ZodEnum<["VALIDATION_ERROR", "INSUFFICIENT_FUNDS", "INVALID_COLLATERAL", "LIQUIDATION_THRESHOLD_EXCEEDED", "ORACLE_ERROR", "NETWORK_ERROR", "UNAUTHORIZED", "NOT_FOUND", "INTERNAL_ERROR"]>;
export declare const ValidationErrorSchema: z.ZodObject<{
    code: z.ZodEnum<["VALIDATION_ERROR", "INSUFFICIENT_FUNDS", "INVALID_COLLATERAL", "LIQUIDATION_THRESHOLD_EXCEEDED", "ORACLE_ERROR", "NETWORK_ERROR", "UNAUTHORIZED", "NOT_FOUND", "INTERNAL_ERROR"]>;
    message: z.ZodString;
    field: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    code: "VALIDATION_ERROR" | "INSUFFICIENT_FUNDS" | "INVALID_COLLATERAL" | "LIQUIDATION_THRESHOLD_EXCEEDED" | "ORACLE_ERROR" | "NETWORK_ERROR" | "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL_ERROR";
    message: string;
    field?: string | undefined;
    details?: Record<string, unknown> | undefined;
}, {
    code: "VALIDATION_ERROR" | "INSUFFICIENT_FUNDS" | "INVALID_COLLATERAL" | "LIQUIDATION_THRESHOLD_EXCEEDED" | "ORACLE_ERROR" | "NETWORK_ERROR" | "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL_ERROR";
    message: string;
    field?: string | undefined;
    details?: Record<string, unknown> | undefined;
}>;
export declare const HealthFactorSchema: z.ZodNumber;
export declare const RiskLevelSchema: z.ZodEnum<["low", "medium", "high", "critical"]>;
export declare const ConfigValueSchema: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodUnknown, "many">, z.ZodRecord<z.ZodString, z.ZodUnknown>]>;
export declare const ConfigSchema: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodUnknown, "many">, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
export declare const EventTypeSchema: z.ZodEnum<["cdp_created", "cdp_updated", "cdp_liquidated", "cdp_closed", "collateral_deposited", "collateral_withdrawn", "debt_minted", "debt_repaid", "price_updated", "system_parameter_changed"]>;
export declare const LogLevelSchema: z.ZodEnum<["debug", "info", "warn", "error", "fatal"]>;
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
//# sourceMappingURL=common.d.ts.map