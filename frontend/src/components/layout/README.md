# Modern Layout Components

This directory contains the modernized header and navigation components for the NYXUSD application.

## Components

### ModernHeader
A sleek, modern header component with:
- Midnight theme integration using CSS custom properties
- Prominent NYXUSD branding with gradient logo
- Responsive mobile hamburger menu with smooth animations
- Backdrop blur effect that intensifies on scroll
- Protocol status indicator
- Keyboard navigation support

### Navigation
A clean navigation component with:
- Route highlighting with smooth animations
- Dropdown menus using Radix UI
- Mobile-responsive design
- Active state animations using Framer Motion
- Accessible keyboard navigation

## Usage

### Basic Usage
```tsx
import { ModernHeader } from './components/layout'

function App() {
  return (
    <div className="min-h-screen theme-midnight">
      <ModernHeader />
      {/* Your app content */}
    </div>
  )
}
```

### Standalone Navigation
```tsx
import { Navigation } from './components/layout'

function MyComponent() {
  return (
    <div>
      <Navigation />
      {/* Desktop navigation */}
      
      <Navigation isMobile onItemClick={() => closeMobileMenu()} />
      {/* Mobile navigation */}
    </div>
  )
}
```

## Integration Notes

### Replacing the Old Header
To replace the existing Header component:

1. In `App.tsx`, change:
```tsx
import { Header } from './components/Header'
// to
import { ModernHeader } from './components/layout'
```

2. Update the JSX:
```tsx
<Header />
// to
<ModernHeader />
```

### CSS Dependencies
The components rely on:
- Tailwind CSS classes
- CSS custom properties from `styles/theme.css`
- Framer Motion for animations
- Radix UI for accessible components

### Mobile Responsiveness
- Desktop: Full navigation with dropdown menus
- Tablet: Collapsed navigation with hamburger menu
- Mobile: Slide-out side panel with full navigation

### Accessibility Features
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast support

### Animation Features
- Smooth hover animations
- Active state transitions
- Mobile menu slide animations
- Backdrop blur effects
- Layout animations for active states

## Customization

### Theme Integration
Components use CSS custom properties from the theme system:
- `--nyx-primary` for accent colors
- `--surface-*` for background colors
- `--text-*` for text colors
- `--shadow-*` for drop shadows

### Adding New Navigation Items
Edit the `mainNavItems` and `additionalNavSections` arrays in `Navigation.tsx`:

```tsx
const mainNavItems: NavItem[] = [
  // existing items...
  { label: 'New Page', href: '/new-page', description: 'Description of new page' },
]
```

### Customizing Animations
Framer Motion animations can be customized by modifying the motion configuration:

```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
```