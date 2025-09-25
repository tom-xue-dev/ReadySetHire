export interface ASRResult {
    text: string;
    confidence?: number;
    language?: string;
}
export declare class ASRService {
    private static instance;
    private tempDir;
    private constructor();
    static getInstance(): ASRService;
    private ensureTempDir;
    /**
     * Transcribe audio file using Whisper
     * @param audioBuffer - Audio file buffer
     * @param filename - Original filename for extension detection
     * @returns Promise<ASRResult>
     */
    transcribeAudio(audioBuffer: Buffer, filename: string): Promise<ASRResult>;
    /**
     * Run Whisper transcription using Python subprocess
     */
    private runWhisperTranscription;
    private tryWhisperCommands;
    /**
     * Clean up temporary file
     */
    private cleanupFile;
    /**
     * Check if ASR is available (any Whisper implementation installed)
     */
    isAvailable(): Promise<boolean>;
}
export default ASRService;
//# sourceMappingURL=asr.d.ts.map