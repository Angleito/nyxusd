import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Navigation } from "./Navigation";

export const ModernHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for backdrop blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: Event) => {
      if ((e as KeyboardEvent).key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          "border-b border-gray-800/50",
          isScrolled
            ? "bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-black/20"
            : "bg-gray-900/60 backdrop-blur-lg",
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo and Branding */}
            <motion.div
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                to="/"
                className="group focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
                aria-label="NyxUSD Home"
              >
                <div className="flex items-center space-x-3">
                  {/* Logo Icon */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/30">
                      <span className="text-foreground font-bold text-lg">
                        N
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
                  </div>

                  {/* Brand Text */}
                  <div className="hidden sm:block">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      NyxUSD
                    </h1>
                    <p className="text-xs text-gray-400 -mt-1 group-hover:text-gray-300 transition-colors duration-200">
                      Privacy-First Stablecoin
                    </p>
                  </div>
                </div>
              </Link>

              {/* Protocol Badge */}
              <motion.div
                className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-800/60 rounded-full border border-gray-700/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-300 font-medium">
                  Midnight Protocol
                </span>
              </motion.div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <Navigation />
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className={clsx(
                "lg:hidden p-2 rounded-lg transition-all duration-200",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                "focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900",
              )}
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Bars3Icon className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-md flex items-center justify-center">
                      <span className="text-foreground font-bold text-sm">
                        N
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        NyxUSD
                      </h2>
                      <p className="text-xs text-gray-400 -mt-1">Navigation</p>
                    </div>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label="Close navigation menu"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                  <Navigation
                    isMobile={true}
                    onItemClick={closeMobileMenu}
                    className="px-2"
                  />
                </div>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-gray-800">
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Connected to Midnight Protocol</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-20" />
    </>
  );
};
