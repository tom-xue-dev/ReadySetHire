# Audio Recording Troubleshooting Guide

## Problem: "Unexpected token '<', "<!doctype "... is not valid JSON"

This error occurs when the Transformers.js library tries to download the Whisper speech recognition model but receives an HTML page instead of the expected JSON response.

## Root Causes

1. **Network Issues**: Poor internet connection or network restrictions
2. **Proxy Interference**: Development server proxy settings interfering with external requests
3. **CDN Issues**: Hugging Face CDN (where models are hosted) being blocked or slow
4. **CORS Issues**: Cross-origin request restrictions
5. **Firewall/Corporate Network**: Network policies blocking external model downloads

## Solutions Implemented

### 1. Enhanced Error Handling
- Added detailed logging for ASR pipeline loading
- Specific error messages for different failure types
- Graceful fallback when ASR is unavailable

### 2. Network Configuration
- Updated Vite config to allow CORS for external requests
- Ensured Transformers.js can make external requests
- Added proper error handling for network failures

### 3. Fallback Mechanism
- When ASR fails, the system now provides a fallback
- Users can still record audio and manually type their answers
- Clear error messages guide users on what to do

## How It Works Now

### Normal Flow
1. User records audio
2. System attempts to load Whisper model
3. If successful, audio is transcribed to text
4. Text is automatically filled in the answer field

### Fallback Flow
1. User records audio
2. System fails to load Whisper model
3. System shows error message: "Speech recognition failed. Please type your answer manually."
4. User can manually type their answer
5. Audio recording is still saved for reference

## Error Messages

- **Model Loading Failed**: "Speech recognition model failed to load. Please check your internet connection and try again."
- **Network Error**: "Network error occurred while loading speech recognition model. Please check your connection."
- **Timeout**: "Speech recognition request timed out. Please try again."
- **ASR Unavailable**: "Speech recognition is not available. Please type your answer manually."

## Console Logging

The system now provides detailed console logging:

```
🎤 Loading Transformers.js ASR pipeline...
🎤 Initializing Whisper model...
✅ ASR pipeline loaded successfully
🎤 Starting audio transcription...
🎤 Processing audio buffer (12345 bytes)...
✅ Transcription completed: "Your transcribed text here"
```

Or in case of failure:

```
❌ Failed to load ASR pipeline: [error details]
🎤 Using fallback transcription (manual input required)
```

## Troubleshooting Steps

### For Users
1. **Check Internet Connection**: Ensure stable internet connection
2. **Try Again**: Sometimes the issue is temporary
3. **Manual Input**: If ASR fails, type your answer manually
4. **Check Console**: Open browser dev tools to see detailed error messages

### For Developers
1. **Check Network Tab**: Look for failed requests to huggingface.co
2. **Verify CORS**: Ensure CORS is properly configured
3. **Test Different Networks**: Try on different networks to isolate issues
4. **Check Firewall**: Ensure no firewall is blocking external requests

## Configuration Options

### Environment Variables
You can configure Transformers.js behavior through environment variables:

```bash
# Allow remote models (default: true)
VITE_TRANSFORMERS_ALLOW_REMOTE=true

# Allow local models (default: true)  
VITE_TRANSFORMERS_ALLOW_LOCAL=true

# Custom model cache directory
VITE_TRANSFORMERS_CACHE_DIR=./models
```

### Vite Configuration
The Vite config now includes:

```typescript
server: {
  cors: true, // Allow external requests
  proxy: {
    '/api': { /* API proxy */ }
  }
}
```

## Alternative Solutions

### 1. Use Different Model
If Whisper-tiny fails, you can try other models:

```typescript
// In asr.ts, change the model name
const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-base.en");
```

### 2. Local Model
Download models locally to avoid network issues:

```typescript
// Configure local model path
env.localModelPath = './models/whisper-tiny.en';
```

### 3. External ASR Service
Replace Transformers.js with external ASR service:

```typescript
// Example: Use Google Speech-to-Text API
async function transcribeWithGoogle(audioBlob: Blob): Promise<string> {
  // Implementation using Google Speech API
}
```

## Testing

### Test ASR Availability
```javascript
// In browser console
import { isASRAvailable } from './src/api/asr';
console.log('ASR Available:', isASRAvailable());
```

### Test Audio Recording
1. Go to Interview Run page
2. Start recording
3. Speak clearly
4. Stop recording
5. Check console for transcription logs

## Performance Considerations

- **Model Size**: Whisper-tiny is ~39MB, suitable for web use
- **Loading Time**: First load may take 10-30 seconds depending on connection
- **Memory Usage**: Model uses ~100-200MB RAM when loaded
- **Caching**: Models are cached in browser for subsequent uses

## Future Improvements

1. **Progressive Loading**: Load model in background
2. **Multiple Models**: Support different model sizes
3. **Offline Mode**: Cache models for offline use
4. **Streaming**: Real-time transcription during recording
5. **Language Support**: Multiple language models

## Support

If you continue to experience issues:

1. Check browser console for detailed error messages
2. Verify internet connection stability
3. Try different browsers or networks
4. Contact support with console logs and error details
