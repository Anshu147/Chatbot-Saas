import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getAnalyticsOverview,
    getConversationTrends,
    getPopularQuestions,
    getResponseTimes,
    getConversations,
    getConversationDetail,
} from '../controllers/analyticsController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Analytics routes
router.get('/:chatbotId/overview', getAnalyticsOverview);
router.get('/:chatbotId/trends', getConversationTrends);
router.get('/:chatbotId/popular-questions', getPopularQuestions);
router.get('/:chatbotId/response-times', getResponseTimes);
router.get('/:chatbotId/conversations', getConversations);
router.get('/:chatbotId/conversations/:conversationId', getConversationDetail);

export default router;