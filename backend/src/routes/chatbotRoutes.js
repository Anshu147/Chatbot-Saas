import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import {
    createChatbot,
    getChatbots,
    getChatbot,
    updateChatbot,
    deleteChatbot,
    getEmbedCode,
    getPublicChatbot,
} from '../controllers/chatbotController.js';

const router = express.Router();

// Public routes
router.get('/:id/public', getPublicChatbot);

// All routes below are protected
router.use(protect);

// Validation
const createChatbotValidation = [
    body('name').trim().notEmpty().withMessage('Chatbot name is required'),
    handleValidationErrors,
];

// Routes
router.post('/', createChatbotValidation, createChatbot);
router.get('/', getChatbots);
router.get('/:id', getChatbot);
router.put('/:id', updateChatbot);
router.delete('/:id', deleteChatbot);
router.get('/:id/embed', getEmbedCode);

export default router;