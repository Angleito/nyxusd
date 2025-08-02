import { VoiceService } from './voiceService';

export interface Voice {
  voice_id: string;
  name: string;
  samples: any;
  category: string;
  labels: Record<string, string>;
  description?: string;
  preview_url?: string;
  settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface GenerationConfig {
  chunk_length_schedule?: number[];
}

export interface StreamConfig {
  try_trigger_generation?: boolean;
  chunk_length_schedule?: number[];
}

export class ElevenLabsClient {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';
  private voiceService: VoiceService;

  constructor(voiceService: VoiceService) {
    this.voiceService = voiceService;
  }

  async initialize(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    await this.voiceService.initialize(apiKey);
  }

  async getVoices(): Promise<Voice[]> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  async getVoice(voiceId: string): Promise<Voice> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voice: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching voice:', error);
      throw error;
    }
  }

  async getDefaultVoiceSettings(voiceId: string): Promise<VoiceSettings> {
    const voice = await this.getVoice(voiceId);
    return voice.settings || {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0,
      use_speaker_boost: true,
    };
  }

  async textToSpeech(
    text: string,
    voiceId: string,
    options?: {
      model_id?: string;
      voice_settings?: VoiceSettings;
      optimize_streaming_latency?: number;
      output_format?: string;
    }
  ): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    const modelId = options?.model_id || 'eleven_turbo_v2_5';
    const voiceSettings = options?.voice_settings || await this.getDefaultVoiceSettings(voiceId);

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}?optimize_streaming_latency=${options?.optimize_streaming_latency || 2}&output_format=${options?.output_format || 'mp3_44100_128'}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: voiceSettings,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate speech: ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw error;
    }
  }

  async streamTextToSpeech(
    text: string,
    voiceId: string,
    onChunk: (chunk: ArrayBuffer) => void,
    options?: {
      model_id?: string;
      voice_settings?: VoiceSettings;
      optimize_streaming_latency?: number;
      generation_config?: GenerationConfig;
    }
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    const modelId = options?.model_id || 'eleven_turbo_v2_5';
    const voiceSettings = options?.voice_settings || await this.getDefaultVoiceSettings(voiceId);

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}/stream?optimize_streaming_latency=${options?.optimize_streaming_latency || 2}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: voiceSettings,
            generation_config: options?.generation_config,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to stream speech: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        onChunk(value.buffer);
      }
    } catch (error) {
      console.error('Error streaming text-to-speech:', error);
      throw error;
    }
  }

  async getModels(): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  async getUserInfo(): Promise<any> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async getSubscriptionInfo(): Promise<any> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/subscription`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription info:', error);
      throw error;
    }
  }

  // Voice cloning methods (requires higher tier subscription)
  async cloneVoice(
    name: string,
    files: File[],
    description?: string,
    labels?: Record<string, string>
  ): Promise<Voice> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    const formData = new FormData();
    formData.append('name', name);
    if (description) formData.append('description', description);
    if (labels) formData.append('labels', JSON.stringify(labels));
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${this.baseUrl}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to clone voice: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cloning voice:', error);
      throw error;
    }
  }

  async deleteVoice(voiceId: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete voice: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting voice:', error);
      throw error;
    }
  }

  async editVoiceSettings(
    voiceId: string,
    settings: VoiceSettings
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}/settings/edit`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Failed to edit voice settings: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error editing voice settings:', error);
      throw error;
    }
  }

  // Helper method to validate API key
  async validateApiKey(): Promise<boolean> {
    try {
      await this.getUserInfo();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get remaining character count for the month
  async getRemainingCharacters(): Promise<number> {
    const subscription = await this.getSubscriptionInfo();
    return subscription.character_limit - subscription.character_count;
  }
}

// Export singleton instance
export const elevenLabsClient = new ElevenLabsClient(voiceService);