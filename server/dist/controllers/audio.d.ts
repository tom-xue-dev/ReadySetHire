import { Request, Response } from 'express';
export declare class AudioController {
    private asrService;
    constructor();
    /**
     * Upload and transcribe audio file
     */
    uploadAndTranscribe: (req: Request, res: Response) => Promise<void>;
    /**
     * Check ASR service availability
     */
    checkAvailability: (req: Request, res: Response) => Promise<void>;
    /**
     * Get multer middleware for file upload
     */
    getUploadMiddleware(): import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
}
export default AudioController;
//# sourceMappingURL=audio.d.ts.map