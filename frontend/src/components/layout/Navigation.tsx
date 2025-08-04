import React from "react";
import { Link, useLocation } from "react-router-dom";
// Removed unused imports for MVP simplification
import { motion } from "framer-motion";
import clsx from "clsx";

interface NavigationProps {
  className?: string;
  isMobile?: boolean;
  onItemClick?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    description: "Overview of your CDPs and system status",
  },
  {
    label: "Pools",
    href: "/pools",
    description: "Choose Safe, Medium, or High Risk pool",
  },
  {
    label: "My CDPs",
    href: "/cdp",
    description: "Manage your Collateralized Debt Positions",
  },
  {
    label: "System Stats",
    href: "/system",
    description: "System-wide statistics and health metrics",
  },
  {
    label: "Ape In",
    href: "/ai-assistant",
    description: "Chat with Nyx-chan to get started",
  },
  {
    label: "White Paper",
    href: "/whitepaper",
    description: "Read our comprehensive technical documentation",
  },
  {
    label: "About Us",
    href: "/about",
    description: "Learn more about our platform and team",
  },
  {
    label: "Contact",
    href: "/contact",
    description: "Get in touch with Angel",
  },
];

// Removed unimplemented navigation sections for MVP focus
const additionalNavSections: NavSection[] = [];

export const Navigation: React.FC<NavigationProps> = ({
  className,
  isMobile = false,
  onItemClick,
}) => {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navItemClass = (path: string) =>
    clsx(
      "relative inline-flex items-center px-3 py-2 rounded-lg nyx-body transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-purple-400 whitespace-nowrap min-h-[36px]",
      isActive(path)
        ? "nyx-glass border border-purple-500/30 text-purple-200"
        : "text-gray-300 hover:text-white hover:nyx-glass",
    );

  const mobileNavItemClass = (path: string) =>
    clsx(
      "block w-full text-left px-4 py-3 nyx-body transition-all duration-200 rounded-lg mx-2",
      "focus:outline-none",
      isActive(path)
        ? "nyx-glass border border-purple-500/30 text-purple-200"
        : "text-gray-300 hover:text-white hover:nyx-glass",
    );

  const handleNavClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  if (isMobile) {
    return (
      <nav
        className={clsx("space-y-1", className)}
        role="navigation"
        aria-label="Main navigation"
      >
        {mainNavItems.map((item) =>
          item.external ? (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={mobileNavItemClass(item.href)}
              onClick={handleNavClick}
            >
              <div>
                <div className="font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-400 mt-1">
                    {item.description}
                  </div>
                )}
              </div>
            </a>
          ) : (
            <Link
              key={item.href}
              to={item.href}
              className={mobileNavItemClass(item.href)}
              onClick={handleNavClick}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <div>
                <div className="font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-400 mt-1">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          )
        )}

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
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <div>
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-gray-400 mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav
      className={clsx("flex items-center gap-1", className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Main Navigation Items */}
      {mainNavItems.map((item) => (
        <motion.div
          key={item.href}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-block"
        >
          {item.external ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={navItemClass(item.href)}
            >
              <span className="relative z-10">{item.label}</span>
            </a>
          ) : (
            <Link
              to={item.href}
              className={navItemClass(item.href)}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span className="relative z-10">{item.label}</span>
              {isActive(item.href) && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 to-purple-400/20"
                  layoutId="activeNavItem"
                  initial={false}
                  transition={{
                    type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
              )}
            </Link>
          )}
        </motion.div>
      ))}

      {/* Removed dropdown menu for MVP - only core navigation shown */}
    </nav>
  );
};
