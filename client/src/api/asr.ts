import type { PipelineType } from "@xenova/transformers";

// Lazy singleton loader for speech-to-text pipeline
let pipelinePromise: Promise<any> | null = null;
let asrAvailable = true; // Track if ASR is available

export async function loadASR() {
  if (!pipelinePromise) {
    // Use a small Whisper model to reduce download size; Xenova provides onnx models
    pipelinePromise = (async () => {
      try {
        console.log('🎤 Loading Transformers.js ASR pipeline...');
        const { pipeline, env } = await import("@xenova/transformers");
        
        // Configure Transformers.js to handle network issues
        env.allowRemoteModels = true;
        env.allowLocalModels = true;
        
        // Try to use a different CDN if available
        try {
          (env as any).remoteURL = 'https://huggingface.co';
        } catch (e) {
          console.warn('Could not set custom remote URL');
        }
        
        // Add retry logic for model loading
        let retries = 3;
        let lastError: any;
        
        while (retries > 0) {
          try {
            console.log(`🎤 Initializing Whisper model... (attempt ${4 - retries}/3)`);
            
            // Try to load the model with timeout
            const asr = await Promise.race([
              pipeline("automatic-speech-recognition" as PipelineType, "Xenova/whisper-tiny.en"),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Model loading timeout')), 30000)
              )
            ]);
            
            console.log('✅ ASR pipeline loaded successfully');
            return asr;
          } catch (error: any) {
            lastError = error;
            retries--;
            
            if (retries > 0) {
              console.warn(`⚠️ Model loading failed, retrying... (${retries} attempts left)`);
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
        
        // If all retries failed, throw the last error
        throw lastError;
        
      } catch (error: any) {
        console.error('❌ Failed to load ASR pipeline after all retries:', error);
        asrAvailable = false;
        
        // Provide more specific error messages
        if (error.message.includes('Unexpected token')) {
          throw new Error('Network error: Unable to download speech recognition model. Please check your internet connection and try again.');
        } else if (error.message.includes('timeout')) {
          throw new Error('Model loading timeout: The speech recognition model took too long to load. Please try again.');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Network connection failed: Unable to connect to model server. Please check your internet connection.');
        } else {
          throw new Error(`Failed to load speech recognition model: ${error.message}`);
        }
      }
    })();
  }
  return pipelinePromise;
}

export async function transcribeWavBlob(audio: Blob): Promise<string> {
  try {
    console.log('🎤 Starting audio transcription...');
    
    // Check if ASR is available
    if (!asrAvailable) {
      throw new Error('Speech recognition is not available. Please check your internet connection.');
    }
    
    const asr = await loadASR();
    const arrayBuffer = await audio.arrayBuffer();
    
    console.log(`🎤 Processing audio buffer (${arrayBuffer.byteLength} bytes)...`);
    
    // Add timeout for transcription
    const result = await Promise.race([
      asr(arrayBuffer),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transcription timeout')), 15000)
      )
    ]);
    
    const text: string = (result?.text ?? "").trim();
    
    console.log(`✅ Transcription completed: "${text}"`);
    return text;
  } catch (error: any) {
    console.error('❌ Audio transcription failed:', error);
    
    // Provide more specific error messages based on the error type
    if (error.message.includes('Network error')) {
      throw new Error('Network error: Unable to download speech recognition model. Please check your internet connection and try again.');
    } else if (error.message.includes('Model loading timeout')) {
      throw new Error('Model loading timeout: The speech recognition model took too long to load. Please try again.');
    } else if (error.message.includes('Transcription timeout')) {
      throw new Error('Transcription timeout: The audio processing took too long. Please try with a shorter recording.');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Network connection failed: Unable to connect to model server. Please check your internet connection.');
    } else if (error.message.includes('Unexpected token')) {
      throw new Error('Network error: Unable to download speech recognition model. Please check your internet connection and try again.');
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
  return asrAvailable;
}

// Alternative ASR loading with different model
export async function loadAlternativeASR() {
  try {
    console.log('🎤 Trying alternative ASR model...');
    const { pipeline } = await import("@xenova/transformers");
    
    // Try a different, smaller model
    const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny");
    console.log('✅ Alternative ASR pipeline loaded successfully');
    return asr;
  } catch (error: any) {
    console.error('❌ Alternative ASR also failed:', error);
    throw error;
  }
}

// Reset ASR availability (for retry after network issues)
export function resetASRAvailability() {
  asrAvailable = true;
  pipelinePromise = null;
  console.log('🔄 ASR availability reset - will retry on next attempt');
}


