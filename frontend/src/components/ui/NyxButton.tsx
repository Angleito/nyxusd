import React from "react";
import clsx from "clsx";
import { motion, type MotionProps } from "framer-motion";

interface NyxButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'whileHover' | 'whileTap' | 'transition'> {
  variant?: "sanitized" | "primary" | "secondary" | "ghost" | "glow";
  size?: "small" | "default" | "large";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  asLink?: boolean;
  href?: string;
  to?: string;
  whileHover?: any;
  whileTap?: any;
  transition?: any;
  onAnimationStart?: any;
  onDragStart?: any;
  onDragEnd?: any;
  onDrag?: any;
}

export const NyxButton = React.forwardRef<HTMLButtonElement, NyxButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "default",
      loading = false,
      disabled = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      type = "button",
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonClasses = clsx(
      "nyx-button",
      {
        "nyx-button-primary": variant === "primary",
        "nyx-button-secondary": variant === "secondary",
        "nyx-button-ghost": variant === "ghost",
        "nyx-button-glow": variant === "glow",
        "nyx-button-small": size === "small",
        "nyx-button-large": size === "large",
        "nyx-button-loading": loading,
        "nyx-button-disabled": disabled || loading,
        "w-full": fullWidth,
      },
      className
    );

    const content = (
      <>
        {icon && iconPosition === "left" && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {icon && iconPosition === "right" && (
          <span className="ml-2">{icon}</span>
        )}
      </>
    );

    return (
      <motion.button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={onClick}
        whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {content}
      </motion.button>
    );
  }
);

NyxButton.displayName = "NyxButton";

// Button Group Component
interface NyxButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const NyxButtonGroup: React.FC<NyxButtonGroupProps> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx("nyx-button-group", className)}>
      {children}
    </div>
  );
};

// Icon Button Component
interface NyxIconButtonProps extends Omit<NyxButtonProps, "children"> {
  "aria-label": string;
}

export const NyxIconButton = React.forwardRef<HTMLButtonElement, NyxIconButtonProps>(
  ({ icon, className, size = "default", ...props }, ref) => {
    return (
      <NyxButton
        ref={ref}
        className={clsx("nyx-button-icon", className)}
        size={size}
        {...props}
      >
        {icon}
      </NyxButton>
    );
  }
);

NyxIconButton.displayName = "NyxIconButton";