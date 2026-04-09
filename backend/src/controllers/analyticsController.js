import Conversation from '../models/Conversation.js';
import Chatbot from '../models/Chatbot.js';
import Document from '../models/Document.js';

// @desc    Get chatbot analytics overview
// @route   GET /api/analytics/:chatbotId/overview
// @access  Private
export const getAnalyticsOverview = async (req, res) => {
    try {
        const { chatbotId } = req.params;
        const { timeRange = '7d' } = req.query;

        // Verify chatbot belongs to user
        const chatbot = await Chatbot.findOne({
            _id: chatbotId,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        // Calculate date range
        const now = new Date();
        const timeRanges = {
            '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
            '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        };

        const startDate = timeRanges[timeRange] || timeRanges['7d'];

        // Get total conversations
        const totalConversations = await Conversation.countDocuments({
            chatbotId,
            startedAt: { $gte: startDate },
        });

        // Get total messages
        const conversations = await Conversation.find({
            chatbotId,
            startedAt: { $gte: startDate },
        });

        const totalMessages = conversations.reduce(
            (sum, conv) => sum + conv.messages.length,
            0
        );

        // Calculate average messages per conversation
        const avgMessagesPerConversation = totalConversations > 0
            ? (totalMessages / totalConversations).toFixed(2)
            : 0;

        // Get satisfaction ratings
        const conversationsWithRatings = conversations.filter(
            (conv) => conv.satisfaction && conv.satisfaction.rating
        );

        const avgSatisfaction = conversationsWithRatings.length > 0
            ? (
                conversationsWithRatings.reduce(
                    (sum, conv) => sum + conv.satisfaction.rating,
                    0
                ) / conversationsWithRatings.length
            ).toFixed(2)
            : 0;

        // Get escalation rate
        const escalatedConversations = await Conversation.countDocuments({
            chatbotId,
            startedAt: { $gte: startDate },
            escalated: true,
        });

        const escalationRate = totalConversations > 0
            ? ((escalatedConversations / totalConversations) * 100).toFixed(2)
            : 0;

        // Get average confidence score
        const allMessages = conversations.flatMap((conv) =>
            conv.messages.filter((msg) => msg.role === 'assistant' && msg.confidence)
        );

        const avgConfidence = allMessages.length > 0
            ? (
                allMessages.reduce((sum, msg) => sum + msg.confidence, 0) /
                allMessages.length
            ).toFixed(2)
            : 0;

        // Get document count
        const documentCount = await Document.countDocuments({
            chatbotId,
            processingStatus: 'completed',
        });

        res.json({
            success: true,
            analytics: {
                totalConversations,
                totalMessages,
                avgMessagesPerConversation: parseFloat(avgMessagesPerConversation),
                avgSatisfaction: parseFloat(avgSatisfaction),
                escalationRate: parseFloat(escalationRate),
                avgConfidence: parseFloat(avgConfidence),
                documentCount,
                satisfactionRatings: conversationsWithRatings.length,
            },
        });
    } catch (error) {
        console.error('Get analytics overview error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};

// @desc    Get conversation trends over time
// @route   GET /api/analytics/:chatbotId/trends
// @access  Private
export const getConversationTrends = async (req, res) => {
    try {
        const { chatbotId } = req.params;
        const { timeRange = '7d' } = req.query;

        // Verify chatbot belongs to user
        const chatbot = await Chatbot.findOne({
            _id: chatbotId,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        const now = new Date();
        const timeRanges = {
            '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
            '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        };

        const startDate = timeRanges[timeRange] || timeRanges['7d'];

        // Aggregate conversations by day
        const trends = await Conversation.aggregate([
            {
                $match: {
                    chatbotId: chatbot._id,
                    startedAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$startedAt' },
                    },
                    count: { $sum: 1 },
                    totalMessages: { $sum: { $size: '$messages' } },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        res.json({
            success: true,
            trends: trends.map((trend) => ({
                date: trend._id,
                conversations: trend.count,
                messages: trend.totalMessages,
            })),
        });
    } catch (error) {
        console.error('Get conversation trends error:', error);
        res.status(500).json({ message: 'Failed to fetch trends' });
    }
};

// @desc    Get popular questions
// @route   GET /api/analytics/:chatbotId/popular-questions
// @access  Private
export const getPopularQuestions = async (req, res) => {
    try {
        const { chatbotId } = req.params;
        const { limit = 10 } = req.query;

        // Verify chatbot belongs to user
        const chatbot = await Chatbot.findOne({
            _id: chatbotId,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        // Get all conversations
        const conversations = await Conversation.find({
            chatbotId,
        }).select('messages');

        // Extract user messages
        const userMessages = conversations.flatMap((conv) =>
            conv.messages
                .filter((msg) => msg.role === 'user')
                .map((msg) => msg.content.toLowerCase().trim())
        );

        // Count frequency
        const questionCounts = {};
        userMessages.forEach((msg) => {
            questionCounts[msg] = (questionCounts[msg] || 0) + 1;
        });

        // Sort by frequency
        const popularQuestions = Object.entries(questionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, parseInt(limit))
            .map(([question, count]) => ({
                question,
                count,
            }));

        res.json({
            success: true,
            questions: popularQuestions,
        });
    } catch (error) {
        console.error('Get popular questions error:', error);
        res.status(500).json({ message: 'Failed to fetch popular questions' });
    }
};

// @desc    Get response time stats
// @route   GET /api/analytics/:chatbotId/response-times
// @access  Private
export const getResponseTimes = async (req, res) => {
    try {
        const { chatbotId } = req.params;

        // Verify chatbot belongs to user
        const chatbot = await Chatbot.findOne({
            _id: chatbotId,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        // Get conversations with messages
        const conversations = await Conversation.find({
            chatbotId,
        }).select('messages');

        const responseTimes = [];

        conversations.forEach((conv) => {
            for (let i = 0; i < conv.messages.length - 1; i++) {
                const currentMsg = conv.messages[i];
                const nextMsg = conv.messages[i + 1];

                if (currentMsg.role === 'user' && nextMsg.role === 'assistant') {
                    const responseTime =
                        new Date(nextMsg.timestamp) - new Date(currentMsg.timestamp);
                    responseTimes.push(responseTime / 1000); // Convert to seconds
                }
            }
        });

        if (responseTimes.length === 0) {
            return res.json({
                success: true,
                stats: {
                    avgResponseTime: 0,
                    minResponseTime: 0,
                    maxResponseTime: 0,
                    totalResponses: 0,
                },
            });
        }

        const avgResponseTime =
            responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        const minResponseTime = Math.min(...responseTimes);
        const maxResponseTime = Math.max(...responseTimes);

        res.json({
            success: true,
            stats: {
                avgResponseTime: avgResponseTime.toFixed(2),
                minResponseTime: minResponseTime.toFixed(2),
                maxResponseTime: maxResponseTime.toFixed(2),
                totalResponses: responseTimes.length,
            },
        });
    } catch (error) {
        console.error('Get response times error:', error);
        res.status(500).json({ message: 'Failed to fetch response times' });
    }
};

// @desc    Get conversation list with filters
// @route   GET /api/analytics/:chatbotId/conversations
// @access  Private
export const getConversations = async (req, res) => {
    try {
        const { chatbotId } = req.params;
        const {
            page = 1,
            limit = 20,
            escalated,
            rated,
            startDate,
            endDate,
        } = req.query;

        // Verify chatbot belongs to user
        const chatbot = await Chatbot.findOne({
            _id: chatbotId,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        // Build query
        const query = { chatbotId };

        if (escalated !== undefined) {
            query.escalated = escalated === 'true';
        }

        if (rated === 'true') {
            query['satisfaction.rating'] = { $exists: true };
        }

        if (startDate || endDate) {
            query.startedAt = {};
            if (startDate) query.startedAt.$gte = new Date(startDate);
            if (endDate) query.startedAt.$lte = new Date(endDate);
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const conversations = await Conversation.find(query)
            .sort({ startedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-messages'); // Don't include full messages in list

        const total = await Conversation.countDocuments(query);

        res.json({
            success: true,
            conversations: conversations.map((conv) => ({
                id: conv._id,
                sessionId: conv.sessionId,
                messageCount: conv.messages?.length || 0,
                startedAt: conv.startedAt,
                endedAt: conv.endedAt,
                escalated: conv.escalated,
                escalatedAt: conv.escalatedAt,
                satisfaction: conv.satisfaction,
            })),
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
};

// @desc    Get single conversation details
// @route   GET /api/analytics/:chatbotId/conversations/:conversationId
// @access  Private
export const getConversationDetail = async (req, res) => {
    try {
        const { chatbotId, conversationId } = req.params;

        // Verify chatbot belongs to user
        const chatbot = await Chatbot.findOne({
            _id: chatbotId,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        const conversation = await Conversation.findOne({
            _id: conversationId,
            chatbotId,
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.json({
            success: true,
            conversation,
        });
    } catch (error) {
        console.error('Get conversation detail error:', error);
        res.status(500).json({ message: 'Failed to fetch conversation' });
    }
};