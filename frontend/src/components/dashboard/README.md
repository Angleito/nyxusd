# Dashboard Components

This directory contains the modernized dashboard components for the NYXUSD redesign project.

## Components Overview

### Main Dashboard Components

1. **ModernDashboard** - The new modern card-based dashboard layout
   - Features masonry-style layout with varying card heights
   - Responsive design across all device sizes
   - Smooth animations and hover effects
   - Preserves all existing API functionality

2. **DashboardWithHero** - Alternative dashboard with hero section
   - Dark theme with midnight design
   - Includes animated hero section
   - Full-featured dashboard below hero

3. **HeroSection** - Animated hero section component
   - Beautiful animations using Framer Motion
   - Particle effects and gradients
   - Zero-knowledge theme visualization

### Individual Card Components

4. **WelcomeCard** - Personalized greeting and quick actions
   - Gradient background with decorative elements
   - Quick action buttons for common tasks
   - Responsive layout

5. **SystemHealthCard** - Real-time system metrics
   - Visual health indicators with color coding
   - Stats grid showing key metrics
   - Supported collaterals section
   - Progress bars for system ratios

6. **OraclePricesCard** - Live price feeds with trend indicators
   - Real-time price updates with visual indicators
   - Mock trend data with percentage changes
   - Asset icons and formatting
   - Refresh functionality placeholder
   - Chart section placeholder

7. **RecentActivityCard** - Transaction history timeline
   - Timeline view of recent activities
   - Status badges (confirmed, pending, failed)
   - Activity type icons and descriptions
   - Mock transaction data for demonstration
   - Load more functionality

8. **StatsCard** - Reusable statistics card component
   - Supports loading states
   - Trend indicators with arrows
   - Hover animations
   - Flexible icon support

## Features

### Preserved Functionality
- All existing API calls maintained (`fetchSystemStats`, `fetchOraclePrices`)
- React Query patterns preserved with proper caching
- Error handling and loading states
- Original data processing logic

### New Features
- Modern card-based layout
- Responsive masonry grid
- Smooth hover animations and transitions
- Visual health indicators
- Mock trend data (ready for real historical data)
- Improved loading states with skeleton UI
- Better error handling with retry functionality

### Responsive Design
- Mobile-first approach
- Breakpoint-aware layouts
- Flexible grid system
- Touch-friendly interactions

## Usage

### Using ModernDashboard (Recommended)
```tsx
import { ModernDashboard } from './components/dashboard'

// In your router or main component
<ModernDashboard />
```

### Using Individual Components
```tsx
import { 
  WelcomeCard, 
  SystemHealthCard, 
  OraclePricesCard,
  RecentActivityCard,
  StatsCard 
} from './components/dashboard'

// Custom layout
<div className="grid gap-6">
  <WelcomeCard />
  <SystemHealthCard systemStats={stats} isLoading={loading} />
  <OraclePricesCard prices={prices} isLoading={pricesLoading} />
</div>
```

## Integration Notes

### API Integration
- Components use existing `fetchSystemStats` and `fetchOraclePrices` functions
- React Query hooks preserved with enhanced caching strategies
- Error boundaries and fallback states included

### Styling
- Uses Tailwind CSS for all styling
- Consistent color scheme with purple/indigo theme
- Responsive breakpoints: sm, md, lg, xl
- Dark mode ready (can be extended)

### Performance
- Optimized re-renders with proper React Query configuration
- Skeleton loading states to prevent layout shifts
- Efficient animations using CSS transforms
- Lazy loading ready for additional features

## Migration Path

To migrate from the old Dashboard to ModernDashboard:

1. Replace `<Dashboard />` with `<ModernDashboard />`
2. All existing functionality is preserved
3. No breaking changes to API or data flow
4. Enhanced UI with modern card layout

## Future Enhancements

### Ready for Integration
- Real historical price data for trends
- User authentication for personalized welcome
- Real transaction history API
- Portfolio analytics integration
- Push notifications for price alerts

### Extensibility
- Easy to add new card types
- Configurable layouts
- Theme customization
- Dashboard personalization

## Dependencies

- React Query for data fetching
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for HeroSection animations (optional)
- Heroicons for UI icons (DashboardWithHero)

All components are TypeScript-enabled with proper type definitions exported.