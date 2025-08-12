/**
 * Simple prompt optimization for NyxUSD AI assistant
 * Reduces prompt token usage while maintaining effectiveness
 */

export interface OptimizationConfig {
  level: 'light' | 'heavy';
  maxTokens?: number;
}

export interface OptimizationResult {
  originalTokens: number;
  optimizedTokens: number;
  reduction: number;
  optimizedPrompt: string;
}

export class PromptOptimizer {
  private readonly compressionLevel: 'light' | 'heavy';
  
  constructor(config: OptimizationConfig = { level: 'light' }) {
    this.compressionLevel = config.level;
  }

  optimize(prompt: string): OptimizationResult {
    const originalTokens = this.estimateTokens(prompt);
    const optimized = this.compressionLevel === 'heavy' 
      ? this.heavyCompress(prompt)
      : this.lightCompress(prompt);
    
    const optimizedTokens = this.estimateTokens(optimized);
    
    return {
      originalTokens,
      optimizedTokens,
      reduction: Math.round(((originalTokens - optimizedTokens) / originalTokens) * 100),
      optimizedPrompt: optimized
    };
  }
  
  private lightCompress(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove redundant words
      .replace(/\b(please|kindly|very|really|quite|rather)\b/gi, '')
      // Simplify common phrases
      .replace(/in order to/gi, 'to')
      .replace(/at this point in time/gi, 'now')
      .replace(/due to the fact that/gi, 'because')
      .trim();
  }
  
  private heavyCompress(text: string): string {
    return this.lightCompress(text)
      // Abbreviate common terms
      .replace(/\btransaction\b/gi, 'tx')
      .replace(/\bcollateralized debt position\b/gi, 'CDP')
      .replace(/\bcollateral\b/gi, 'coll')
      .replace(/\bliquidation\b/gi, 'liq')
      // Remove articles where not critical
      .replace(/\b(a|an|the)\s+/gi, '')
      // Compress repetitive structures
      .replace(/\b(\w+)\s+\1\b/gi, '$1')
      .trim();
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
export function quickOptimize(prompt: string, level: 'light' | 'heavy' = 'light'): OptimizationResult {
  const optimizer = createOptimizer({ level });
  return optimizer.optimize(prompt);
}
