import type { PipelineType } from "@xenova/transformers";

// Lazy singleton loader for speech-to-text pipeline
let pipelinePromise: Promise<any> | null = null;

export async function loadASR() {
  if (!pipelinePromise) {
    // Use a small Whisper model to reduce download size; Xenova provides onnx models
    pipelinePromise = (async () => {
      const { pipeline } = await import("@xenova/transformers");
      // Automatic speech recognition pipeline
      const asr = await pipeline("automatic-speech-recognition" as PipelineType, "Xenova/whisper-tiny.en");
      return asr;
    })();
  }
  return pipelinePromise;
}

export async function transcribeWavBlob(audio: Blob): Promise<string> {
  const asr = await loadASR();
  const arrayBuffer = await audio.arrayBuffer();
  // Transformers.js accepts raw PCM/WAV buffer
  const result = await asr(arrayBuffer);
  const text: string = (result?.text ?? "").trim();
  return text;
}


