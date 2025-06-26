import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
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
]

const additionalNavSections: NavSection[] = [
  {
    label: 'Analytics',
    items: [
      { label: 'Protocol Metrics', href: '/analytics/protocol', description: 'Deep dive into protocol performance' },
      { label: 'Market Data', href: '/analytics/market', description: 'Real-time market information' },
    ]
  },
  {
    label: 'Tools',
    items: [
      { label: 'Calculator', href: '/tools/calculator', description: 'CDP risk and yield calculator' },
      { label: 'Documentation', href: '/docs', description: 'Protocol documentation and guides' },
    ]
  }
]

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

      {/* Dropdown Menu for Additional Items */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className={clsx(
              'flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              'text-gray-300 hover:text-white hover:bg-gray-800/50',
              'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900'
            )}
            aria-label="More navigation options"
          >
            <span>More</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={clsx(
              'min-w-[280px] bg-gray-900/95 backdrop-blur-lg border border-gray-700',
              'rounded-xl shadow-2xl shadow-black/50 p-2',
              'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
            )}
            sideOffset={8}
            align="end"
          >
            {additionalNavSections.map((section, sectionIndex) => (
              <div key={section.label}>
                {sectionIndex > 0 && <DropdownMenu.Separator className="h-px bg-gray-700 my-2" />}
                
                <div className="px-2 py-1">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {section.label}
                  </div>
                  
                  {section.items.map((item) => (
                    <DropdownMenu.Item key={item.href} asChild>
                      <Link
                        to={item.href}
                        className={clsx(
                          'block w-full px-3 py-2 text-sm rounded-lg transition-all duration-200',
                          'focus:outline-none focus:bg-purple-900/30 focus:text-purple-200',
                          'hover:bg-gray-800/50 hover:text-white',
                          isActive(item.href) 
                            ? 'text-purple-200 bg-purple-900/20' 
                            : 'text-gray-300'
                        )}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                      >
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                        )}
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </div>
              </div>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </nav>
  )
}