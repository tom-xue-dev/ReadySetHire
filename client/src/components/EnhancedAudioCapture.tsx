import { useEffect, useRef, useState } from "react";
import { AudioConverter } from "../utils/audioConverter";

export interface AudioCaptureProps {
  onStop: (blob: Blob) => void;
  disabled?: boolean;
  allowMultiple?: boolean; // Allow multiple recordings
  onAppend?: (text: string) => void; // Callback for appending transcribed text
}

// Enhanced recorder: supports multiple recordings and text concatenation
export default function AudioCapture({ onStop, disabled, allowMultiple = true }: AudioCaptureProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [recordingCount, setRecordingCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Log supported audio formats for debugging
    const supportedFormats = AudioConverter.getSupportedFormats();
    console.log('🎤 Supported audio formats:', supportedFormats);
    console.log('🎤 Audio conversion supported:', AudioConverter.isConversionSupported());
    
    return () => {
      try { 
        mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop()); 
      } catch {} 
    };
  }, []);

  async function start() {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Whisper prefers 16kHz
          channelCount: 1,   // Mono audio
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Try to use WAV format if supported, otherwise use the best available format
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        options.mimeType = 'audio/wav';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      }
      
      const mr = new MediaRecorder(stream, options);
      chunksRef.current = [];
      
      mr.ondataavailable = (e) => { 
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data); 
      };
      
      mr.onstop = async () => {
        setIsProcessing(true);
        try {
          // Create blob from recorded chunks
          const originalBlob = new Blob(chunksRef.current, { 
            type: mr.mimeType || 'audio/webm' 
          });
          
          console.log('🎤 Recorded audio:', {
            type: originalBlob.type,
            size: originalBlob.size,
            mimeType: mr.mimeType
          });
          
          let finalBlob: Blob;
          
          // If we recorded in WAV format, use directly
          if (originalBlob.type.includes('wav')) {
            console.log('✅ Audio recorded in WAV format');
            finalBlob = originalBlob;
          } 
          // Otherwise, convert WebM to WAV
          else {
            console.log('🔄 Converting audio to WAV format...');
            if (AudioConverter.isConversionSupported()) {
              try {
                finalBlob = await AudioConverter.webmToWav(originalBlob);
                console.log('✅ Audio successfully converted to WAV');
              } catch (conversionError: any) {
                console.warn('⚠️ Audio conversion failed:', conversionError.message);
                console.warn('📤 Sending original WebM format (backend may reject)');
                finalBlob = originalBlob;
              }
            } else {
              console.warn('⚠️ Audio conversion not supported in this browser');
              console.warn('📤 Sending original format (backend may reject)');
              finalBlob = originalBlob;
            }
          }
          
          onStop(finalBlob);
          setRecordingCount(prev => prev + 1);
        } catch (error: any) {
          console.error('❌ Error processing recorded audio:', error);
          setErr(`Recording processing failed: ${error.message}`);
        } finally {
          setIsProcessing(false);
        }
      };
      
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (e: any) {
      setErr(e?.message ?? "Microphone error");
    }
  }

  function pause() {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (mr.state === "recording") {
      mr.pause();
      setIsPaused(true);
    }
  }

  function resume() {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (mr.state === "paused") {
      mr.resume();
      setIsPaused(false);
    }
  }

  function stop() {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (mr.state !== "inactive") {
      mr.stop();
      mr.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  }

  function reset() {
    // Reset for new recording session
    setRecordingCount(0);
    setErr(null);
    setIsRecording(false);
    setIsPaused(false);
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      } catch {}
      mediaRecorderRef.current = null;
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button 
          onClick={start} 
          disabled={disabled || isRecording || isProcessing} 
          style={btn}
        >
          {recordingCount > 0 ? 'Record More' : 'Start Recording'}
        </button>
        
        <button 
          onClick={pause} 
          disabled={disabled || !isRecording || isPaused || isProcessing} 
          style={btn}
        >
          Pause
        </button>
        
        <button 
          onClick={resume} 
          disabled={disabled || !isRecording || !isPaused || isProcessing} 
          style={btn}
        >
          Resume
        </button>
        
        <button 
          onClick={stop} 
          disabled={disabled || !isRecording || isProcessing} 
          style={btnPrimary}
        >
          {isProcessing ? 'Processing...' : 'Stop & Transcribe'}
        </button>
        
        {allowMultiple && recordingCount > 0 && (
          <button 
            onClick={reset} 
            disabled={disabled || isRecording || isProcessing} 
            style={btnSecondary}
          >
            Reset
          </button>
        )}
      </div>
      
      {err && <div style={{ color: '#b91c1c', fontSize: '14px' }}>{err}</div>}
      
      {recordingCount > 0 && (
        <div style={{ color: '#065f46', fontSize: '14px' }}>
          Recordings: {recordingCount} {allowMultiple ? '(can record more)' : '(max reached)'}
        </div>
      )}
      
      {isRecording && (
        <div style={{ color: '#dc2626', fontSize: '14px', fontWeight: 'bold' }}>
          🔴 Recording... {isPaused && '(Paused)'}
        </div>
      )}
      
      {isProcessing && (
        <div style={{ color: '#2563eb', fontSize: '14px', fontWeight: 'bold' }}>
          🔄 Processing audio...
        </div>
      )}
    </div>
  );
}

const btn: React.CSSProperties = { 
  padding: '8px 12px', 
  borderRadius: 6, 
  border: '1px solid #d1d5db', 
  background: '#fff', 
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

const btnPrimary: React.CSSProperties = { 
  padding: '8px 12px', 
  borderRadius: 6, 
  border: '1px solid #2563eb', 
  background: '#2563eb', 
  color: '#fff', 
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

const btnSecondary: React.CSSProperties = { 
  padding: '8px 12px', 
  borderRadius: 6, 
  border: '1px solid #dc2626', 
  background: '#fff', 
  color: '#dc2626', 
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};
