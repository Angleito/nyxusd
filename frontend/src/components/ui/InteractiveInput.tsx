import React, { forwardRef, useState } from 'react';
import { cn } from '../../utils/cn';

export interface InteractiveInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input variant */
  variant?: 'default' | 'glass' | 'underline';
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Focus animation effect */
  focusEffect?: 'glow' | 'scale' | 'slide' | 'none';
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Whether to show character count */
  showCharCount?: boolean;
  /** Maximum character count */
  maxLength?: number;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const InteractiveInput = forwardRef<HTMLInputElement, InteractiveInputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      focusEffect = 'glow',
      label,
      error,
      helperText,
      showCharCount = false,
      maxLength,
      leftIcon,
      rightIcon,
      className,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');
    
    const currentValue = value !== undefined ? value : internalValue;
    const charCount = String(currentValue).length;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      props.onChange?.(e);
    };

    const baseClasses = [
      'w-full transition-all-fast outline-none',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500'
    ];

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg'
    };

    const variantClasses = {
      default: [
        'input-field',
        focusEffect === 'glow' && 'input-focus-glow',
        focusEffect === 'scale' && isFocused && 'scale-[1.02]'
      ],
      glass: [
        'glass rounded-lg',
        'border border-white/20',
        focusEffect === 'glow' && 'focus:shadow-purple-500/25 focus:shadow-lg',
        focusEffect === 'scale' && isFocused && 'scale-[1.02]'
      ],
      underline: [
        'bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600',
        'rounded-none px-0 py-2',
        focusEffect === 'slide' && 'input-focus-slide',
        'focus:border-purple-500 dark:focus:border-purple-400'
      ]
    };

    const iconClasses = leftIcon || rightIcon ? {
      sm: leftIcon ? 'pl-9' : rightIcon ? 'pr-9' : '',
      md: leftIcon ? 'pl-11' : rightIcon ? 'pr-11' : '',
      lg: leftIcon ? 'pl-13' : rightIcon ? 'pr-13' : ''
    } : { sm: '', md: '', lg: '' };

    const errorClasses = error ? [
      'border-red-500 dark:border-red-400',
      'focus:border-red-500 dark:focus:border-red-400',
      'focus:ring-red-500/20'
    ] : [];

    return (
      <div className="space-y-1">
        {/* Label */}
        {label && (
          <label className={cn(
            'block text-sm font-medium transition-colors duration-200',
            error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
            isFocused && !error && 'text-purple-600 dark:text-purple-400'
          )}>
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200',
              isFocused && 'text-purple-500',
              size === 'sm' && 'left-2',
              size === 'lg' && 'left-4'
            )}>
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            className={cn(
              baseClasses,
              sizeClasses[size],
              variantClasses[variant],
              iconClasses[size],
              errorClasses,
              className
            )}
            value={currentValue}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200',
              isFocused && 'text-purple-500',
              size === 'sm' && 'right-2',
              size === 'lg' && 'right-4'
            )}>
              {rightIcon}
            </div>
          )}

          {/* Animated Focus Ring */}
          {focusEffect === 'glow' && (
            <div className={cn(
              'absolute inset-0 rounded-lg pointer-events-none transition-all duration-300',
              isFocused && !error ? 'ring-2 ring-purple-500/50 ring-offset-2 ring-offset-transparent' : 'ring-0'
            )} />
          )}
        </div>

        {/* Helper Text and Character Count */}
        <div className="flex justify-between items-center">
          <div className="text-sm">
            {error ? (
              <p className="text-red-600 dark:text-red-400 animate-slide-down">
                {error}
              </p>
            ) : helperText ? (
              <p className="text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            ) : null}
          </div>
          
          {showCharCount && maxLength && (
            <div className={cn(
              'text-xs transition-colors duration-200',
              charCount > maxLength * 0.9 
                ? 'text-orange-500 dark:text-orange-400' 
                : charCount === maxLength 
                ? 'text-red-500 dark:text-red-400'
                : 'text-gray-400 dark:text-gray-500'
            )}>
              {charCount}/{maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }
);

InteractiveInput.displayName = 'InteractiveInput';

export default InteractiveInput;