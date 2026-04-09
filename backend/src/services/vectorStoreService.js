import { v4 as uuidv4 } from 'uuid';
import { getPineconeClient } from '../config/pinecone.js';
import { generateEmbeddings } from './embeddingService.js';

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'chatbot-saas';

/**
 * Store document chunks in Pinecone
 */
export const storeDocumentChunks = async (chunks, documentId, chatbotId, namespace) => {
    try {
        const client = getPineconeClient();
        const index = client.index(INDEX_NAME);

        // Generate embeddings for all chunks
        const texts = chunks.map(chunk => chunk.content);
        const embeddings = await generateEmbeddings(texts);

        // Prepare vectors for Pinecone
        const vectors = chunks.map((chunk, i) => ({
            id: uuidv4(),
            values: embeddings[i],
            metadata: {
                documentId: documentId.toString(),
                chatbotId: chatbotId.toString(),
                chunkIndex: chunk.index,
                content: chunk.content,
                timestamp: new Date().toISOString(),
            },
        }));

        // Upsert to Pinecone with namespace
        await index.namespace(namespace).upsert(vectors);

        console.log(`✅ Stored ${vectors.length} chunks in Pinecone (namespace: ${namespace})`);

        return {
            vectorCount: vectors.length,
            namespace,
        };
    } catch (error) {
        throw new Error(`Failed to store chunks in vector DB: ${error.message}`);
    }
};

/**
 * Search for similar chunks
 */
export const searchSimilarChunks = async (query, namespace, topK = 5) => {
    try {
        const client = getPineconeClient();
        const index = client.index(INDEX_NAME);

        // Generate embedding for query
        const { generateEmbedding } = await import('./embeddingService.js');
        const queryEmbedding = await generateEmbedding(query);

        // Search in Pinecone
        const results = await index.namespace(namespace).query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true,
        });

        // Format results
        const matches = results.matches.map(match => ({
            content: match.metadata.content,
            score: match.score,
            documentId: match.metadata.documentId,
            chunkIndex: match.metadata.chunkIndex,
        }));

        return matches;
    } catch (error) {
        throw new Error(`Failed to search vector DB: ${error.message}`);
    }
};

/**
 * Delete all vectors for a document
 */
export const deleteDocumentVectors = async (documentId, namespace) => {
    try {
        const client = getPineconeClient();
        const index = client.index(INDEX_NAME);

        // Delete by metadata filter
        await index.namespace(namespace).deleteMany({
            documentId: documentId.toString(),
        });

        console.log(`✅ Deleted vectors for document ${documentId} from namespace ${namespace}`);
    } catch (error) {
        throw new Error(`Failed to delete document vectors: ${error.message}`);
    }
};

/**
 * Delete all vectors in a namespace (entire chatbot)
 */
export const deleteNamespace = async (namespace) => {
    try {
        const client = getPineconeClient();
        const index = client.index(INDEX_NAME);

        await index.namespace(namespace).deleteAll();

        console.log(`✅ Deleted all vectors from namespace ${namespace}`);
    } catch (error) {
        throw new Error(`Failed to delete namespace: ${error.message}`);
    }
};