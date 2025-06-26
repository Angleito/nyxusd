# NYXUSD Animation System

A comprehensive animation system designed for the NYXUSD frontend with midnight-themed aesthetics, optimized for performance and accessibility.

## Features

### 🎨 Core Animation Capabilities
- **Keyframe Animations**: Gradient shifts, floating effects, glow animations
- **Smooth Transitions**: Color, transform, shadow, and opacity transitions
- **Loading States**: Skeleton loaders, spinners, progress bars with shimmer effects
- **Micro-interactions**: Button hover effects, card animations, form interactions
- **Page Transitions**: Smooth route changes and modal animations

### ⚡ Performance Optimizations
- Hardware acceleration for smooth 60fps animations
- `will-change` properties for optimal layer management
- RequestAnimationFrame for performance-critical animations
- Reduced motion support for accessibility
- Efficient CSS-based animations with minimal JavaScript

### 🌙 Midnight Theme Integration
- Custom color variables for consistent theming
- Gradient animations with purple/nyx color scheme
- Glass morphism effects with backdrop blur
- Glow effects with custom shadow configurations

## Quick Start

### 1. Import the Animation System

```tsx
// Import styles (already included in main index.css)
import '../styles/animations.css';

// Import components
import {
  InteractiveButton,
  AnimatedCard,
  InteractiveInput,
  PageTransition,
  Spinner,
  LoadingButton
} from '../components/ui';

// Import hooks
import {
  useScrollAnimation,
  useStaggeredAnimation,
  useHoverAnimation
} from '../hooks/useAnimations';
```

### 2. Basic Usage Examples

#### Interactive Buttons
```tsx
<InteractiveButton 
  variant="primary" 
  hoverEffect="glow" 
  size="lg"
>
  Click Me
</InteractiveButton>
```

#### Animated Cards
```tsx
<AnimatedCard 
  variant="midnight" 
  hoverEffect="float"
  scrollAnimation="slideUp"
  animationDelay={200}
>
  <h3>Card Content</h3>
  <p>This card animates on scroll and hover</p>
</AnimatedCard>
```

#### Loading States
```tsx
<LoadingButton
  loading={isLoading}
  variant="primary"
  loadingText="Processing..."
>
  Submit
</LoadingButton>

<Spinner size="lg" variant="primary" />
<ProgressBar value={progress} showLabel />
```

#### Scroll-Triggered Animations
```tsx
const { ref, animationClasses, isVisible } = useScrollAnimation({
  type: 'slideUp',
  duration: 500,
  delay: 200,
  threshold: 0.1
});

return (
  <div ref={ref} className={animationClasses}>
    Content that animates when scrolled into view
  </div>
);
```

## Component API Reference

### InteractiveButton
```tsx
interface InteractiveButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

### AnimatedCard
```tsx
interface AnimatedCardProps {
  variant?: 'default' | 'midnight' | 'nyx' | 'glass';
  hoverEffect?: 'float' | 'glow' | 'scale' | 'none';
  scrollAnimation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn';
  animationDelay?: number;
  hoverBorder?: boolean;
}
```

### InteractiveInput
```tsx
interface InteractiveInputProps {
  variant?: 'default' | 'glass' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  focusEffect?: 'glow' | 'scale' | 'slide' | 'none';
  showCharCount?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

## Animation Hooks

### useScrollAnimation
Triggers animations when elements enter the viewport.

```tsx
const config = {
  type: 'fadeIn',           // Animation type
  duration: 300,            // Duration in ms
  delay: 0,                 // Delay in ms
  threshold: 0.1,           // Intersection threshold
  triggerOnce: true,        // Animate only once
  respectReducedMotion: true // Respect user preferences
};

const { ref, inView, isVisible, animationClasses } = useScrollAnimation(config);
```

### useStaggeredAnimation
Creates staggered animations for lists of elements.

```tsx
const staggerConfig = {
  baseDelay: 100,           // Base delay
  increment: 100,           // Delay increment per item
  maxDelay: 1000           // Maximum delay
};

const { ref, getItemProps } = useStaggeredAnimation(
  itemCount, 
  animationConfig, 
  staggerConfig
);

// Usage in render
{items.map((item, index) => (
  <div key={index} {...getItemProps(index)}>
    {item}
  </div>
))}
```

### useHoverAnimation
Provides hover state management with animations.

```tsx
const { isHovered, hoverProps } = useHoverAnimation();

return <div {...hoverProps}>Hover me!</div>;
```

## CSS Animation Classes

### Keyframe Animations
- `animate-gradient-shift` - Animated gradient background
- `animate-gradient-pulse` - Pulsing gradient effect
- `animate-float` - Floating up/down motion
- `animate-glow-pulse` - Pulsing glow effect
- `animate-shimmer` - Shimmer loading effect

### Entrance Animations
- `animate-fade-in` - Fade in from transparent
- `animate-slide-up` - Slide up from bottom
- `animate-slide-down` - Slide down from top
- `animate-scale-in` - Scale in from smaller size

### Hover Effects
- `btn-hover-lift` - Lift button on hover
- `btn-hover-glow` - Glow effect on hover
- `card-hover-float` - Float card on hover
- `input-focus-glow` - Glow input on focus

### Staggered Classes
- `animate-stagger-1` through `animate-stagger-5` - Staggered delays

## Custom CSS Variables

The animation system uses CSS custom properties for consistency:

```css
:root {
  /* Animation Durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  /* Animation Easings */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Colors */
  --gradient-primary: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6b21a8 100%);
  --shadow-glow: 0 0 20px rgba(147, 51, 234, 0.3);
}
```

## Accessibility Features

### Reduced Motion Support
The system automatically respects user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Management
- Visible focus indicators
- Keyboard navigation support
- Screen reader compatibility
- ARIA labels on loading states

## Performance Best Practices

### 1. Hardware Acceleration
Elements that animate frequently use hardware acceleration:

```css
.hardware-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### 2. Will-Change Property
Critical animations use `will-change` for optimization:

```css
.will-change-transform {
  will-change: transform;
}
```

### 3. Efficient Selectors
CSS animations use efficient selectors and avoid layout thrashing.

### 4. RequestAnimationFrame
JavaScript animations use RAF for smooth performance:

```tsx
const animate = (timestamp: number) => {
  // Animation logic
  requestAnimationFrame(animate);
};
```

## Troubleshooting

### Common Issues

1. **Animations not appearing**: Check if `animations.css` is imported
2. **Poor performance**: Ensure hardware acceleration is enabled
3. **Accessibility issues**: Verify reduced motion preferences are respected
4. **Staggered animations out of sync**: Check delay calculations

### Debugging Tips

1. Use browser DevTools Performance tab
2. Check for layout thrashing in animations
3. Verify CSS custom properties are defined
4. Test with reduced motion preferences

## Examples

See `src/components/examples/AnimationShowcase.tsx` for comprehensive usage examples of all animation features.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

All animations gracefully degrade in older browsers.