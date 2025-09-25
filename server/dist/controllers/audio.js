"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioController = void 0;
const multer_1 = __importDefault(require("multer"));
const asr_1 = __importDefault(require("../services/asr"));
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files
        const allowedMimes = [
            'audio/wav',
            'audio/mp3',
            'audio/mpeg',
            'audio/mp4',
            'audio/m4a',
            'audio/webm',
            'audio/ogg',
            'audio/flac'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    }
});
class AudioController {
    asrService;
    constructor() {
        this.asrService = asr_1.default.getInstance();
    }
    /**
     * Upload and transcribe audio file
     */
    uploadAndTranscribe = async (req, res) => {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: 'No audio file provided'
                });
                return;
            }
            console.log(`🎤 Processing audio file: ${req.file.originalname} (${req.file.size} bytes)`);
            // Check if ASR is available
            const isAvailable = await this.asrService.isAvailable();
            if (!isAvailable) {
                res.status(503).json({
                    success: false,
                    error: 'Speech recognition service is not available. Please install Whisper CLI tools.'
                });
                return;
            }
            // Transcribe the audio
            const result = await this.asrService.transcribeAudio(req.file.buffer, req.file.originalname);
            res.json({
                success: true,
                data: {
                    transcription: result.text,
                    language: result.language,
                    confidence: result.confidence,
                    filename: req.file.originalname,
                    size: req.file.size
                }
            });
        }
        catch (error) {
            console.error('Audio transcription error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Audio transcription failed'
            });
        }
    };
    /**
     * Check ASR service availability
     */
    checkAvailability = async (req, res) => {
        try {
            const isAvailable = await this.asrService.isAvailable();
            res.json({
                success: true,
                data: {
                    available: isAvailable,
                    message: isAvailable
                        ? 'Speech recognition service is available'
                        : 'Speech recognition service is not available. Please install Whisper CLI tools.'
                }
            });
        }
        catch (error) {
            console.error('ASR availability check error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to check ASR availability'
            });
        }
    };
    /**
     * Get multer middleware for file upload
     */
    getUploadMiddleware() {
        return upload.single('audio');
    }
}
exports.AudioController = AudioController;
exports.default = AudioController;
//# sourceMappingURL=audio.js.map