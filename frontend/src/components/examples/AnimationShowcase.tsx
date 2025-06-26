import React, { useState } from 'react';
import {
  InteractiveButton,
  AnimatedCard,
  InteractiveInput,
  PageTransition,
  StaggeredList,
  Spinner,
  DotsLoader,
  ProgressBar,
  SkeletonCard,
  LoadingButton,
  ContentLoading
} from '../ui';
import { useScrollAnimation, useStaggeredAnimation } from '../../hooks/useAnimations';

/**
 * Animation showcase component demonstrating all animation features
 */
export const AnimationShowcase: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(true);

  // Scroll animation for the hero section
  const { ref: heroRef, animationClasses: heroClasses } = useScrollAnimation({
    type: 'fadeIn',
    duration: 800,
    delay: 200
  });

  // Staggered animation for feature cards
  const { ref: cardsRef, getItemProps } = useStaggeredAnimation(6, {
    type: 'slideUp',
    duration: 500
  }, {
    baseDelay: 100,
    increment: 150
  });

  const handleLoadingDemo = async () => {
    setLoading(true);
    setProgress(0);
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const toggleContent = () => {
    setShowContent(!showContent);
  };

  return (
    <PageTransition type="fade" duration={500}>
      <div className="min-h-screen bg-gradient-to-br from-midnight-50 via-midnight-100 to-nyx-50 p-6">
        
        {/* Hero Section with Scroll Animation */}
        <div ref={heroRef} className={`text-center py-16 ${heroClasses}`}>
          <h1 className="text-5xl font-bold text-gradient-midnight mb-4 animate-float">
            NYXUSD Animation System
          </h1>
          <p className="text-xl text-gray-300 mb-8 animate-float-delayed">
            Smooth, performant animations for the midnight-themed UI
          </p>
          
          {/* Interactive buttons showcase */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <InteractiveButton variant="primary" hoverEffect="glow" size="lg">
              Glow Effect
            </InteractiveButton>
            <InteractiveButton variant="secondary" hoverEffect="lift" size="lg">
              Lift Effect
            </InteractiveButton>
            <InteractiveButton variant="tertiary" hoverEffect="scale" size="lg">
              Scale Effect
            </InteractiveButton>
          </div>
        </div>

        {/* Loading States Showcase */}
        <section className="mb-16">
          <AnimatedCard variant="midnight" hoverEffect="glow" className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Loading States</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Spinners */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">Spinners</h3>
                <div className="flex items-center space-x-4">
                  <Spinner size="sm" variant="primary" />
                  <Spinner size="md" variant="primary" />
                  <Spinner size="lg" variant="primary" />
                </div>
              </div>

              {/* Dots Loader */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">Dots Loader</h3>
                <div className="flex items-center space-x-4">
                  <DotsLoader size="sm" variant="primary" />
                  <DotsLoader size="md" variant="primary" />
                  <DotsLoader size="lg" variant="primary" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">Progress</h3>
                <ProgressBar value={progress} showLabel />
                <ProgressBar indeterminate />
              </div>
            </div>

            {/* Loading Button Demo */}
            <div className="mt-6 flex gap-4">
              <LoadingButton
                loading={loading}
                onClick={handleLoadingDemo}
                variant="primary"
                loadingText="Processing..."
              >
                Start Demo
              </LoadingButton>
              <InteractiveButton 
                variant="secondary" 
                onClick={toggleContent}
                hoverEffect="scale"
              >
                Toggle Content
              </InteractiveButton>
            </div>
          </AnimatedCard>
        </section>

        {/* Interactive Forms Showcase */}
        <section className="mb-16">
          <AnimatedCard variant="nyx" hoverEffect="float" className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Interactive Forms</h2>
            
            <div className="space-y-6">
              <InteractiveInput
                label="Standard Input"
                placeholder="Type something..."
                focusEffect="glow"
                helperText="This input has a glow effect on focus"
              />
              
              <InteractiveInput
                label="Glass Input"
                placeholder="Glass morphism style..."
                variant="glass"
                focusEffect="scale"
                helperText="Glass variant with scale effect"
              />
              
              <InteractiveInput
                label="Underline Input"
                placeholder="Minimalist underline..."
                variant="underline"
                focusEffect="slide"
                helperText="Underline variant with slide effect"
              />
              
              <InteractiveInput
                label="Character Counter"
                placeholder="Limited input..."
                showCharCount
                maxLength={50}
                helperText="Input with character counting"
              />
            </div>
          </AnimatedCard>
        </section>

        {/* Staggered Cards Animation */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-8 animate-fade-in">
            Staggered Animations
          </h2>
          
          {showContent ? (
            <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {Array.from({ length: 6 }, (_, i) => (
                <AnimatedCard
                  key={i}
                  variant="glass"
                  hoverEffect="float"
                  hoverBorder
                  {...getItemProps(i)}
                >
                  <div className="p-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 animate-glow-pulse" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Feature {i + 1}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      This card demonstrates staggered animation with a {150 * i}ms delay.
                    </p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <ContentLoading cards={6} layout="grid" className="max-w-6xl mx-auto" />
          )}
        </section>

        {/* Gradient and Glow Effects */}
        <section className="mb-16">
          <AnimatedCard variant="default" className="max-w-4xl mx-auto bg-gradient-to-r from-midnight-200 to-nyx-200">
            <h2 className="text-2xl font-bold text-white mb-6">Visual Effects</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Gradient Animations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">Gradient Animations</h3>
                <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg animate-gradient-shift" />
                <div className="h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg animate-gradient-pulse" />
              </div>

              {/* Floating Elements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">Floating Elements</h3>
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-purple-500 rounded-lg animate-float" />
                  <div className="w-16 h-16 bg-pink-500 rounded-lg animate-float-reverse" />
                  <div className="w-16 h-16 bg-blue-500 rounded-lg animate-float-subtle" />
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Skeleton Loading Showcase */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Skeleton Loading States
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {Array.from({ length: 3 }, (_, i) => (
              <SkeletonCard key={i} avatar shimmer />
            ))}
          </div>
        </section>

        {/* Performance Note */}
        <section className="text-center py-8">
          <AnimatedCard variant="glass" className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Performance Optimized</h3>
            <p className="text-gray-300 mb-4">
              All animations respect user preferences for reduced motion and are optimized for 60fps performance.
            </p>
            <div className="flex justify-center space-x-4">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                Hardware Accelerated
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                Accessibility Friendly
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                60fps Performance
              </span>
            </div>
          </AnimatedCard>
        </section>
      </div>
    </PageTransition>
  );
};

export default AnimationShowcase;