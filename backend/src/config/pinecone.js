import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient = null;

export const initializePinecone = async () => {
    try {
        if (!process.env.PINECONE_API_KEY) {
            throw new Error('PINECONE_API_KEY is not set in environment variables');
        }

        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });

        console.log('✅ Pinecone initialized successfully');
        return pineconeClient;
    } catch (error) {
        console.error('❌ Failed to initialize Pinecone:', error.message);
        throw error;
    }
};

export const getPineconeClient = () => {
    if (!pineconeClient) {
        throw new Error('Pinecone client not initialized. Call initializePinecone() first.');
    }
    return pineconeClient;
};

/**
 * Get or create an index
 */
export const getOrCreateIndex = async (indexName) => {
    try {
        const client = getPineconeClient();

        // Check if index exists
        const indexList = await client.listIndexes();
        const indexExists = indexList.indexes?.some(index => index.name === indexName);

        if (!indexExists) {
            console.log(`Creating new Pinecone index: ${indexName}`);

            await client.createIndex({
                name: indexName,
                dimension: 384, // for all-MiniLM-L6-v2 model
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'
                    }
                }
            });

            // Wait for index to be ready
            await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds
        }

        return client.index(indexName);
    } catch (error) {
        throw new Error(`Failed to get/create index: ${error.message}`);
    }
};