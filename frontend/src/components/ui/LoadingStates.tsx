import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Loading spinner component with multiple variants
 */
interface SpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'white';
  /** Custom className */
  className?: string;
  /** Accessibility label */
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
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'border-purple-600 border-t-transparent',
    secondary: 'border-gray-400 border-t-transparent',
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
 * Pulsing dots loader
 */
interface DotsLoaderProps {
  /** Size of dots */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'secondary';
  /** Custom className */
  className?: string;
  /** Number of dots */
  dots?: 3 | 4 | 5;
}

export const DotsLoader: React.FC<DotsLoaderProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  dots = 3
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const variantClasses = {
    primary: 'bg-purple-600',
    secondary: 'bg-gray-400'
  };

  return (
    <div className={cn('flex space-x-1', className)} role="status" aria-label="Loading">
      {Array.from({ length: dots }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-loading-dots',
            sizeClasses[size],
            variantClasses[variant]
          )}
          style={{
            animationDelay: `${i * 0.2}s`
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Progress bar component
 */
interface ProgressBarProps {
  /** Progress value (0-100) */
  value?: number;
  /** Whether to show indeterminate state */
  indeterminate?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'secondary';
  /** Custom className */
  className?: string;
  /** Show percentage label */
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  indeterminate = false,
  size = 'md',
  variant = 'primary',
  className,
  showLabel = false
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    primary: 'bg-purple-600',
    secondary: 'bg-gray-400'
  };

  const progressValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          {!indeterminate && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(progressValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : progressValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {indeterminate ? (
          <div className="progress-bar-indeterminate h-full">
            <div className={cn('h-full', variantClasses[variant])} />
          </div>
        ) : (
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out',
              variantClasses[variant]
            )}
            style={{ width: `${progressValue}%` }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Skeleton loading components
 */
interface SkeletonProps {
  /** Custom className */
  className?: string;
  /** Whether to show shimmer effect */
  shimmer?: boolean;
  /** Animation variant */
  variant?: 'pulse' | 'wave';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  shimmer = true,
  variant = 'pulse'
}) => {
  const animationClass = variant === 'pulse' ? 'animate-pulse' : 'animate-shimmer';
  
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 rounded',
        shimmer && animationClass,
        className
      )}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Skeleton text lines
 */
interface SkeletonTextProps {
  /** Number of lines */
  lines?: number;
  /** Custom className */
  className?: string;
  /** Whether to show shimmer effect */
  shimmer?: boolean;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className,
  shimmer = true
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          shimmer={shimmer}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full' // Last line is shorter
          )}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton card component
 */
interface SkeletonCardProps {
  /** Whether to include avatar */
  avatar?: boolean;
  /** Custom className */
  className?: string;
  /** Whether to show shimmer effect */
  shimmer?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  avatar = false,
  className,
  shimmer = true
}) => {
  return (
    <div className={cn('p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md', className)}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton shimmer={shimmer} className="w-12 h-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton shimmer={shimmer} className="h-4 w-1/2" />
            <Skeleton shimmer={shimmer} className="h-3 w-1/3" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        <Skeleton shimmer={shimmer} className="h-6 w-3/4" />
        <SkeletonText lines={3} shimmer={shimmer} />
        <div className="flex space-x-2 pt-2">
          <Skeleton shimmer={shimmer} className="h-8 w-20 rounded-md" />
          <Skeleton shimmer={shimmer} className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton table component
 */
interface SkeletonTableProps {
  /** Number of rows */
  rows?: number;
  /** Number of columns */
  columns?: number;
  /** Custom className */
  className?: string;
  /** Whether to show shimmer effect */
  shimmer?: boolean;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className,
  shimmer = true
}) => {
  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="grid gap-4 p-4 border-b border-gray-200 dark:border-gray-700" 
           style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} shimmer={shimmer} className="h-4 w-3/4" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 p-4 border-b border-gray-100 dark:border-gray-800"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton
              key={colIndex}
              shimmer={shimmer}
              className={cn(
                'h-4',
                colIndex === 0 ? 'w-full' : 'w-3/4' // First column full width
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Loading overlay component
 */
interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Loading message */
  message?: string;
  /** Loading component variant */
  variant?: 'spinner' | 'dots' | 'progress';
  /** Custom className */
  className?: string;
  /** Progress value for progress variant */
  progress?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  variant = 'spinner',
  className,
  progress
}) => {
  if (!visible) return null;

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader size="lg" />;
      case 'progress':
        return (
          <ProgressBar
            value={progress}
            indeterminate={progress === undefined}
            size="md"
            showLabel
          />
        );
      default:
        return <Spinner size="lg" variant="white" />;
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        'backdrop-enter backdrop-enter-active',
        className
      )}
      role="dialog"
      aria-label="Loading"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          {renderLoader()}
          <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Button with loading state
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Loading text to display */
  loadingText?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Children content */
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white btn-hover-glow',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 btn-hover-lift',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 btn-hover-scale'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const spinnerSize = {
    sm: 'sm',
    md: 'sm',
    lg: 'md'
  } as const;

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold',
        'transition-all-fast focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading && (
        <Spinner
          size={spinnerSize[size]}
          variant={variant === 'primary' ? 'white' : 'primary'}
          className="mr-2"
        />
      )}
      {loading ? (loadingText || 'Loading...') : children}
    </button>
  );
};

/**
 * Page loading component
 */
interface PageLoadingProps {
  /** Loading message */
  message?: string;
  /** Custom className */
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading page...',
  className
}) => {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900',
        className
      )}
    >
      <div className="text-center space-y-4">
        <div className="animate-float">
          <Spinner size="xl" />
        </div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

/**
 * Content loading placeholder with staggered animation
 */
interface ContentLoadingProps {
  /** Number of skeleton cards */
  cards?: number;
  /** Custom className */
  className?: string;
  /** Layout type */
  layout?: 'grid' | 'list';
}

export const ContentLoading: React.FC<ContentLoadingProps> = ({
  cards = 6,
  className,
  layout = 'grid'
}) => {
  const gridClass = layout === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-6';

  return (
    <div className={cn(gridClass, className)}>
      {Array.from({ length: cards }, (_, i) => (
        <div
          key={i}
          className={cn(
            'animate-fade-in opacity-0',
            `animate-stagger-${Math.min(i + 1, 5)}`
          )}
        >
          <SkeletonCard shimmer avatar />
        </div>
      ))}
    </div>
  );
};

// Default export
export default {
  Spinner,
  DotsLoader,
  ProgressBar,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  LoadingOverlay,
  LoadingButton,
  PageLoading,
  ContentLoading
};