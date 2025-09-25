"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audio_1 = __importDefault(require("../controllers/audio"));
const router = (0, express_1.Router)();
const audioController = new audio_1.default();
/**
 * @route POST /api/audio/transcribe
 * @desc Upload and transcribe audio file
 * @access Public (for now, can add auth middleware later)
 */
router.post('/transcribe', audioController.getUploadMiddleware(), audioController.uploadAndTranscribe);
/**
 * @route GET /api/audio/availability
 * @desc Check if ASR service is available
 * @access Public
 */
router.get('/availability', audioController.checkAvailability);
exports.default = router;
//# sourceMappingURL=audio.js.map