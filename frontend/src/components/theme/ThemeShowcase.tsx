/**
 * Theme Showcase Component
 * Demonstrates the dramatic theme changes for each blockchain
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeShowcase: React.FC = () => {
  const { currentTheme } = useTheme();
  
  return (
    <motion.div
      className="container mx-auto px-4 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-12">
        <motion.h2
          className="text-4xl font-bold mb-4"
          style={{ color: 'var(--theme-text-primary)' }}
          animate={{
            color: currentTheme.colors.text.primary,
          }}
          transition={{ duration: 0.4 }}
        >
          {currentTheme.name} Theme Active
        </motion.h2>
        <motion.p
          className="text-lg"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          {currentTheme.description}
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Color Palette Card */}
        <motion.div
          className="p-6 rounded-xl"
          style={{
            background: currentTheme.gradients.card,
            border: `1px solid ${currentTheme.colors.border.default}`,
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3 className="text-xl font-semibold mb-4" style={{ color: currentTheme.colors.text.primary }}>
            Color Palette
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded"
                style={{ background: currentTheme.colors.primary[500] }}
              />
              <span style={{ color: currentTheme.colors.text.secondary }}>Primary</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded"
                style={{ background: currentTheme.colors.secondary[500] }}
              />
              <span style={{ color: currentTheme.colors.text.secondary }}>Secondary</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded"
                style={{ background: currentTheme.colors.accent[500] }}
              />
              <span style={{ color: currentTheme.colors.text.secondary }}>Accent</span>
            </div>
          </div>
        </motion.div>
        
        {/* Effects Card */}
        <motion.div
          className="p-6 rounded-xl"
          style={{
            background: currentTheme.gradients.card,
            border: `1px solid ${currentTheme.colors.border.default}`,
            boxShadow: currentTheme.effects.shadow.lg,
          }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: currentTheme.effects.shadow.xl,
          }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3 className="text-xl font-semibold mb-4" style={{ color: currentTheme.colors.text.primary }}>
            Theme Effects
          </h3>
          <div className="space-y-3">
            <motion.div
              className="p-3 rounded"
              style={{
                background: currentTheme.colors.surface.overlay,
                backdropFilter: `blur(${currentTheme.effects.blur.md})`,
              }}
              animate={{
                boxShadow: [
                  currentTheme.effects.glow.primary,
                  currentTheme.effects.glow.secondary,
                  currentTheme.effects.glow.primary,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <p style={{ color: currentTheme.colors.text.secondary }}>Glowing Effect</p>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Animation Card */}
        <motion.div
          className="p-6 rounded-xl"
          style={{
            background: currentTheme.gradients.card,
            border: `1px solid ${currentTheme.colors.border.default}`,
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3 className="text-xl font-semibold mb-4" style={{ color: currentTheme.colors.text.primary }}>
            Animations
          </h3>
          <div className="space-y-3">
            {currentTheme.animations.particles.enabled && (
              <p style={{ color: currentTheme.colors.text.secondary }}>
                ✨ {currentTheme.animations.particles.count} Particles
              </p>
            )}
            {currentTheme.animations.waves.enabled && (
              <p style={{ color: currentTheme.colors.text.secondary }}>
                🌊 Wave Effects Active
              </p>
            )}
            <motion.div
              className="w-12 h-12 rounded-full"
              style={{ background: currentTheme.gradients.primary }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: currentTheme.animations.duration.slow / 1000,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Theme-specific message */}
      <motion.div
        className="mt-12 p-8 rounded-2xl text-center"
        style={{
          background: currentTheme.gradients.hero,
          border: `2px solid ${currentTheme.colors.border.emphasis}`,
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {currentTheme.id === 'sui' && (
          <>
            <h3 className="text-2xl font-bold mb-2" style={{ color: currentTheme.colors.text.primary }}>
              Welcome to Sui's Ocean Breeze
            </h3>
            <p style={{ color: currentTheme.colors.text.secondary }}>
              Experience the light, flowing aesthetic of the Sui network with soft blues and gentle animations.
            </p>
          </>
        )}
        {currentTheme.id === 'base' && (
          <>
            <h3 className="text-2xl font-bold mb-2" style={{ color: currentTheme.colors.text.primary }}>
              Dive into Base's Deep Ocean
            </h3>
            <p style={{ color: currentTheme.colors.text.secondary }}>
              Explore the depths with Base's electric blue theme and dynamic ocean currents.
            </p>
          </>
        )}
        {currentTheme.id === 'midnight' && (
          <>
            <h3 className="text-2xl font-bold mb-2" style={{ color: currentTheme.colors.text.primary }}>
              Midnight Protocol's Cosmic Realm
            </h3>
            <p style={{ color: currentTheme.colors.text.secondary }}>
              Journey through the cosmos with purple nebulas and starfield effects.
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};