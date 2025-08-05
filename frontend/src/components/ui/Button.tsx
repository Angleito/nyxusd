import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "glow" | "sanitized";
  size?: "sm" | "md" | "lg" | "xl" | "small" | "default" | "large";
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  asLink?: boolean;
  href?: string;
  to?: string;
}

// Map legacy size names to standard ones
const sizeMap = {
  small: "sm",
  default: "md",
  large: "lg",
} as const;

const buttonVariants = {
  primary:
    "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/25",
  secondary:
    "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 hover:border-gray-500",
  ghost:
    "bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-600",
  destructive:
    "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25",
  glow:
    "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/50 nyx-button-glow",
  sanitized:
    "bg-gray-700 hover:bg-gray-600 text-gray-100",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm font-medium",
  md: "px-4 py-2 text-sm font-medium",
  lg: "px-6 py-3 text-base font-medium",
  xl: "px-8 py-4 text-lg font-semibold",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      className,
      children,
      disabled,
      icon,
      iconPosition = "left",
      fullWidth = false,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const normalizedSize = sizeMap[size as keyof typeof sizeMap] || size;

    return (
      <motion.button
        ref={ref}
        className={clsx(
          // Base styles
          "relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
          // Variant styles
          buttonVariants[variant],
          // Size styles
          buttonSizes[normalizedSize as keyof typeof buttonSizes],
          // Full width
          fullWidth && "w-full",
          className,
        )}
        disabled={isDisabled}
        whileHover={
          !isDisabled
            ? {
                y: -2,
                scale: 1.02,
                boxShadow:
                  variant === "primary" || variant === "glow"
                    ? "0 10px 40px -12px rgba(168, 85, 247, 0.4)"
                    : variant === "destructive"
                      ? "0 10px 40px -12px rgba(239, 68, 68, 0.4)"
                      : "0 10px 40px -12px rgba(0, 0, 0, 0.3)",
              }
            : undefined
        }
        whileTap={!isDisabled ? { y: 0, scale: 0.98 } : undefined}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
        {...props}
      >
        {/* Gradient overlay for primary, glow and destructive variants */}
        {(variant === "primary" || variant === "destructive" || variant === "glow") && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}

        {/* Button content */}
        <span
          className={clsx("flex items-center gap-2", loading && "opacity-0")}
        >
          {icon && iconPosition === "left" && (
            <span className="inline-flex">{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="inline-flex">{icon}</span>
          )}
        </span>
      </motion.button>
    );
  },
);

Button.displayName = "Button";

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx("inline-flex rounded-lg shadow-sm", className)}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        return React.cloneElement(child as React.ReactElement<any>, {
          className: clsx(
            child.props.className,
            !isFirst && "-ml-px",
            isFirst && "rounded-r-none",
            isLast && "rounded-l-none",
            !isFirst && !isLast && "rounded-none",
          ),
        });
      })}
    </div>
  );
};

// Icon Button Component
interface IconButtonProps extends Omit<ButtonProps, "children"> {
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = "md", ...props }, ref) => {
    const iconSizes = {
      sm: "p-1.5",
      md: "p-2",
      lg: "p-3",
      xl: "p-4",
    };
    
    const normalizedSize = sizeMap[size as keyof typeof sizeMap] || size;
    
    return (
      <Button
        ref={ref}
        className={clsx(
          "!p-0",
          iconSizes[normalizedSize as keyof typeof iconSizes],
          className
        )}
        size={size}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";
