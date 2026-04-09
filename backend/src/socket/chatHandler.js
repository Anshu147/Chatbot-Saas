import Chatbot from '../models/Chatbot.js';
import Conversation from '../models/Conversation.js';
import { generateRAGStreamingResponse } from '../services/ragService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handle chat socket events
 */
export const handleChatConnection = (io, socket) => {
    console.log(`👤 Client connected: ${socket.id}`);

    // Join chatbot room
    socket.on('join_chatbot', async ({ chatbotId, sessionId }) => {
        try {
            // Verify chatbot exists
            const chatbot = await Chatbot.findById(chatbotId);

            if (!chatbot) {
                socket.emit('error', { message: 'Chatbot not found' });
                return;
            }

            if (!chatbot.isActive) {
                socket.emit('error', { message: 'Chatbot is currently inactive' });
                return;
            }

            // Join room
            socket.join(`chatbot_${chatbotId}`);

            // Store chatbot and session info in socket
            socket.chatbotId = chatbotId;
            socket.sessionId = sessionId || uuidv4();
            socket.namespace = chatbot.vectorNamespace;
            socket.chatbotConfig = chatbot.config;

            // Send welcome message
            socket.emit('bot_message', {
                content: chatbot.config.appearance.welcomeMessage,
                timestamp: new Date(),
            });

            console.log(`✅ Socket ${socket.id} joined chatbot ${chatbotId}`);
        } catch (error) {
            console.error('Join chatbot error:', error);
            socket.emit('error', { message: 'Failed to join chatbot' });
        }
    });

    // Handle user message
    socket.on('user_message', async ({ message }) => {
        try {
            if (!socket.chatbotId || !socket.sessionId) {
                socket.emit('error', { message: 'Not connected to a chatbot' });
                return;
            }

            // Find or create conversation
            let conversation = await Conversation.findOne({
                chatbotId: socket.chatbotId,
                sessionId: socket.sessionId,
            });

            if (!conversation) {
                conversation = await Conversation.create({
                    chatbotId: socket.chatbotId,
                    sessionId: socket.sessionId,
                    messages: [],
                });
            }

            // Add user message to conversation
            conversation.messages.push({
                role: 'user',
                content: message,
                timestamp: new Date(),
            });

            // Get conversation history (last 10 messages for context)
            const conversationHistory = conversation.messages
                .slice(-10)
                .map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                }));

            // Generate RAG response with streaming
            const { stream, confidence, sources, hasContext } = await generateRAGStreamingResponse(
                message,
                socket.namespace,
                conversationHistory,
                socket.chatbotConfig
            );

            // Emit typing indicator
            socket.emit('bot_typing', { typing: true });

            // Stream response
            let fullResponse = '';

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullResponse += content;
                    socket.emit('bot_message_chunk', { content });
                }
            }

            // Emit completion
            socket.emit('bot_typing', { typing: false });
            socket.emit('bot_message_complete', {
                content: fullResponse,
                confidence,
                sources,
                hasContext,
            });

            // Save assistant message to conversation
            conversation.messages.push({
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date(),
                confidence,
                sources,
            });

            await conversation.save();

            // Check if escalation is needed
            const escalationThreshold = socket.chatbotConfig?.behavior?.confidenceThreshold || 0.7;

            if (confidence < escalationThreshold && socket.chatbotConfig?.escalation?.enabled) {
                // Mark conversation as escalated
                if (!conversation.escalated) {
                    conversation.escalated = true;
                    conversation.escalatedAt = new Date();
                    await conversation.save();

                    // Emit escalation event
                    socket.emit('escalation_needed', {
                        message: 'Your query has been forwarded to a human agent.',
                    });

                    // TODO: Send email notification to support team
                }
            }
        } catch (error) {
            console.error('User message error:', error);
            socket.emit('error', { message: 'Failed to process message' });
        }
    });

    // Handle typing indicator from user
    socket.on('user_typing', ({ typing }) => {
        if (socket.chatbotId) {
            socket.to(`chatbot_${socket.chatbotId}`).emit('user_typing', { typing });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`👋 Client disconnected: ${socket.id}`);
    });
};