import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChatWidget from '../../components/chat/ChatWidget';

const TestChat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentChatbot } = useSelector((state) => state.chatbot);

    return (
        <div>
            <div className="mb-6">
                <button
                    onClick={() => navigate(`/chatbots/${id}`)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Chatbot
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Test Chat</h1>
                <p className="text-gray-600 mt-1">Try out your chatbot</p>
            </div>

            <div className="max-w-2xl mx-auto" style={{ height: '600px' }}>
                <ChatWidget chatbotId={id} config={currentChatbot?.config} />
            </div>
        </div>
    );
};

export default TestChat;