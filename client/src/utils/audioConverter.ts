// Audio conversion utilities for converting WebM to WAV format
// This is needed because most browsers don't support recording directly to WAV

export class AudioConverter {
  /**
   * Convert WebM audio blob to WAV format
   * @param webmBlob - The WebM audio blob from MediaRecorder
   * @returns Promise<Blob> - WAV format blob
   */
  static async webmToWav(webmBlob: Blob): Promise<Blob> {
    console.log('🔄 Converting WebM to WAV format...');
    
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000 // Whisper prefers 16kHz
      });
      
      // Convert blob to array buffer
      const arrayBuffer = await webmBlob.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Convert to WAV
      const wavBlob = this.audioBufferToWav(audioBuffer);
      
      console.log('✅ Successfully converted WebM to WAV');
      console.log('Original size:', webmBlob.size, 'bytes, WAV size:', wavBlob.size, 'bytes');
      
      return wavBlob;
    } catch (error: any) {
      console.error('❌ WebM to WAV conversion failed:', error);
      throw new Error(`Audio conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert AudioBuffer to WAV blob
   * @param audioBuffer - The decoded audio buffer
   * @returns Blob - WAV format blob
   */
  private static audioBufferToWav(audioBuffer: AudioBuffer): Blob {
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    const numberOfChannels = Math.min(audioBuffer.numberOfChannels, 1); // Force mono
    
    // Create buffer for WAV file
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
    // Write WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // PCM format
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true); // Byte rate
    view.setUint16(32, numberOfChannels * 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    this.writeString(view, 36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert audio data to 16-bit PCM
    const channelData = audioBuffer.getChannelData(0); // Get first channel (mono)
    let offset = 44;
    
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i])); // Clamp to [-1, 1]
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF; // Convert to 16-bit
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Write string to DataView
   * @param view - DataView to write to
   * @param offset - Offset to write at
   * @param string - String to write
   */
  private static writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Check if audio conversion is supported
   * @returns boolean
   */
  static isConversionSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  /**
   * Get supported audio formats for MediaRecorder
   * @returns string[] - Array of supported MIME types
   */
  static getSupportedFormats(): string[] {
    const formats = [
      'audio/wav',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus'
    ];
    
    return formats.filter(format => MediaRecorder.isTypeSupported(format));
  }
}
