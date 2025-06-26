import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Loading spinner component - essential for loading states
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'white';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  label = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const variantClasses = {
    primary: 'border-purple-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
};

/**
 * Skeleton component - essential for content loading placeholders
 */
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height
}) => {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
      style={style}
    />
  );
};

/**
 * Loading button component - essential for form submissions
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500 disabled:bg-purple-300',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 disabled:bg-gray-100'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'cursor-not-allowed opacity-60',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Spinner
          size="sm"
          variant={variant === 'primary' ? 'white' : 'primary'}
          className="mr-2"
        />
      )}
      {children}
    </button>
  );
};

// Default export for convenience
export default {
  Spinner,
  Skeleton,
  LoadingButton
};