import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/multer.js';
import {
    uploadDocument,
    getDocuments,
    deleteDocument,
    getDocumentStatus,
} from '../controllers/documentController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Upload document
router.post('/upload', upload.single('file'), uploadDocument);

// Get all documents for a chatbot
router.get('/:chatbotId', getDocuments);

// Get document status
router.get('/:id/status', getDocumentStatus);

// Delete document
router.delete('/:id', deleteDocument);

export default router;