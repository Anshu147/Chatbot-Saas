import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    confidence: Number, // AI confidence score
    sources: [{ // For source attribution
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        documentName: String,
        chunkIndex: Number
    }]
});

const conversationSchema = new mongoose.Schema({
    chatbotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chatbot',
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    messages: [messageSchema],
    userInfo: {
        ipAddress: String,
        userAgent: String,
        location: String
    },
    satisfaction: {
        rating: { type: Number, min: 1, max: 5 },
        feedback: String,
        submittedAt: Date
    },
    escalated: {
        type: Boolean,
        default: false
    },
    escalatedAt: Date,
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: Date
});

// Index for fast queries
conversationSchema.index({ chatbotId: 1, startedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;