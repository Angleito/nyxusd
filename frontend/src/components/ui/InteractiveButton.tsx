import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { useHoverAnimation } from '../../hooks/useAnimations';

export interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether button is in loading state */
  loading?: boolean;
  /** Animation type on hover */
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  /** Custom className */
  className?: string;
  /** Icon element to display before text */
  leftIcon?: React.ReactNode;
  /** Icon element to display after text */
  rightIcon?: React.ReactNode;
  /** Children content */
  children: React.ReactNode;
}

export const InteractiveButton = forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      hoverEffect = 'lift',
      className,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const { hoverProps, isHovered } = useHoverAnimation();

    const baseClasses = [
      'inline-flex items-center justify-center font-semibold',
      'transition-all-fast focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'relative overflow-hidden group'
    ];

    const variantClasses = {
      primary: [
        'btn-primary',
        hoverEffect === 'glow' && 'btn-hover-glow',
        hoverEffect === 'lift' && 'btn-hover-lift',
        hoverEffect === 'scale' && 'btn-hover-scale',
        'focus:ring-purple-500'
      ],
      secondary: [
        'btn-secondary',
        hoverEffect === 'lift' && 'btn-hover-lift',
        hoverEffect === 'scale' && 'btn-hover-scale',
        'focus:ring-gray-500'
      ],
      tertiary: [
        'btn-tertiary',
        hoverEffect === 'glow' && 'btn-hover-glow',
        hoverEffect === 'lift' && 'btn-hover-lift',
        'focus:ring-purple-500'
      ],
      ghost: [
        'btn-ghost',
        hoverEffect === 'scale' && 'btn-hover-scale',
        'focus:ring-gray-500'
      ],
      danger: [
        'bg-red-600 hover:bg-red-700 text-white',
        hoverEffect === 'lift' && 'btn-hover-lift',
        hoverEffect === 'glow' && 'hover:shadow-red-500/50',
        'focus:ring-red-500'
      ]
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md gap-1',
      md: 'px-4 py-2 text-base rounded-lg gap-2',
      lg: 'px-6 py-3 text-lg rounded-lg gap-2',
      xl: 'px-8 py-4 text-xl rounded-xl gap-3'
    };

    const rippleClasses = [
      'absolute inset-0 opacity-0 group-active:opacity-25',
      'bg-white rounded-lg transition-opacity duration-150',
    ];

    return (
      <button
        ref={ref}
        {...props}
        {...hoverProps}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          loading && 'cursor-wait',
          className
        )}
        disabled={disabled || loading}
      >
        {/* Ripple effect */}
        <span className={cn(rippleClasses)} />
        
        {/* Content */}
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            <span>Loading...</span>
          </div>
        ) : (
          <>
            {leftIcon && (
              <span className={cn(
                'flex-shrink-0 transition-transform duration-200',
                isHovered && 'scale-110'
              )}>
                {leftIcon}
              </span>
            )}
            <span className="flex-1">{children}</span>
            {rightIcon && (
              <span className={cn(
                'flex-shrink-0 transition-transform duration-200',
                isHovered && 'scale-110'
              )}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

InteractiveButton.displayName = 'InteractiveButton';

export default InteractiveButton;