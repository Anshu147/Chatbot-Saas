import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    chatbotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chatbot',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    originalName: String,
    fileType: {
        type: String,
        enum: ['pdf', 'txt', 'docx', 'url'],
        required: true
    },
    fileSize: Number, // in bytes
    filePath: String, // Storage path
    chunkCount: {
        type: Number,
        default: 0
    },
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    errorMessage: String,
    metadata: {
        pageCount: Number,
        wordCount: Number,
        extractedAt: Date
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: Date
});

const Document = mongoose.model('Document', documentSchema);

export default Document;