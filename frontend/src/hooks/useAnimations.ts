import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useInView } from "react-intersection-observer";

/**
 * Animation configuration interface
 */
export interface AnimationConfig {
  /** Animation type */
  type:
    | "fadeIn"
    | "slideUp"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "scaleIn"
    | "custom";
  /** Animation duration in milliseconds */
  duration?: number;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Animation easing function */
  easing?: string;
  /** Threshold for intersection observer (0-1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Whether animation should trigger only once */
  triggerOnce?: boolean;
  /** Custom CSS classes to apply */
  customClasses?: string;
  /** Whether to disable animations on reduced motion preference */
  respectReducedMotion?: boolean;
}

/**
 * Staggered animation configuration
 */
export interface StaggerConfig {
  /** Base delay between elements */
  baseDelay: number;
  /** Increment delay for each subsequent element */
  increment: number;
  /** Maximum delay to prevent overly long waits */
  maxDelay?: number;
}

/**
 * Animation variants for common use cases
 */
export const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  scaleOut: {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 0, scale: 1.05 },
    exit: { opacity: 0, scale: 0.95 },
  },
};

/**
 * Default animation configuration
 */
const defaultConfig: Required<AnimationConfig> = {
  type: "fadeIn",
  duration: 300,
  delay: 0,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  threshold: 0.1,
  rootMargin: "0px",
  triggerOnce: true,
  customClasses: "",
  respectReducedMotion: true,
};

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Get animation CSS classes based on type
 */
const getAnimationClasses = (
  type: AnimationConfig["type"],
  isVisible: boolean,
): string => {
  const baseClasses = "transition-all-normal";

  switch (type) {
    case "fadeIn":
      return `${baseClasses} ${isVisible ? "animate-fade-in" : "opacity-0"}`;
    case "slideUp":
      return `${baseClasses} ${isVisible ? "animate-slide-up" : "opacity-0 translate-y-5"}`;
    case "slideDown":
      return `${baseClasses} ${isVisible ? "animate-slide-down" : "opacity-0 -translate-y-5"}`;
    case "slideLeft":
      return `${baseClasses} ${isVisible ? "animate-slide-left" : "opacity-0 translate-x-5"}`;
    case "slideRight":
      return `${baseClasses} ${isVisible ? "animate-slide-right" : "opacity-0 -translate-x-5"}`;
    case "scaleIn":
      return `${baseClasses} ${isVisible ? "animate-scale-in" : "opacity-0 scale-95"}`;
    default:
      return baseClasses;
  }
};

/**
 * Custom hook for scroll-triggered animations
 */
export const useScrollAnimation = (config: Partial<AnimationConfig> = {}) => {
  const fullConfig = { ...defaultConfig, ...config };
  const shouldAnimate =
    !fullConfig.respectReducedMotion || !prefersReducedMotion();

  const { ref, inView } = useInView({
    threshold: fullConfig.threshold,
    rootMargin: fullConfig.rootMargin,
    triggerOnce: fullConfig.triggerOnce,
  });

  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (inView && !hasAnimated) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        if (fullConfig.triggerOnce) {
          setHasAnimated(true);
        }
      }, fullConfig.delay);

      return () => clearTimeout(timer);
    } else if (!inView && !fullConfig.triggerOnce) {
      setIsVisible(false);
    }
    
    return () => {}; // Always return cleanup function
  }, [inView, hasAnimated, fullConfig.delay, fullConfig.triggerOnce]);

  const animationClasses = useMemo(() => {
    if (!shouldAnimate) return "";

    const baseClasses = getAnimationClasses(fullConfig.type, isVisible);
    return `${baseClasses} ${fullConfig.customClasses}`.trim();
  }, [shouldAnimate, fullConfig.type, fullConfig.customClasses, isVisible]);

  const animationStyle = useMemo(
    () => ({
      animationDuration: `${fullConfig.duration}ms`,
      animationTimingFunction: fullConfig.easing,
      animationDelay: `${fullConfig.delay}ms`,
    }),
    [fullConfig.duration, fullConfig.easing, fullConfig.delay],
  );

  return {
    ref,
    inView,
    isVisible,
    animationClasses,
    animationStyle,
    shouldAnimate,
  };
};

/**
 * Custom hook for staggered animations
 */
export const useStaggeredAnimation = (
  count: number,
  config: Partial<AnimationConfig> = {},
  staggerConfig: StaggerConfig = { baseDelay: 100, increment: 100 },
) => {
  const fullConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  const shouldAnimate =
    !fullConfig.respectReducedMotion || !prefersReducedMotion();

  const { ref, inView } = useInView({
    threshold: fullConfig.threshold,
    rootMargin: fullConfig.rootMargin,
    triggerOnce: fullConfig.triggerOnce,
  });

  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(count).fill(false),
  );

  useEffect(() => {
    if (inView && shouldAnimate) {
      const timers: NodeJS.Timeout[] = [];

      for (let i = 0; i < count; i++) {
        const delay = Math.min(
          staggerConfig.baseDelay + i * staggerConfig.increment,
          staggerConfig.maxDelay || Infinity,
        );

        const timer = setTimeout(() => {
          setVisibleItems((prev) => {
            const newState = [...prev];
            newState[i] = true;
            return newState;
          });
        }, delay);

        timers.push(timer);
      }

      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
    } else if (!inView && !fullConfig.triggerOnce) {
      setVisibleItems(new Array(count).fill(false));
    }
    
    return () => {}; // Always return cleanup function
  }, [inView, count, shouldAnimate, staggerConfig, fullConfig.triggerOnce]);

  const getItemProps = useCallback(
    (index: number) => {
      const isVisible = visibleItems[index] ?? false;
      const animationClasses = shouldAnimate
        ? getAnimationClasses(fullConfig.type, isVisible)
        : "";

      const animationStyle = {
        animationDuration: `${fullConfig.duration}ms`,
        animationTimingFunction: fullConfig.easing,
      };

      return {
        className: `${animationClasses} ${fullConfig.customClasses}`.trim(),
        style: shouldAnimate ? animationStyle : {},
        "data-stagger-index": index,
      };
    },
    [visibleItems, shouldAnimate, fullConfig],
  );

  return {
    ref,
    inView,
    visibleItems,
    getItemProps,
    shouldAnimate,
  };
};

/**
 * Custom hook for performance-optimized animations
 */
export const usePerformantAnimation = (
  config: Partial<AnimationConfig> = {},
) => {
  const elementRef = useRef<HTMLElement>(null);
  const animationFrameRef = useRef<number>();
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    setIsAnimating(true);

    // Add will-change property for better performance
    element.style.willChange = "transform, opacity";

    // Use requestAnimationFrame for smooth animations
    const animate = () => {
      // Animation logic here
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Clean up after animation
    setTimeout(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      element.style.willChange = "auto";
      setIsAnimating(false);
    }, config.duration || defaultConfig.duration);
  }, [config.duration]);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (elementRef.current) {
      elementRef.current.style.willChange = "auto";
    }
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    ref: elementRef,
    isAnimating,
    startAnimation,
    stopAnimation,
  };
};

/**
 * Custom hook for hover animations
 */
export const useHoverAnimation = (
  hoverConfig: Partial<AnimationConfig> = {},
  exitConfig: Partial<AnimationConfig> = {},
) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldAnimate = !prefersReducedMotion();
  
  const fullHoverConfig = { ...defaultConfig, ...hoverConfig };
  const fullExitConfig = { ...defaultConfig, ...exitConfig };

  const hoverProps = useMemo(
    () => ({
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      className: shouldAnimate ? (isHovered ? "animate-scale-in" : "") : "",
      style: shouldAnimate
        ? {
            transition: `all ${fullHoverConfig.duration}ms ${fullHoverConfig.easing}`,
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }
        : {},
    }),
    [isHovered, shouldAnimate, fullHoverConfig.duration, fullHoverConfig.easing],
  );

  return {
    isHovered,
    hoverProps,
    shouldAnimate,
    fullHoverConfig,
    fullExitConfig,
  };
};

/**
 * Custom hook for page transitions
 */
export const usePageTransition = (config: Partial<AnimationConfig> = {}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const fullConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, fullConfig.duration);

    return () => clearTimeout(timer);
  }, [fullConfig.duration]);

  const triggerExit = useCallback(() => {
    setIsExiting(true);
    return new Promise<void>((resolve) => {
      setTimeout(resolve, fullConfig.duration);
    });
  }, [fullConfig.duration]);

  const pageClasses = useMemo(() => {
    if (isEntering) return "page-enter page-enter-active";
    if (isExiting) return "page-exit page-exit-active";
    return "";
  }, [isEntering, isExiting]);

  return {
    isExiting,
    isEntering,
    triggerExit,
    pageClasses,
  };
};

/**
 * Utility function to create custom animation sequences
 */
export const createAnimationSequence = (
  animations: Array<{
    element: HTMLElement;
    config: Partial<AnimationConfig>;
    delay?: number;
  }>,
) => {
  const promises = animations.map(({ element, config, delay = 0 }) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const animationConfig = { ...defaultConfig, ...config };
        element.style.transition = `all ${animationConfig.duration}ms ${animationConfig.easing}`;

        // Apply animation based on type
        switch (animationConfig.type) {
          case "fadeIn":
            element.style.opacity = "1";
            break;
          case "slideUp":
            element.style.transform = "translateY(0)";
            element.style.opacity = "1";
            break;
          case "scaleIn":
            element.style.transform = "scale(1)";
            element.style.opacity = "1";
            break;
        }

        setTimeout(resolve, animationConfig.duration);
      }, delay);
    });
  });

  return Promise.all(promises);
};

/**
 * Utility function to batch DOM operations for better performance
 */
export const batchAnimations = (callback: () => void) => {
  // Use RAF to batch DOM operations
  requestAnimationFrame(() => {
    callback();
  });
};

/**
 * Export animation utilities
 */
export const animationUtils = {
  prefersReducedMotion,
  getAnimationClasses,
  createAnimationSequence,
  batchAnimations,
  animationVariants,
};

export default useScrollAnimation;
