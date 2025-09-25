"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASRService = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class ASRService {
    static instance;
    tempDir;
    constructor() {
        this.tempDir = path.join(os.tmpdir(), 'readysethire-asr');
        this.ensureTempDir();
    }
    static getInstance() {
        if (!ASRService.instance) {
            ASRService.instance = new ASRService();
        }
        return ASRService.instance;
    }
    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }
    /**
     * Transcribe audio file using Whisper
     * @param audioBuffer - Audio file buffer
     * @param filename - Original filename for extension detection
     * @returns Promise<ASRResult>
     */
    async transcribeAudio(audioBuffer, filename) {
        const tempFilePath = path.join(this.tempDir, `temp_${Date.now()}_${filename}`);
        try {
            // Write buffer to temporary file
            fs.writeFileSync(tempFilePath, audioBuffer);
            // Use Whisper CLI for transcription
            const result = await this.runWhisperTranscription(tempFilePath);
            return {
                text: result.trim(),
                language: 'en' // Default to English, could be detected
            };
        }
        catch (error) {
            console.error('ASR transcription failed:', error);
            throw new Error(`Audio transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            // Clean up temporary file
            this.cleanupFile(tempFilePath);
        }
    }
    /**
     * Run Whisper transcription using Python subprocess
     */
    async runWhisperTranscription(audioFilePath) {
        return new Promise((resolve, reject) => {
            // Try different Whisper implementations
            const commands = [
                // Try OpenAI Whisper CLI first
                {
                    cmd: 'whisper',
                    args: [audioFilePath, '--model', 'tiny.en', '--output_format', 'txt', '--output_dir', this.tempDir]
                },
                // Try whisper-ctranslate2 as alternative
                {
                    cmd: 'whisper-ctranslate2',
                    args: [audioFilePath, '--model', 'tiny.en', '--output_format', 'txt', '--output_dir', this.tempDir]
                },
                // Try faster-whisper as fallback
                {
                    cmd: 'faster-whisper',
                    args: [audioFilePath, '--model', 'tiny.en', '--output_format', 'txt', '--output_dir', this.tempDir]
                }
            ];
            this.tryWhisperCommands(commands, audioFilePath, resolve, reject);
        });
    }
    tryWhisperCommands(commands, audioFilePath, resolve, reject) {
        if (commands.length === 0) {
            reject(new Error('No Whisper implementation found. Please install whisper, whisper-ctranslate2, or faster-whisper.'));
            return;
        }
        const { cmd, args } = commands[0];
        const remainingCommands = commands.slice(1);
        console.log(`🎤 Trying Whisper command: ${cmd} ${args.join(' ')}`);
        const process = (0, child_process_1.spawn)(cmd, args, {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        let stdout = '';
        let stderr = '';
        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        process.on('close', (code) => {
            if (code === 0) {
                // Success - read the output file
                const outputFile = path.join(this.tempDir, path.basename(audioFilePath, path.extname(audioFilePath)) + '.txt');
                if (fs.existsSync(outputFile)) {
                    const transcription = fs.readFileSync(outputFile, 'utf-8');
                    this.cleanupFile(outputFile);
                    resolve(transcription);
                }
                else {
                    // If no output file, try next command
                    this.tryWhisperCommands(remainingCommands, audioFilePath, resolve, reject);
                }
            }
            else {
                console.warn(`Command ${cmd} failed with code ${code}: ${stderr}`);
                // Try next command
                this.tryWhisperCommands(remainingCommands, audioFilePath, resolve, reject);
            }
        });
        process.on('error', (error) => {
            console.warn(`Command ${cmd} error:`, error.message);
            // Try next command
            this.tryWhisperCommands(remainingCommands, audioFilePath, resolve, reject);
        });
    }
    /**
     * Clean up temporary file
     */
    cleanupFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.warn(`Failed to cleanup file ${filePath}:`, error);
        }
    }
    /**
     * Check if ASR is available (any Whisper implementation installed)
     */
    async isAvailable() {
        return new Promise((resolve) => {
            const commands = ['whisper', 'whisper-ctranslate2', 'faster-whisper'];
            let checked = 0;
            const checkCommand = (cmd) => {
                const process = (0, child_process_1.spawn)(cmd, ['--help'], { stdio: 'pipe' });
                process.on('close', (code) => {
                    checked++;
                    if (code === 0) {
                        resolve(true);
                    }
                    else if (checked === commands.length) {
                        resolve(false);
                    }
                });
                process.on('error', () => {
                    checked++;
                    if (checked === commands.length) {
                        resolve(false);
                    }
                });
            };
            commands.forEach(checkCommand);
        });
    }
}
exports.ASRService = ASRService;
exports.default = ASRService;
//# sourceMappingURL=asr.js.map