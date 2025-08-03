import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Navigation } from "./Navigation";
import { NyxWalletConnectButton } from "../wallet/NyxWalletConnectButton";
import { useTheme } from "../../contexts/ThemeContext";

interface Chain {
  id: string;
  name: string;
  themeId: string;
  color: string;
  dotColor: string;
}

const chains: Chain[] = [
  { id: "midnight", name: "Midnight Protocol", themeId: "midnight", color: "var(--nyx-success)", dotColor: "var(--nyx-success)" },
  { id: "sui", name: "Sui", themeId: "sui", color: "#4DA2FF", dotColor: "#4DA2FF" },
  { id: "sei", name: "Sei", themeId: "midnight", color: "#DC2626", dotColor: "#DC2626" },
  { id: "ethereum", name: "Ethereum", themeId: "midnight", color: "#8B5CF6", dotColor: "#8B5CF6" },
  { id: "base", name: "Base", themeId: "base", color: "#0052FF", dotColor: "#0052FF" },
];

export const NyxHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);
  const { setTheme, currentTheme, transitionState } = useTheme();

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

  // Close chain dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.chain-selector')) {
        setIsChainDropdownOpen(false);
      }
    };

    if (isChainDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isChainDropdownOpen]);

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
          isScrolled
            ? "nyx-glass-dark border-b border-gray-800/50 shadow-lg"
            : "bg-transparent"
        )}
        style={{
          background: isScrolled 
            ? 'rgba(var(--nyx-cosmic-black-rgb), 0.8)' 
            : 'rgba(var(--nyx-cosmic-black-rgb), 0.3)',
          backdropFilter: 'blur(var(--nyx-blur-lg))',
          WebkitBackdropFilter: 'blur(var(--nyx-blur-lg))'
        }}
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
                  {/* NYX Logo */}
                  <div className="relative">
                    <img 
                      src="/nyx-assets/images/nyx-icon.svg" 
                      alt="NYX" 
                      className="w-12 h-12"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200 blur-xl" />
                  </div>

                  {/* Brand Text */}
                  <div className="hidden sm:block">
                    <h1 className="nyx-heading-2 nyx-text-gradient">
                      NyxUSD
                    </h1>
                    <p className="nyx-body-small" style={{ color: 'var(--nyx-gleam-60)', marginTop: '-4px' }}>
                      wagmi • ngmi • gm
                    </p>
                  </div>
                </div>
              </Link>

              {/* Chain Selector */}
              <motion.div
                className="hidden md:block relative chain-selector"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 nyx-glass rounded-lg hover:border-purple-500/50 transition-all whitespace-nowrap"
                  style={{ 
                    border: '1px solid var(--nyx-void-50)',
                    minHeight: '36px'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: selectedChain.dotColor }} />
                  <span className="nyx-body-small whitespace-nowrap" style={{ color: 'var(--nyx-gleam-70)' }}>
                    {selectedChain.name}
                  </span>
                  <ChevronDownIcon 
                    className={clsx("w-3 h-3 transition-transform flex-shrink-0", isChainDropdownOpen && "rotate-180")}
                    style={{ color: 'var(--nyx-gleam-60)' }}
                  />
                </motion.button>

                {/* Chain Dropdown */}
                <AnimatePresence>
                  {isChainDropdownOpen && (
                    <motion.div
                      className="absolute top-full mt-2 min-w-[200px] nyx-glass-dark rounded-xl shadow-xl z-50 overflow-hidden"
                      style={{ border: '1px solid var(--nyx-void-60)' }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {chains.map((chain, index) => (
                        <motion.button
                          key={chain.name}
                          onClick={() => {
                            setSelectedChain(chain);
                            setIsChainDropdownOpen(false);
                            // Trigger dramatic theme change
                            if (chain.themeId !== currentTheme.id) {
                              setTheme(chain.themeId);
                            }
                          }}
                          className={clsx(
                            "w-full text-left px-4 py-3 flex items-center space-x-3 transition-all",
                            "hover:bg-gray-800/50",
                            selectedChain.name === chain.name && "bg-gray-800/30"
                          )}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={transitionState.isTransitioning}
                        >
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: chain.dotColor }} />
                          <span className="nyx-body-small whitespace-nowrap" style={{ color: 'var(--nyx-gleam-80)' }}>
                            {chain.name}
                          </span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Desktop Navigation and Wallet */}
            <div className="hidden lg:flex items-center gap-6">
              <Navigation className="flex items-center" />
              <div className="flex items-center">
                <NyxWalletConnectButton />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className={clsx(
                "lg:hidden p-2 rounded-lg transition-all duration-200",
                "nyx-glass hover:bg-gray-800/50",
                "focus:outline-none focus:ring-2 focus:ring-purple-400"
              )}
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              whileTap={{ scale: 0.95 }}
              style={{ color: 'var(--nyx-gleam-80)' }}
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
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(var(--nyx-cosmic-black-rgb), 0.8)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm nyx-glass-dark border-l lg:hidden"
              style={{ borderColor: 'var(--nyx-void-60)' }}
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
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--nyx-void-60)' }}>
                  <div className="flex items-center space-x-3">
                    <img 
                      src="/nyx-assets/images/nyx-icon.svg" 
                      alt="NYX" 
                      className="w-10 h-10"
                    />
                    <div>
                      <h2 className="nyx-heading-3 nyx-text-gradient">
                        NyxUSD
                      </h2>
                      <p className="nyx-body-small" style={{ color: 'var(--nyx-gleam-60)' }}>Navigation</p>
                    </div>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-lg nyx-glass hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label="Close navigation menu"
                    style={{ color: 'var(--nyx-gleam-80)' }}
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
                  
                  {/* Mobile Wallet Connection */}
                  <div className="px-4 pt-4 border-t mt-4" style={{ borderColor: 'var(--nyx-void-60)' }}>
                    <NyxWalletConnectButton className="w-full" />
                  </div>
                </div>

                {/* Mobile Footer with Chain Selector */}
                <div className="p-4 border-t space-y-4" style={{ borderColor: 'var(--nyx-void-60)' }}>
                  <div className="space-y-2">
                    <p className="nyx-body-small px-2" style={{ color: 'var(--nyx-gleam-50)' }}>Select Chain</p>
                    {chains.map((chain) => (
                      <button
                        key={chain.name}
                        onClick={() => {
                          setSelectedChain(chain);
                          closeMobileMenu();
                          // Trigger dramatic theme change
                          if (chain.themeId !== currentTheme.id) {
                            setTheme(chain.themeId);
                          }
                        }}
                        className={clsx(
                          "w-full text-left px-3 py-2.5 rounded-lg flex items-center space-x-3 transition-all",
                          "hover:nyx-glass",
                          selectedChain.name === chain.name && "nyx-glass border border-purple-500/30"
                        )}
                        disabled={transitionState.isTransitioning}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: chain.dotColor }} />
                        <span className="nyx-body-small" style={{ color: 'var(--nyx-gleam-80)' }}>
                          {chain.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-center space-x-2 pt-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: selectedChain.dotColor }} />
                    <span className="nyx-body-small" style={{ color: 'var(--nyx-gleam-60)' }}>Chain-Agnostic Protocol • {selectedChain.name}</span>
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