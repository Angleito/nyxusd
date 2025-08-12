/**
 * Simple prompt optimization for NyxUSD AI assistant
 * Reduces prompt token usage while maintaining effectiveness
 */

export interface OptimizationConfig {
  level: 'light' | 'heavy' | 'conservative' | 'balanced' | 'aggressive';
  maxTokens?: number;
  preserveClarity?: boolean;
  enableAbbreviations?: boolean;
  compressRepeatedPatterns?: boolean;
  priorityContext?: string[];
}

export interface OptimizationResult {
  originalTokens: number;
  optimizedTokens: number;
  reduction: number;
  optimizedPrompt: string;
  clarity: number;
}

export class PromptOptimizer {
  private readonly compressionLevel: 'light' | 'heavy' | 'conservative' | 'balanced' | 'aggressive';
  
  constructor(config: OptimizationConfig = { level: 'light' }) {
    this.compressionLevel = config.level;
  }

  optimize(prompt: string, config?: OptimizationConfig): OptimizationResult {
    const originalTokens = this.estimateTokens(prompt);
    
    // Use the provided config level or fall back to the instance's compressionLevel
    const level = config?.level || this.compressionLevel;
    
    // Apply different compression strategies based on level
    let optimized: string;
    switch (level) {
      case 'heavy':
      case 'aggressive':
        optimized = this.heavyCompress(prompt, config);
        break;
      case 'light':
      case 'conservative':
        optimized = this.lightCompress(prompt, config);
        break;
      case 'balanced':
        // For balanced, we'll use a combination of light and heavy compression
        optimized = this.lightCompress(prompt, config);
        if (config?.enableAbbreviations) {
          optimized = this.heavyCompress(optimized, config);
        }
        break;
      default:
        optimized = this.lightCompress(prompt, config);
    }
    
    const optimizedTokens = this.estimateTokens(optimized);
    
    // Calculate clarity score (simplified implementation)
    const clarity = config?.preserveClarity ? Math.min(100, Math.round((optimizedTokens / originalTokens) * 100)) : 100;
    
    return {
      originalTokens,
      optimizedTokens,
      reduction: Math.round(((originalTokens - optimizedTokens) / originalTokens) * 100),
      optimizedPrompt: optimized,
      clarity
    };
  }
  
  /**
   * Analyze token usage of a prompt without optimizing it
   */
  analyzeTokenUsage(prompt: string): { totalTokens: number; recommendations: string[] } {
    const tokens = this.estimateTokens(prompt);
    const recommendations: string[] = [];
    
    if (tokens > 3000) {
      recommendations.push("Prompt is quite long, consider using optimization");
    } else if (tokens > 1000) {
      recommendations.push("Prompt length is moderate, optimization could help");
    }
    
    return {
      totalTokens: tokens,
      recommendations
    };
  }
  
  private lightCompress(text: string, config?: OptimizationConfig): string {
    let compressed = text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove redundant words
      .replace(/\b(please|kindly|very|really|quite|rather)\b/gi, '')
      // Simplify common phrases
      .replace(/in order to/gi, 'to')
      .replace(/at this point in time/gi, 'now')
      .replace(/due to the fact that/gi, 'because');
    
    // Remove priority context markers if they exist in the text
    if (config?.priorityContext) {
      config.priorityContext.forEach(context => {
        compressed = compressed.replace(new RegExp(`\\[\\[${context}\\]\\]`, 'g'), '');
      });
    }
    
    return compressed.trim();
  }
  
  private heavyCompress(text: string, config?: OptimizationConfig): string {
    let compressed = this.lightCompress(text, config);
    
    // Apply abbreviations if enabled
    if (config?.enableAbbreviations !== false) { // Default to true unless explicitly false
      compressed = compressed
        // Abbreviate common terms
        .replace(/\btransaction\b/gi, 'tx')
        .replace(/\bcollateralized debt position\b/gi, 'CDP')
        .replace(/\bcollateral\b/gi, 'coll')
        .replace(/\bliquidation\b/gi, 'liq')
        // Remove articles where not critical
        .replace(/\b(a|an|the)\s+/gi, '');
    }
    
    // Compress repetitive patterns if enabled
    if (config?.compressRepeatedPatterns !== false) { // Default to true unless explicitly false
      compressed = compressed
        // Compress repetitive structures
        .replace(/\b(\w+)\s+\1\b/gi, '$1');
    }
    
    // Remove priority context markers if they exist in the text
    if (config?.priorityContext) {
      config.priorityContext.forEach(context => {
        compressed = compressed.replace(new RegExp(`\\[\\[${context}\\]\\]`, 'g'), '');
      });
    }
    
    return compressed.trim();
  }
  
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

export default PromptOptimizer;

/**
 * Factory function to create a PromptOptimizer instance
 */
export function createOptimizer(config: OptimizationConfig = { level: 'light' }): PromptOptimizer {
  return new PromptOptimizer(config);
}

/**
 * Quick optimization function that creates an optimizer and runs it in one step
 */
export function quickOptimize(prompt: string, level: 'light' | 'heavy' | 'conservative' | 'balanced' | 'aggressive' = 'light'): OptimizationResult {
  const optimizer = createOptimizer({ level });
  return optimizer.optimize(prompt);
}
