import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    return () => {
      try { 
        mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop()); 
      } catch {} 
    };
  }, []);

  async function start() {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mr.ondataavailable = (e) => { 
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data); 
      };
      
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onStop(blob);
        setRecordingCount(prev => prev + 1);
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
          disabled={disabled || isRecording} 
          style={btn}
        >
          {recordingCount > 0 ? 'Record More' : 'Start Recording'}
        </button>
        
        <button 
          onClick={pause} 
          disabled={disabled || !isRecording || isPaused} 
          style={btn}
        >
          Pause
        </button>
        
        <button 
          onClick={resume} 
          disabled={disabled || !isRecording || !isPaused} 
          style={btn}
        >
          Resume
        </button>
        
        <button 
          onClick={stop} 
          disabled={disabled || !isRecording} 
          style={btnPrimary}
        >
          Stop & Transcribe
        </button>
        
        {allowMultiple && recordingCount > 0 && (
          <button 
            onClick={reset} 
            disabled={disabled || isRecording} 
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
