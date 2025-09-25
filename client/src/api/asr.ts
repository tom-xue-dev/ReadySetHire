import { JWT_TOKEN } from '../config/api';

// Backend Whisper API client
class BackendWhisperClient {
  private baseUrl: string;
  private serviceAvailable: boolean = true;

  constructor() {
    // Get API base URL from environment or use default
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  }

  async load(progressCallback?: (data: any) => void) {
    // For backend Whisper, we just check if the service is available
    console.log('🎤 Checking backend Whisper service availability...');
    
    try {
      // Test if the backend endpoint is accessible
      const response = await fetch(`${this.baseUrl}/model/whisper`, {
        method: 'HEAD', // Use HEAD request to check availability without sending data
      });
      
      this.serviceAvailable = response.ok;
      
      if (progressCallback) {
        progressCallback({ 
          status: 'loaded', 
          message: this.serviceAvailable ? 'Backend Whisper service is available' : 'Backend Whisper service is not available' 
        });
      }
      
      if (!this.serviceAvailable) {
        throw new Error('Backend Whisper service is not available. Please check if the server is running.');
      }
      
      console.log('✅ Backend Whisper service is ready');
    } catch (error: any) {
      console.error('❌ Failed to connect to backend Whisper service:', error);
      this.serviceAvailable = false;
      
      if (progressCallback) {
        progressCallback({ 
          status: 'error', 
          message: 'Failed to connect to backend Whisper service' 
        });
      }
      
      throw new Error('Backend Whisper service is not available. Please check if the server is running.');
    }
  }

  async transcribe(audioBuffer: ArrayBuffer): Promise<string> {
    if (!this.serviceAvailable) {
      throw new Error('Backend Whisper service is not available. Please check if the server is running.');
    }
    
    try {
      console.log(`🎤 Uploading audio to backend Whisper service (${audioBuffer.byteLength} bytes)...`);
      
      // Send audio buffer as binary stream to backend
      const response = await fetch(`${this.baseUrl}/model/whisper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream', // Binary data
          'Authorization': `Bearer ${JWT_TOKEN}`, // Add JWT token for authentication
        },
        body: audioBuffer, // Send ArrayBuffer directly as binary stream
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Parse the response
      const result = await response.json();
      
      if (result.success && result.data && result.data.transcription) {
        const text = result.data.transcription.trim();
        console.log(`✅ Transcription completed: "${text}"`);
        return text;
      } else {
        throw new Error(result.error || 'Transcription failed');
      }
    } catch (error: any) {
      console.error('❌ Backend audio transcription failed:', error);
      
      // Provide more specific error messages based on the error type
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed: Unable to connect to backend Whisper service. Please check if the server is running.');
      } else if (error.message.includes('HTTP 404')) {
        throw new Error('Backend Whisper endpoint not found. Please check if the server is properly configured.');
      } else if (error.message.includes('HTTP 500')) {
        throw new Error('Backend Whisper service error. Please try again or contact the administrator.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Transcription timeout: The audio processing took too long. Please try with a shorter recording.');
      } else {
        throw new Error(`Audio transcription failed: ${error.message}`);
      }
    }
  }

  isServiceAvailable(): boolean {
    return this.serviceAvailable;
  }

  reset(): void {
    this.serviceAvailable = true;
    console.log('🔄 Backend Whisper availability reset - will retry on next attempt');
  }
}

// Singleton instance
const backendWhisperClient = new BackendWhisperClient();

export async function loadASR(progressCallback?: (data: any) => void) {
  return backendWhisperClient.load(progressCallback);
}

export async function transcribeWavBlob(audio: Blob): Promise<string> {
  try {
    console.log('🎤 Starting audio transcription...');
    
    // Ensure the backend service is available
    await backendWhisperClient.load();
    
    const arrayBuffer = await audio.arrayBuffer();

    console.log('🎤 Array buffer:', arrayBuffer);
    
    return await backendWhisperClient.transcribe(arrayBuffer);
  } catch (error: any) {
    console.error('❌ Audio transcription failed:', error);
    
    // Provide more specific error messages based on the error type
    if (error.message.includes('Network connection failed')) {
      throw new Error('Network connection failed: Unable to connect to backend Whisper service. Please check if the server is running.');
    } else if (error.message.includes('Backend Whisper endpoint not found')) {
      throw new Error('Backend Whisper endpoint not found. Please check if the server is properly configured.');
    } else if (error.message.includes('Backend Whisper service error')) {
      throw new Error('Backend Whisper service error. Please try again or contact the administrator.');
    } else if (error.message.includes('Transcription timeout')) {
      throw new Error('Transcription timeout: The audio processing took too long. Please try with a shorter recording.');
    } else {
      throw new Error(`Audio transcription failed: ${error.message}`);
    }
  }
}

// Fallback function for when ASR is not available
export function createFallbackTranscription(_audio: Blob): Promise<string> {
  return new Promise((resolve) => {
    console.log('🎤 Using fallback transcription (manual input required)');
    // Return a placeholder that indicates manual input is needed
    resolve('[Audio recorded - please type your answer manually]');
  });
}

// Check if ASR is available
export function isASRAvailable(): boolean {
  return backendWhisperClient.isServiceAvailable();
}

// Alternative ASR loading with different model (not applicable for backend)
export async function loadAlternativeASR() {
  throw new Error('Alternative ASR loading is not supported with backend Whisper service.');
}

// Reset ASR availability (for retry after network issues)
export function resetASRAvailability() {
  backendWhisperClient.reset();
}


