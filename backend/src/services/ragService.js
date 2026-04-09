import { searchSimilarChunks } from './vectorStoreService.js';
import { generateChatCompletion, generateStreamingChatCompletion } from './groqService.js';

/**
 * Build context from retrieved chunks
 */
const buildContext = (chunks) => {
    if (!chunks || chunks.length === 0) {
        return '';
    }

    const context = chunks
        .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
        .join('\n\n');

    return context;
};

/**
 * Build system prompt with context
 */
const buildSystemPrompt = (context, chatbotConfig) => {
    const botName = chatbotConfig?.appearance?.botName || 'Assistant';

    let systemPrompt = `You are ${botName}, a helpful AI assistant. `;

    if (context) {
        systemPrompt += `Use the following context to answer the user's question. If the answer is not in the context, say so politely and offer to help with something else.\n\nContext:\n${context}`;
    } else {
        systemPrompt += `Answer the user's questions helpfully and concisely.`;
    }

    return systemPrompt;
};

/**
 * Generate response using RAG
 */
export const generateRAGResponse = async (
    query,
    namespace,
    conversationHistory = [],
    chatbotConfig = {},
    options = {}
) => {
    try {
        // Step 1: Retrieve relevant chunks from vector DB
        const chunks = await searchSimilarChunks(query, namespace, options.topK || 3);

        // Step 2: Build context from chunks
        const context = buildContext(chunks);

        // Step 3: Calculate confidence score (average of top chunks)
        const confidence = chunks.length > 0
            ? chunks.reduce((sum, chunk) => sum + chunk.score, 0) / chunks.length
            : 0;

        // Step 4: Build system prompt
        const systemPrompt = buildSystemPrompt(context, chatbotConfig);

        // Step 5: Prepare messages for LLM
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: query },
        ];

        // Step 6: Generate response
        const completion = await generateChatCompletion(messages, options);

        const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

        // Step 7: Format sources
        const sources = chunks.map((chunk) => ({
            documentId: chunk.documentId,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content.substring(0, 200) + '...', // Preview
            score: chunk.score,
        }));

        return {
            response,
            confidence,
            sources,
            hasContext: chunks.length > 0,
        };
    } catch (error) {
        throw new Error(`RAG generation failed: ${error.message}`);
    }
};

/**
 * Generate streaming response using RAG
 */
export const generateRAGStreamingResponse = async (
    query,
    namespace,
    conversationHistory = [],
    chatbotConfig = {},
    options = {}
) => {
    try {
        // Retrieve relevant chunks
        const chunks = await searchSimilarChunks(query, namespace, options.topK || 3);

        // Build context and system prompt
        const context = buildContext(chunks);
        const systemPrompt = buildSystemPrompt(context, chatbotConfig);

        // Calculate confidence
        const confidence = chunks.length > 0
            ? chunks.reduce((sum, chunk) => sum + chunk.score, 0) / chunks.length
            : 0;

        // Prepare messages
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: query },
        ];

        // Generate streaming response
        const stream = await generateStreamingChatCompletion(messages, options);

        // Format sources
        const sources = chunks.map((chunk) => ({
            documentId: chunk.documentId,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content.substring(0, 200) + '...',
            score: chunk.score,
        }));

        return {
            stream,
            confidence,
            sources,
            hasContext: chunks.length > 0,
        };
    } catch (error) {
        throw new Error(`RAG streaming failed: ${error.message}`);
    }
};