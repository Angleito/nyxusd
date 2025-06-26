# Enhanced System Statistics Components

This directory contains the enhanced visual dashboard components for system statistics with data visualization capabilities.

## Components

### `ModernSystemStats.tsx`
- **Purpose**: Main visual dashboard component with charts and data visualization
- **Features**:
  - Interactive donut chart for CDP risk distribution
  - Line chart with gradient fills for TVL and supply trends
  - Horizontal bar chart for collateral asset breakdown
  - Enhanced privacy features section with visual elements
  - Real-time data updates with smooth animations
  - Dark theme integration with NYX design system

### `MetricsGrid.tsx`
- **Purpose**: Grid layout for key system metrics with animated counters
- **Features**:
  - Animated number counters with easing effects
  - Progress bars for ratios and percentages
  - Real-time status indicators
  - Responsive grid layout
  - Interactive hover effects

## Integration

### Basic Usage

```typescript
import { ModernSystemStats } from './components/stats/ModernSystemStats'

// Replace the original SystemStats component
function App() {
  return (
    <Routes>
      <Route path="/system" element={<ModernSystemStats />} />
    </Routes>
  )
}
```

### Individual Component Usage

```typescript
import { MetricsGrid } from './components/stats/MetricsGrid'

// Use MetricsGrid separately
<MetricsGrid 
  totalTVL={totalTVL}
  totalSupply={totalSupply}
  collateralizationRatio={collateralizationRatio}
  totalCDPs={totalCDPs}
  systemStats={systemStats}
/>
```

## Data Requirements

The components expect the same data structure as the original `SystemStats` component:

- `systemStats`: System-wide statistics including TVL, supply, collateralization ratio, etc.
- `cdpData`: CDP-specific data including health factors and risk metrics

## Styling

Components use the existing NYX theme system:
- CSS custom properties from `theme.css`
- Card components using `.card` class
- Consistent spacing and color schemes
- Dark theme optimized tooltips and legends

## Charts and Visualization

### Recharts Integration
- Uses Recharts library for data visualization
- Responsive charts that adapt to container size
- Consistent color palette matching NYX theme
- Interactive tooltips with custom styling

### Chart Types
1. **Risk Distribution**: Donut chart showing CDP health distribution
2. **TVL Trends**: Area chart with gradient fills for historical data
3. **Collateral Breakdown**: Horizontal bar chart for asset distribution

## Performance

- Optimized rendering with React.memo where appropriate
- Smooth animations using CSS transitions and React state
- Lazy loading for chart components
- Efficient data processing and memoization

## Accessibility

- WCAG AA compliant color contrast
- Keyboard navigation support
- Screen reader friendly chart labels
- Focus management for interactive elements

## Migration from Original SystemStats

1. Import the new component:
   ```typescript
   import { ModernSystemStats } from './components/stats/ModernSystemStats'
   ```

2. Replace in routing:
   ```typescript
   // Before
   <Route path="/system" element={<SystemStats />} />
   
   // After  
   <Route path="/system" element={<ModernSystemStats />} />
   ```

3. All existing API integrations and data fetching remain unchanged

## Development

### Adding New Charts

1. Add chart component to `ModernSystemStats.tsx`
2. Use existing color constants and theme variables
3. Apply consistent tooltip styling
4. Ensure responsive design

### Customizing Metrics

1. Modify `MetricsGrid.tsx` for new metric cards
2. Use `AnimatedCounter` component for numbers
3. Apply `ProgressBar` component for ratios
4. Follow existing card layout patterns

## Dependencies

- `recharts`: ^2.7.2 (already installed)
- `react-query`: ^3.39.3 (for data fetching)
- Existing project dependencies (React, TypeScript, Tailwind CSS)