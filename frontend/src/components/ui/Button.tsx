import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary:
    "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/25",
  secondary:
    "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 hover:border-gray-500",
  ghost:
    "bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-600",
  destructive:
    "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25",
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
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={clsx(
          // Base styles
          "relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
          // Variant styles
          buttonVariants[variant],
          // Size styles
          buttonSizes[size],
          className,
        )}
        disabled={isDisabled}
        whileHover={
          !isDisabled
            ? {
                y: -2,
                boxShadow:
                  variant === "primary"
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
        {/* Gradient overlay for primary and destructive variants */}
        {(variant === "primary" || variant === "destructive") && (
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
          {children}
        </span>
      </motion.button>
    );
  },
);

Button.displayName = "Button";
