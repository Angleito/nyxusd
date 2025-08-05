// Dashboard Components Exports
export { Dashboard } from "./Dashboard";
export { StatsCard } from "./StatsCard";
export { WelcomeCard } from "./WelcomeCard";
export { SystemHealthCard } from "./SystemHealthCard";
export { OraclePricesCard } from "./OraclePricesCard";
export { WalletDashboardCard } from "./WalletDashboardCard";
export { default as HeroSection } from "./HeroSection";

// Legacy exports for backward compatibility
export { Dashboard as ModernDashboard } from "./Dashboard";
export { Dashboard as DashboardWithHero } from "./Dashboard";
export { Dashboard as NyxDashboard } from "./Dashboard";

// Types
export type { DashboardProps } from "./Dashboard";
export type { StatsCardProps } from "./StatsCard";
export type { WelcomeCardProps } from "./WelcomeCard";
export type { SystemHealthCardProps } from "./SystemHealthCard";
export type { OraclePricesCardProps } from "./OraclePricesCard";

// Default export
export { Dashboard as default } from "./Dashboard";
