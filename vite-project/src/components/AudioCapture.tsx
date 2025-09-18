import { useEffect, useRef, useState } from "react";

export interface AudioCaptureProps {
  onStop: (blob: Blob) => void;
  disabled?: boolean;
}

// Simple recorder: single recording per mount; supports pause/resume; no restart after stop
export default function AudioCapture({ onStop, disabled }: AudioCaptureProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      try { mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop()); } catch {}
    };
  }, []);

  async function start() {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onStop(blob);
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
      setStopped(true);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={start} disabled={disabled || isRecording || stopped} style={btn}>Start</button>
        <button onClick={pause} disabled={disabled || !isRecording || isPaused} style={btn}>Pause</button>
        <button onClick={resume} disabled={disabled || !isRecording || !isPaused} style={btn}>Resume</button>
        <button onClick={stop} disabled={disabled || !isRecording} style={btnPrimary}>Stop</button>
      </div>
      {err && <div style={{ color: '#b91c1c' }}>{err}</div>}
      {stopped && <div style={{ color: '#065f46' }}>Recording completed. You cannot restart for this question.</div>}
    </div>
  );
}

const btn: React.CSSProperties = { padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' };
const btnPrimary: React.CSSProperties = { padding: '6px 10px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff', cursor: 'pointer' };


