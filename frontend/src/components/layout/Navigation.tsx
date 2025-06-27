import React from 'react'
import { Link, useLocation } from 'react-router-dom'
// Removed unused imports for MVP simplification
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface NavigationProps {
  className?: string
  isMobile?: boolean
  onItemClick?: () => void
}

interface NavItem {
  label: string
  href: string
  description?: string
}

interface NavSection {
  label: string
  items: NavItem[]
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', description: 'Overview of your CDPs and system status' },
  { label: 'My CDPs', href: '/cdp', description: 'Manage your Collateralized Debt Positions' },
  { label: 'System Stats', href: '/system', description: 'System-wide statistics and health metrics' },
  { label: 'AI Portfolio Assistant', href: '/ai-assistant', description: 'Get personalized investment recommendations' },
]

// Removed unimplemented navigation sections for MVP focus
const additionalNavSections: NavSection[] = []

export const Navigation: React.FC<NavigationProps> = ({ 
  className, 
  isMobile = false, 
  onItemClick 
}) => {
  const location = useLocation()

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const navItemClass = (path: string) => clsx(
    'relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900',
    isActive(path)
      ? 'text-purple-200 bg-purple-900/30 shadow-lg shadow-purple-900/20'
      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
  )

  const mobileNavItemClass = (path: string) => clsx(
    'block w-full text-left px-4 py-3 text-base font-medium transition-all duration-200',
    'focus:outline-none focus:bg-gray-800',
    isActive(path)
      ? 'text-purple-200 bg-purple-900/30 border-r-2 border-purple-400'
      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
  )

  const handleNavClick = () => {
    if (onItemClick) {
      onItemClick()
    }
  }

  if (isMobile) {
    return (
      <nav className={clsx('space-y-1', className)} role="navigation" aria-label="Main navigation">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={mobileNavItemClass(item.href)}
            onClick={handleNavClick}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <div>
              <div className="font-medium">{item.label}</div>
              {item.description && (
                <div className="text-xs text-gray-400 mt-1">{item.description}</div>
              )}
            </div>
          </Link>
        ))}
        
        {/* Mobile Additional Sections */}
        {additionalNavSections.map((section) => (
          <div key={section.label} className="pt-4 pb-2">
            <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.label}
            </div>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={mobileNavItemClass(item.href)}
                  onClick={handleNavClick}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <div>
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    )
  }

  return (
    <nav className={clsx('flex items-center space-x-1', className)} role="navigation" aria-label="Main navigation">
      {/* Main Navigation Items */}
      {mainNavItems.map((item) => (
        <motion.div
          key={item.href}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            to={item.href}
            className={navItemClass(item.href)}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            {item.label}
            {isActive(item.href) && (
              <motion.div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 to-purple-400/20 -z-10"
                layoutId="activeNavItem"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            )}
          </Link>
        </motion.div>
      ))}

      {/* Removed dropdown menu for MVP - only core navigation shown */}
    </nav>
  )
}