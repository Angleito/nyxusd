import React, { useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { usePageTransition } from "../../hooks/useAnimations";

export interface PageTransitionProps {
  /** Children to animate */
  children: React.ReactNode;
  /** Transition type */
  type?: "fade" | "slide" | "scale" | "blur";
  /** Transition duration in milliseconds */
  duration?: number;
  /** Whether page is currently transitioning */
  isTransitioning?: boolean;
  /** Custom className */
  className?: string;
  /** Callback when transition completes */
  onTransitionComplete?: () => void;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = "fade",
  duration = 300,
  isTransitioning = false,
  className,
  onTransitionComplete,
}) => {
  const { pageClasses, isEntering, isExiting } = usePageTransition({
    type: "fadeIn",
    duration,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isEntering && !isExiting && onTransitionComplete) {
      onTransitionComplete();
    }
  }, [isEntering, isExiting, onTransitionComplete]);

  const transitionClasses = {
    fade: {
      enter: "opacity-0",
      enterActive: "opacity-100 transition-opacity duration-300 ease-out",
      exit: "opacity-100",
      exitActive: "opacity-0 transition-opacity duration-200 ease-in",
    },
    slide: {
      enter: "transform translate-y-4 opacity-0",
      enterActive:
        "transform translate-y-0 opacity-100 transition-all duration-300 ease-out",
      exit: "transform translate-y-0 opacity-100",
      exitActive:
        "transform -translate-y-4 opacity-0 transition-all duration-200 ease-in",
    },
    scale: {
      enter: "transform scale-95 opacity-0",
      enterActive:
        "transform scale-100 opacity-100 transition-all duration-300 ease-out",
      exit: "transform scale-100 opacity-100",
      exitActive:
        "transform scale-105 opacity-0 transition-all duration-200 ease-in",
    },
    blur: {
      enter: "blur-sm opacity-0",
      enterActive: "blur-none opacity-100 transition-all duration-300 ease-out",
      exit: "blur-none opacity-100",
      exitActive: "blur-sm opacity-0 transition-all duration-200 ease-in",
    },
  };

  const getCurrentClasses = () => {
    const classes = transitionClasses[type];

    if (isTransitioning || isExiting) {
      return `${classes.exit} ${classes.exitActive}`;
    } else if (isEntering || !mounted) {
      return `${classes.enter} ${classes.enterActive}`;
    }

    return "";
  };

  return (
    <div
      className={cn(
        "min-h-screen",
        getCurrentClasses(),
        pageClasses,
        className,
      )}
    >
      {children}
    </div>
  );
};

/**
 * Route transition wrapper component
 */
export interface RouteTransitionProps {
  /** Current route key for transitions */
  routeKey: string;
  /** Children to animate */
  children: React.ReactNode;
  /** Transition configuration */
  config?: {
    type?: PageTransitionProps["type"];
    duration?: number;
  };
  /** Custom className */
  className?: string;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  routeKey,
  children,
  config = {},
  className,
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentRouteKey, setCurrentRouteKey] = useState(routeKey);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (routeKey !== currentRouteKey) {
      setIsTransitioning(true);

      // Start exit transition
      setTimeout(() => {
        setCurrentRouteKey(routeKey);
        setDisplayChildren(children);
        setIsTransitioning(false);
      }, config.duration || 300);
    }
  }, [routeKey, currentRouteKey, children, config.duration]);

  return (
    <PageTransition
      type={config.type}
      duration={config.duration}
      isTransitioning={isTransitioning}
      className={className}
      onTransitionComplete={() => setIsTransitioning(false)}
    >
      {displayChildren}
    </PageTransition>
  );
};

/**
 * Modal transition component
 */
export interface ModalTransitionProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Children to animate */
  children: React.ReactNode;
  /** Backdrop component */
  backdrop?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Callback when modal starts closing */
  onClose?: () => void;
}

export const ModalTransition: React.FC<ModalTransitionProps> = ({
  isOpen,
  children,
  backdrop,
  className,
  onClose,
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      return () => {}; // Always return cleanup function
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200); // Animation duration

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm",
          isOpen ? "backdrop-enter-active" : "backdrop-exit-active",
        )}
        onClick={onClose}
      >
        {backdrop}
      </div>

      {/* Modal Content */}
      <div
        className={cn(
          "relative z-10 max-w-lg w-full mx-4",
          isOpen ? "modal-enter-active" : "modal-exit-active",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Staggered list transition component
 */
export interface StaggeredListProps {
  /** List items */
  children: React.ReactNode[];
  /** Stagger delay between items in milliseconds */
  staggerDelay?: number;
  /** Animation type for each item */
  itemAnimation?: "slideUp" | "slideDown" | "fadeIn" | "scaleIn";
  /** Custom className for container */
  className?: string;
  /** Custom className for items */
  itemClassName?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 100,
  itemAnimation = "slideUp",
  className,
  itemClassName,
}) => {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(children.length).fill(false),
  );

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    children.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems((prev) => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      }, index * staggerDelay);

      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [children.length, staggerDelay]);

  const getItemClasses = (index: number) => {
    const isVisible = visibleItems[index];
    const baseClasses = "transition-all duration-500 ease-out";

    switch (itemAnimation) {
      case "slideUp":
        return cn(
          baseClasses,
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        );
      case "slideDown":
        return cn(
          baseClasses,
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
        );
      case "fadeIn":
        return cn(baseClasses, isVisible ? "opacity-100" : "opacity-0");
      case "scaleIn":
        return cn(
          baseClasses,
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        );
      default:
        return baseClasses;
    }
  };

  return (
    <div className={className}>
      {children.map((child, index) => (
        <div key={index} className={cn(getItemClasses(index), itemClassName)}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default PageTransition;
