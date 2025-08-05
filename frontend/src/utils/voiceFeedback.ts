/**
 * Voice feedback utilities for enhanced audio experience
 */

export class VoiceFeedback {
  private static audioContext: AudioContext | null = null;

  /**
   * Initialize audio context on user interaction
   */
  static init(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Play a success sound for completed actions
   */
  static async playSuccess(): Promise<void> {
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Success sound: two ascending tones
    oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Play an error sound for failed actions
   */
  static async playError(): Promise<void> {
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Error sound: descending tone
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 0.2); // A3
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Play a notification sound for new messages
   */
  static async playNotification(): Promise<void> {
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Notification sound: quick high tone
    oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  /**
   * Play a processing sound for ongoing operations
   */
  static async playProcessing(): Promise<void> {
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();

    // Create a subtle wobble effect
    lfo.frequency.setValueAtTime(3, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    lfo.start(this.audioContext.currentTime);
    oscillator.start(this.audioContext.currentTime);
    
    lfo.stop(this.audioContext.currentTime + 0.5);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  /**
   * Generate voice feedback for swap transactions
   */
  static generateSwapFeedback(params: {
    inputToken: string;
    outputToken: string;
    amount: string;
    priceImpact?: number;
    gasEstimate?: string;
    isCrossChain?: boolean;
    sourceChain?: string;
    destinationChain?: string;
  }): string {
    let feedback = `Swapping ${params.amount} ${params.inputToken} to ${params.outputToken}`;
    
    if (params.isCrossChain && params.sourceChain && params.destinationChain) {
      feedback += ` from ${params.sourceChain} to ${params.destinationChain}`;
    }
    
    if (params.priceImpact !== undefined) {
      const impactPercent = (params.priceImpact * 100).toFixed(2);
      feedback += `. Price impact is ${impactPercent}%`;
      
      if (params.priceImpact > 0.05) {
        feedback += `, which is high. Please review carefully`;
      }
    }
    
    if (params.gasEstimate) {
      feedback += `. Estimated gas cost is ${params.gasEstimate} ETH`;
    }
    
    return feedback;
  }

  /**
   * Generate voice feedback for transaction status
   */
  static generateTransactionFeedback(status: 'pending' | 'success' | 'failed', txHash?: string): string {
    switch (status) {
      case 'pending':
        return "Transaction submitted. I'll notify you when it's complete.";
      case 'success':
        return `Transaction successful! ${txHash ? `Transaction hash is ${txHash.slice(0, 10)}` : ''}`;
      case 'failed':
        return "Transaction failed. Please check your wallet for details.";
    }
  }
}

export default VoiceFeedback;