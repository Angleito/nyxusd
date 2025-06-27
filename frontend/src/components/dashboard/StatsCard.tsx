import React from "react";

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  isLoading = false,
  icon,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            {icon && <div className="h-6 w-6 bg-gray-200 rounded"></div>}
          </div>
          <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-purple-200 transition-all duration-200 transform hover:scale-105 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        {icon && <div className="text-purple-500 opacity-75">{icon}</div>}
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>

        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}

        {trend && (
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-1 text-sm font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              <svg
                className={`w-4 h-4 ${trend.isPositive ? "" : "rotate-180"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 17l9.2-9.2M17 17V7H7"
                />
              </svg>
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <span className="text-xs text-gray-400">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
