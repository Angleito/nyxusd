import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { useScrollAnimation } from "../../hooks/useAnimations";

export interface AnimatedCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: "default" | "midnight" | "nyx" | "glass";
  /** Hover animation type */
  hoverEffect?: "float" | "glow" | "scale" | "none";
  /** Scroll animation type */
  scrollAnimation?:
    | "fadeIn"
    | "slideUp"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "scaleIn"
    | "none";
  /** Animation delay in milliseconds */
  animationDelay?: number;
  /** Whether to show border on hover */
  hoverBorder?: boolean;
  /** Custom className */
  className?: string;
  /** Children content */
  children: React.ReactNode;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    {
      variant = "default",
      hoverEffect = "float",
      scrollAnimation = "fadeIn",
      animationDelay = 0,
      hoverBorder = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const {
      ref: scrollRef,
      animationClasses,
      animationStyle,
    } = useScrollAnimation({
      type: scrollAnimation === "none" ? "fadeIn" : scrollAnimation,
      delay: animationDelay,
      duration: 500,
      threshold: 0.1,
    });

    const baseClasses = [
      "relative overflow-hidden transition-all-normal",
      "focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2",
    ];

    const variantClasses = {
      default: ["card"],
      midnight: ["card-midnight"],
      nyx: ["card-nyx"],
      glass: ["glass rounded-xl p-6"],
    };

    const hoverClasses = {
      float: "card-hover-float",
      glow: "card-hover-glow",
      scale: "card-hover-scale",
      none: "",
    };

    const borderClasses = hoverBorder
      ? [
          "border-2 border-transparent",
          "hover:border-purple-500/30",
          "transition-colors duration-300",
        ]
      : [];

    // Combine refs
    const combinedRef = (element: HTMLDivElement | null) => {
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
      if (element) {
        scrollRef(element);
      }
    };

    return (
      <div
        ref={combinedRef}
        className={cn(
          baseClasses,
          variantClasses[variant],
          hoverEffect !== "none" && hoverClasses[hoverEffect],
          borderClasses,
          scrollAnimation !== "none" && animationClasses,
          className,
        )}
        style={scrollAnimation !== "none" ? animationStyle : undefined}
        {...props}
      >
        {/* Animated border overlay */}
        {hoverBorder && (
          <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-gradient-x" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Subtle background pattern for enhanced visual appeal */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
        </div>
      </div>
    );
  },
);

AnimatedCard.displayName = "AnimatedCard";

export default AnimatedCard;
