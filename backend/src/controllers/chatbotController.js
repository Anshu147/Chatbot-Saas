import Chatbot from '../models/Chatbot.js';
import Document from '../models/Document.js';
import Conversation from '../models/Conversation.js';
import { deleteNamespace } from '../services/vectorStoreService.js';

// @desc    Create new chatbot
// @route   POST /api/chatbots
// @access  Private
export const createChatbot = async (req, res) => {
    try {
        const { name, config } = req.body;

        // Create chatbot
        const chatbot = await Chatbot.create({
            userId: req.user._id,
            name,
            config: config || {},
        });

        res.status(201).json({
            success: true,
            chatbot,
        });
    } catch (error) {
        console.error('Create chatbot error:', error);
        res.status(500).json({ message: 'Failed to create chatbot' });
    }
};

// @desc    Get all chatbots for current user
// @route   GET /api/chatbots
// @access  Private
export const getChatbots = async (req, res) => {
    try {
        const chatbots = await Chatbot.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        // Get document count for each chatbot
        const chatbotsWithStats = await Promise.all(
            chatbots.map(async (chatbot) => {
                const documentCount = await Document.countDocuments({
                    chatbotId: chatbot._id
                });

                const conversationCount = await Conversation.countDocuments({
                    chatbotId: chatbot._id
                });

                return {
                    ...chatbot.toObject(),
                    stats: {
                        documentCount,
                        conversationCount,
                    },
                };
            })
        );

        res.json({
            success: true,
            chatbots: chatbotsWithStats,
        });
    } catch (error) {
        console.error('Get chatbots error:', error);
        res.status(500).json({ message: 'Failed to fetch chatbots' });
    }
};

// @desc    Get single chatbot
// @route   GET /api/chatbots/:id
// @access  Private
export const getChatbot = async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        // Get stats
        const documentCount = await Document.countDocuments({
            chatbotId: chatbot._id
        });

        const conversationCount = await Conversation.countDocuments({
            chatbotId: chatbot._id
        });

        res.json({
            success: true,
            chatbot: {
                ...chatbot.toObject(),
                stats: {
                    documentCount,
                    conversationCount,
                },
            },
        });
    } catch (error) {
        console.error('Get chatbot error:', error);
        res.status(500).json({ message: 'Failed to fetch chatbot' });
    }
};

// @desc    Update chatbot
// @route   PUT /api/chatbots/:id
// @access  Private
export const updateChatbot = async (req, res) => {
    try {
        const { name, config, isActive } = req.body;

        const chatbot = await Chatbot.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        // Update fields
        if (name) chatbot.name = name;
        if (config) chatbot.config = { ...chatbot.config, ...config };
        if (typeof isActive !== 'undefined') chatbot.isActive = isActive;

        await chatbot.save();

        res.json({
            success: true,
            chatbot,
        });
    } catch (error) {
        console.error('Update chatbot error:', error);
        res.status(500).json({ message: 'Failed to update chatbot' });
    }
};

// @desc    Delete chatbot
// @route   DELETE /api/chatbots/:id
// @access  Private
export const deleteChatbot = async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        // Delete all vectors from Pinecone
        try {
            await deleteNamespace(chatbot.vectorNamespace);
        } catch (error) {
            console.error('Failed to delete vectors:', error);
        }

        // Delete all documents
        await Document.deleteMany({ chatbotId: chatbot._id });

        // Delete all conversations
        await Conversation.deleteMany({ chatbotId: chatbot._id });

        // Delete chatbot
        await chatbot.deleteOne();

        res.json({
            success: true,
            message: 'Chatbot deleted successfully',
        });
    } catch (error) {
        console.error('Delete chatbot error:', error);
        res.status(500).json({ message: 'Failed to delete chatbot' });
    }
};

// @desc    Get chatbot embed code
// @route   GET /api/chatbots/:id/embed
// @access  Private
export const getEmbedCode = async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        const embedCode = `<!-- ChatBot Widget -->
<script src="${process.env.CLIENT_URL || 'http://localhost:3000'}/widget.js" 
        data-chatbot-id="${chatbot._id}"
        data-primary-color="${chatbot.config.appearance.primaryColor}"
        data-position="${chatbot.config.appearance.position}">
</script>`;

        res.json({
            success: true,
            embedCode,
            chatbotId: chatbot._id,
        });
    } catch (error) {
        console.error('Get embed code error:', error);
        res.status(500).json({ message: 'Failed to get embed code' });
    }
};

// @desc    Get public chatbot config (no auth)
// @route   GET /api/chatbots/:id/public
// @access  Public
export const getPublicChatbot = async (req, res) => {
    try {
        const chatbot = await Chatbot.findById(req.params.id)
            .select('name config isActive userId');

        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        if (!chatbot.isActive) {
            return res.status(403).json({ message: 'Chatbot is inactive' });
        }

        res.json({
            success: true,
            chatbot: {
                _id: chatbot._id,
                name: chatbot.name,
                config: chatbot.config,
            },
        });
    } catch (error) {
        console.error('Get public chatbot error:', error);
        res.status(500).json({ message: 'Failed to fetch chatbot config' });
    }
};