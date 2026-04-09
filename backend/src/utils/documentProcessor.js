import fs from 'fs/promises';
import mammoth from 'mammoth';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// Use pdfjs-dist directly — import the worker source into the main thread
// so we completely avoid LoopbackPort/structuredClone transfer issues.
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * Extract text from PDF file
 */
export const extractPdfText = async (filePath) => {
    let doc;
    try {
        const dataBuffer = await fs.readFile(filePath);
        const uint8 = new Uint8Array(
            dataBuffer.buffer.slice(
                dataBuffer.byteOffset,
                dataBuffer.byteOffset + dataBuffer.byteLength
            )
        );

        const loadingTask = pdfjs.getDocument({
            data: uint8,
            useSystemFonts: true,
            verbosity: 0, // suppress warnings
        });
        doc = await loadingTask.promise;

        // Extract text from all pages
        const textParts = [];
        for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .filter(item => 'str' in item)
                .map(item => item.str)
                .join('');
            textParts.push(pageText);
            page.cleanup();
        }

        const text = textParts.join('\n\n');
        const info = await doc.getMetadata().catch(() => ({ info: {} }));

        return {
            text,
            pageCount: doc.numPages,
            metadata: {
                info: info.info || {},
                pageCount: doc.numPages,
            },
        };
    } catch (error) {
        throw new Error(`PDF extraction failed: ${error.message}`);
    } finally {
        if (doc) {
            await doc.destroy().catch(() => {});
        }
    }
};

/**
 * Extract text from DOCX file
 */
export const extractDocxText = async (filePath) => {
    try {
        const result = await mammoth.extractRawText({ path: filePath });

        return {
            text: result.value,
            metadata: {
                messages: result.messages,
            },
        };
    } catch (error) {
        throw new Error(`DOCX extraction failed: ${error.message}`);
    }
};

/**
 * Extract text from TXT file
 */
export const extractTxtText = async (filePath) => {
    try {
        const text = await fs.readFile(filePath, 'utf-8');

        return {
            text: text,
            metadata: {},
        };
    } catch (error) {
        throw new Error(`TXT extraction failed: ${error.message}`);
    }
};

/**
 * Main text extraction function based on file type
 */
export const extractText = async (filePath, fileType) => {
    switch (fileType.toLowerCase()) {
        case 'pdf':
            return await extractPdfText(filePath);
        case 'docx':
            return await extractDocxText(filePath);
        case 'txt':
            return await extractTxtText(filePath);
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
};

/**
 * Split text into chunks using LangChain
 */
export const splitTextIntoChunks = async (text, options = {}) => {
    const {
        chunkSize = 1000,
        chunkOverlap = 200,
    } = options;

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
    });

    const chunks = await splitter.createDocuments([text]);

    return chunks.map((chunk, index) => ({
        content: chunk.pageContent,
        index,
        metadata: chunk.metadata,
    }));
};

/**
 * Calculate word count
 */
export const getWordCount = (text) => {
    return text.trim().split(/\s+/).length;
};

/**
 * Process document: extract text and split into chunks
 */
export const processDocument = async (filePath, fileType, options = {}) => {
    try {
        // Extract text
        const { text, metadata } = await extractText(filePath, fileType);

        if (!text || text.trim().length === 0) {
            throw new Error('No text content found in document');
        }

        // Split into chunks
        const chunks = await splitTextIntoChunks(text, options);

        // Calculate statistics
        const wordCount = getWordCount(text);

        return {
            text,
            chunks,
            wordCount,
            chunkCount: chunks.length,
            metadata,
        };
    } catch (error) {
        throw new Error(`Document processing failed: ${error.message}`);
    }
};