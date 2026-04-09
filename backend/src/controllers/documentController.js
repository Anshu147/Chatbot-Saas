import Document from '../models/Document.js';
import Chatbot from '../models/Chatbot.js';
import { processDocument } from '../utils/documentProcessor.js';
import { storeDocumentChunks, deleteDocumentVectors } from '../services/vectorStoreService.js';
import path from 'path';
import fs from 'fs/promises';

// @desc    Upload and process document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res) => {
    try {
        const { chatbotId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!chatbotId) {
            return res.status(400).json({ message: 'Chatbot ID is required' });
        }

        // Verify chatbot exists and belongs to user
        const chatbot = await Chatbot.findOne({
            _id: chatbotId,
            userId: req.user._id,
        });

        if (!chatbot) {
            // Delete uploaded file
            await fs.unlink(req.file.path);
            return res.status(404).json({ message: 'Chatbot not found' });
        }

        // Determine file type
        const fileType = path.extname(req.file.originalname).slice(1).toLowerCase();

        // Create document record
        const document = await Document.create({
            chatbotId,
            filename: req.file.filename,
            originalName: req.file.originalname,
            fileType,
            fileSize: req.file.size,
            filePath: req.file.path,
            processingStatus: 'processing',
        });

        // Process document asynchronously
        processDocumentAsync(document._id, req.file.path, fileType, chatbot.vectorNamespace);

        res.status(201).json({
            success: true,
            message: 'Document uploaded and processing started',
            document: {
                id: document._id,
                filename: document.originalName,
                status: document.processingStatus,
            },
        });
    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({ message: 'Failed to upload document' });
    }
};

/**
 * Process document asynchronously
 */
const processDocumentAsync = async (documentId, filePath, fileType, namespace) => {
    try {
        // Process the document
        const result = await processDocument(filePath, fileType);

        // Store chunks in vector database
        await storeDocumentChunks(
            result.chunks,
            documentId,
            namespace.split('_')[1], // Extract chatbot ID from namespace
            namespace
        );

        // Update document status
        await Document.findByIdAndUpdate(documentId, {
            processingStatus: 'completed',
            chunkCount: result.chunkCount,
            metadata: {
                pageCount: result.metadata?.pageCount,
                wordCount: result.wordCount,
                extractedAt: new Date(),
            },
            processedAt: new Date(),
        });

        console.log(`✅ Document ${documentId} processed successfully`);
    } catch (error) {
        console.error(`❌ Document processing failed for ${documentId}:`, error);

        // Update document with error
        await Document.findByIdAndUpdate(documentId, {
            processingStatus: 'failed',
            errorMessage: error.message,
        });
    }
};

// @desc    Get all documents for a chatbot
// @route   GET /api/documents/:chatbotId
// @access  Private
export const getDocuments = async (req, res) => {
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

        // Get all documents
        const documents = await Document.find({ chatbotId })
            .sort({ uploadedAt: -1 })
            .select('-filePath'); // Don't expose file system path

        res.json({
            success: true,
            documents,
        });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        // Find document
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Verify chatbot belongs to user
        const chatbot = await Chatbot.findOne({
            _id: document.chatbotId,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete vectors from Pinecone
        if (document.processingStatus === 'completed') {
            await deleteDocumentVectors(document._id, chatbot.vectorNamespace);
        }

        // Delete file from filesystem
        try {
            await fs.unlink(document.filePath);
        } catch (error) {
            console.error('Failed to delete file:', error);
        }

        // Delete document record
        await document.deleteOne();

        res.json({
            success: true,
            message: 'Document deleted successfully',
        });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ message: 'Failed to delete document' });
    }
};

// @desc    Get document processing status
// @route   GET /api/documents/:id/status
// @access  Private
export const getDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Verify access
        const chatbot = await Chatbot.findOne({
            _id: document.chatbotId,
            userId: req.user._id,
        });

        if (!chatbot) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({
            success: true,
            status: document.processingStatus,
            chunkCount: document.chunkCount,
            errorMessage: document.errorMessage,
            processedAt: document.processedAt,
        });
    } catch (error) {
        console.error('Get document status error:', error);
        res.status(500).json({ message: 'Failed to get document status' });
    }
};