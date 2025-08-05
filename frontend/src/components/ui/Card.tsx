import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";

export interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "outlined" | "gradient" | "glow" | "data" | "nft";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const cardVariants = {
  default: "bg-gray-900/50 border border-gray-800",
  elevated: "bg-gray-900/80 border border-gray-700 shadow-2xl",
  outlined: "bg-transparent border-2 border-gray-700",
  gradient:
    "bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50",
  glow:
    "bg-gray-900/80 border border-purple-500/30 shadow-lg shadow-purple-500/20 nyx-card-glow",
  data:
    "bg-gray-900/60 border border-gray-700/50 backdrop-blur-md",
  nft:
    "bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30",
};

const cardPadding = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      hover = true,
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        className={clsx(
          // Base styles
          "relative rounded-xl backdrop-blur-sm overflow-hidden",
          // Variant styles
          cardVariants[variant],
          // Padding styles
          cardPadding[padding],
          // Interactive styles
          onClick && "cursor-pointer",
          className,
        )}
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={
          hover
            ? {
                y: -4,
                scale: onClick ? 0.98 : 1,
                boxShadow:
                  variant === "gradient" || variant === "elevated" || variant === "glow"
                    ? "0 20px 60px -12px rgba(168, 85, 247, 0.15)"
                    : "0 20px 60px -12px rgba(0, 0, 0, 0.4)",
                borderColor:
                  variant === "outlined" || variant === "glow" ? "rgb(168, 85, 247)" : undefined,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                },
              }
            : undefined
        }
        whileTap={onClick ? { scale: 0.98 } : undefined}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 24,
        }}
        {...props}
      >
        {/* Gradient border effect for gradient variant */}
        {variant === "gradient" && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 p-[1px]">
            <div className="absolute inset-[1px] rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/50" />
          </div>
        )}

        {/* Shine effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-nyx-600/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  },
);

Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  ),
);

CardHeader.displayName = "CardHeader";

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx("flex-1", className)} {...props}>
      {children}
    </div>
  ),
);

CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx("flex items-center justify-between pt-4", className)}
      {...props}
    >
      {children}
    </div>
  ),
);

CardFooter.displayName = "CardFooter";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={clsx(
        "text-2xl font-bold tracking-tight text-white",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  ),
);

CardTitle.displayName = "CardTitle";

export interface CardSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardSubtitle = React.forwardRef<HTMLParagraphElement, CardSubtitleProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={clsx(
        "text-sm text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </p>
  ),
);

CardSubtitle.displayName = "CardSubtitle";
