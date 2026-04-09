import Groq from 'groq-sdk';

let groqClient = null;

/**
 * Initialize Groq client
 */
export const initializeGroq = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    groqClient = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    console.log('✅ Groq client initialized');
    return groqClient;
};

/**
 * Get Groq client instance
 */
export const getGroqClient = () => {
    if (!groqClient) {
        return initializeGroq();
    }
    return groqClient;
};

/**
 * Generate chat completion
 */
export const generateChatCompletion = async (messages, options = {}) => {
    try {
        const client = getGroqClient();

        const completion = await client.chat.completions.create({
            model: options.model || 'llama-3.3-70b-versatile',
            messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 1024,
            top_p: options.topP || 1,
            stream: options.stream || false,
        });
        console.log(completion)
        return completion;
    } catch (error) {
        throw new Error(`Groq API error: ${error.message}`);
    }
};

/**
 * Generate streaming chat completion
 */
export const generateStreamingChatCompletion = async (messages, options = {}) => {
    try {
        const client = getGroqClient();

        const stream = await client.chat.completions.create({
            model: options.model || 'llama-3.3-70b-versatile',
            messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 1024,
            top_p: options.topP || 1,
            stream: true,
        });

        return stream;
    } catch (error) {
        throw new Error(`Groq streaming error: ${error.message}`);
    }
};