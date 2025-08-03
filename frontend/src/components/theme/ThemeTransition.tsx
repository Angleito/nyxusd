/**
 * Theme Transition Component
 * Handles dramatic theme switching animations
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeTransitionProps {
  children: React.ReactNode;
}

export const ThemeTransition: React.FC<ThemeTransitionProps> = ({ children }) => {
  const { transitionState, currentTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (transitionState.isTransitioning) {
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 400);
    }
  }, [transitionState.isTransitioning]);
  
  const variants = {
    hidden: {
      opacity: 0,
      scale: 1.02,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
  };
  
  return (
    <>
      {/* Theme transition overlay */}
      <AnimatePresence>
        {transitionState.isTransitioning && (
          <motion.div
            className="fixed inset-0 z-[9999] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Wave transition effect for ocean themes */}
            {(currentTheme.id === 'sui' || currentTheme.id === 'base') && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, ${currentTheme.colors.primary[500]}20 0%, transparent 100%)`,
                }}
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-100%' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            )}
            
            {/* Starfield transition for midnight theme */}
            {currentTheme.id === 'midnight' && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 2, rotate: 180 }}
                exit={{ scale: 0, rotate: 360 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            )}
            
            {/* Flash effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: currentTheme.colors.background.overlay,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content with transition */}
      <motion.div
        key={currentTheme.id}
        variants={variants}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        transition={{
          duration: 0.4,
          ease: 'easeInOut',
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </>
  );
};

interface ThemeBackgroundProps {
  className?: string;
}

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ className = '' }) => {
  const { currentTheme } = useTheme();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [gridNodes, setGridNodes] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  useEffect(() => {
    if (currentTheme.animations.particles.enabled) {
      const newParticles = Array.from({ length: currentTheme.animations.particles.count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
      }));
      setParticles(newParticles);
    }
    
    // Create blockchain grid for Base theme
    if (currentTheme.id === 'base') {
      const nodes = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 6; j++) {
          nodes.push({
            id: i * 6 + j,
            x: (i + 1) * 12.5,
            y: (j + 1) * 16.66,
          });
        }
      }
      setGridNodes(nodes);
    }
  }, [currentTheme]);
  
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Gradient background */}
      <motion.div
        key={`${currentTheme.id}-gradient`}
        className="absolute inset-0"
        style={{
          background: currentTheme.gradients.background,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      
      {/* Blockchain grid for Base theme */}
      {currentTheme.id === 'base' && (
        <div className="absolute inset-0">
          <svg className="w-full h-full" style={{ opacity: 0.1 }}>
            {gridNodes.map((node, i) => (
              <g key={node.id}>
                {/* Connect to neighboring nodes */}
                {gridNodes.map((otherNode, j) => {
                  const distance = Math.sqrt(
                    Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
                  );
                  if (distance < 20 && i < j) {
                    return (
                      <motion.line
                        key={`${node.id}-${otherNode.id}`}
                        x1={`${node.x}%`}
                        y1={`${node.y}%`}
                        x2={`${otherNode.x}%`}
                        y2={`${otherNode.y}%`}
                        stroke="#0052FF"
                        strokeWidth="1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    );
                  }
                  return null;
                })}
                {/* Node circles */}
                <motion.circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r="3"
                  fill="#0052FF"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: node.id * 0.1,
                  }}
                />
              </g>
            ))}
          </svg>
        </div>
      )}
      
      {/* Particles for all themes */}
      {currentTheme.animations.particles.enabled && (
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: currentTheme.animations.particles.size,
                height: currentTheme.animations.particles.size,
                background: currentTheme.animations.particles.color,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + particle.delay,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Wave effect for ocean themes */}
      {currentTheme.animations.waves.enabled && (
        <svg
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '30vh' }}
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
        >
          <motion.path
            fill={currentTheme.animations.waves.color}
            animate={{
              d: [
                'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
                'M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,224C960,203,1056,149,1152,128C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
                'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>
      )}
    </div>
  );
};