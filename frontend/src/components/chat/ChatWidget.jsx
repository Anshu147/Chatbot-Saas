import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Button from '../common/Button';

const ChatWidget = ({ chatbotId, config = {} }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const [currentBotMessage, setCurrentBotMessage] = useState('');
    console.log(messages)
    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentBotMessage]);

    // Initialize socket connection
    useEffect(() => {
        if (!chatbotId) return;

        const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

        newSocket.on('connect', () => {
            console.log('✅ Connected to chat server');
            setIsConnected(true);

            // Join chatbot room
            const sessionId = localStorage.getItem(`session_${chatbotId}`) || generateSessionId();
            localStorage.setItem(`session_${chatbotId}`, sessionId);

            newSocket.emit('join_chatbot', { chatbotId, sessionId });
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from chat server');
            setIsConnected(false);
        });

        newSocket.on('bot_message', (data) => {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.content,
                    timestamp: new Date(data.timestamp),
                },
            ]);
        });

        newSocket.on('bot_message_chunk', (data) => {
            setCurrentBotMessage((prev) => prev + data.content);
        });

        newSocket.on('bot_message_complete', (data) => {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.content,
                    timestamp: new Date(),
                    confidence: data.confidence,
                    sources: data.sources,
                },
            ]);
            setCurrentBotMessage('');
            setIsTyping(false);
        });

        newSocket.on('bot_typing', (data) => {
            setIsTyping(data.typing);
        });

        newSocket.on('error', (data) => {
            setError(data.message);
            setIsTyping(false);
        });

        newSocket.on('escalation_needed', (data) => {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'system',
                    content: data.message,
                    timestamp: new Date(),
                },
            ]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [chatbotId]);

    const generateSessionId = () => {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!inputMessage.trim() || !socket || !isConnected) return;

        // Add user message to UI
        setMessages((prev) => [
            ...prev,
            {
                role: 'user',
                content: inputMessage,
                timestamp: new Date(),
            },
        ]);

        // Send to server
        socket.emit('user_message', { message: inputMessage });

        // Clear input
        setInputMessage('');
        setIsTyping(true);
    };

    const primaryColor = config?.appearance?.primaryColor || '#3B82F6';

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 text-white" style={{ backgroundColor: primaryColor }}>
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                        {config?.appearance?.botName || 'Chat Assistant'}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`} />
                        <span className="text-xs">{isConnected ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === 'user'
                                ? 'text-white'
                                : message.role === 'system'
                                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                            style={message.role === 'user' ? { backgroundColor: primaryColor } : {}}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.sources && message.sources.length > 0 && (
                                <div className="mt-2 text-xs opacity-75">
                                    <p>Sources: {message.sources.length} document(s)</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Streaming message */}
                {currentBotMessage && (
                    <div className="flex justify-start">
                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                            <p className="text-sm whitespace-pre-wrap">{currentBotMessage}</p>
                        </div>
                    </div>
                )}

                {/* Typing indicator */}
                {isTyping && !currentBotMessage && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={config?.appearance?.placeholderText || 'Type your message...'}
                        disabled={!isConnected}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || !isConnected || isTyping}
                        className="px-4 py-2 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        style={{ backgroundColor: isConnected && inputMessage.trim() && !isTyping ? primaryColor : undefined }}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWidget;