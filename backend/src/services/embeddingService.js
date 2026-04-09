import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';

let embeddingModel = null;

/**
 * Initialize the embedding model
 */
export const initializeEmbeddings = () => {
    if (!process.env.HUGGINGFACE_API_KEY) {
        throw new Error('HUGGINGFACE_API_KEY is not set in environment variables');
    }

    embeddingModel = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACE_API_KEY,
        model: 'sentence-transformers/all-MiniLM-L6-v2', // 384 dimensions
    });

    console.log('✅ Embedding model initialized');
    return embeddingModel;
};

/**
 * Get the embedding model instance
 */
export const getEmbeddingModel = () => {
    if (!embeddingModel) {
        return initializeEmbeddings();
    }
    return embeddingModel;
};

/**
 * Generate embeddings for a single text
 */
export const generateEmbedding = async (text) => {
    try {
        const model = getEmbeddingModel();
        const embedding = await model.embedQuery(text);
        return embedding;
    } catch (error) {
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
};

/**
 * Generate embeddings for multiple texts (batch)
 */
export const generateEmbeddings = async (texts) => {
    try {
        const model = getEmbeddingModel();
        const embeddings = await model.embedDocuments(texts);
        return embeddings;
    } catch (error) {
        throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
};