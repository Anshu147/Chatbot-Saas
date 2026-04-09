import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchConversationDetail,
    clearCurrentConversation,
} from '../../store/slices/analyticsSlice';
import { fetchChatbot } from '../../store/slices/chatbotSlice';

const ConversationDetail = () => {
    const { id, conversationId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentChatbot } = useSelector((state) => state.chatbot);
    const { currentConversation, loading } = useSelector((state) => state.analytics);

    useEffect(() => {
        if (id && conversationId) {
            dispatch(fetchChatbot(id));
            dispatch(fetchConversationDetail({ chatbotId: id, conversationId }));
        }

        return () => {
            dispatch(clearCurrentConversation());
        };
    }, [dispatch, id, conversationId]);

    if (loading && !currentConversation) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!currentConversation) {
        return (
            <div className="card text-center py-12">
                <p className="text-gray-600">Conversation not found</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(`/chatbots/${id}/conversations`)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Conversations
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Conversation Details</h1>
                        <p className="text-gray-600 mt-1">
                            Session: {currentConversation.sessionId}
                        </p>
                    </div>
                </div>
            </div>

            {/* Conversation Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Total Messages</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {currentConversation.messages?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Started At</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {new Date(currentConversation.startedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className={`${currentConversation.escalated ? 'bg-red-100' : 'bg-gray-100'} p-3 rounded-lg`}>
                            <svg className={`h-6 w-6 ${currentConversation.escalated ? 'text-red-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {currentConversation.escalated ? 'Escalated' : 'Normal'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Satisfaction Rating */}
            {currentConversation.satisfaction?.rating && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">User Feedback</h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`h-6 w-6 ${star <= currentConversation.satisfaction.rating
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                                {currentConversation.satisfaction.rating}/5
                            </span>
                        </div>
                    </div>
                    {currentConversation.satisfaction.feedback && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                                "{currentConversation.satisfaction.feedback}"
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Messages */}
            <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {currentConversation.messages?.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="max-w-2xl">
                                {/* Message bubble */}
                                <div
                                    className={`px-4 py-3 rounded-lg ${message.role === 'user'
                                            ? 'bg-primary-600 text-white'
                                            : message.role === 'system'
                                                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                                                : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>

                                {/* Metadata */}
                                <div className={`mt-1 flex items-center space-x-3 text-xs text-gray-500 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}>
                                    <span>
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>

                                    {/* Confidence score for assistant messages */}
                                    {message.role === 'assistant' && message.confidence && (
                                        <>
                                            <span>•</span>
                                            <span className={`${message.confidence >= 0.7 ? 'text-green-600' :
                                                    message.confidence >= 0.5 ? 'text-yellow-600' :
                                                        'text-red-600'
                                                }`}>
                                                Confidence: {(message.confidence * 100).toFixed(0)}%
                                            </span>
                                        </>
                                    )}

                                    {/* Sources */}
                                    {message.sources && message.sources.length > 0 && (
                                        <>
                                            <span>•</span>
                                            <button
                                                onClick={() => {
                                                    const sourcesText = message.sources.map((s, i) =>
                                                        `Source ${i + 1}: ${s.content}`
                                                    ).join('\n\n');
                                                    alert(sourcesText);
                                                }}
                                                className="text-primary-600 hover:text-primary-800"
                                            >
                                                {message.sources.length} source(s)
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Info */}
            {currentConversation.userInfo && (
                <div className="card mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {currentConversation.userInfo.ipAddress && (
                            <div>
                                <p className="text-sm text-gray-600">IP Address</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {currentConversation.userInfo.ipAddress}
                                </p>
                            </div>
                        )}
                        {currentConversation.userInfo.userAgent && (
                            <div>
                                <p className="text-sm text-gray-600">User Agent</p>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {currentConversation.userInfo.userAgent}
                                </p>
                            </div>
                        )}
                        {currentConversation.userInfo.location && (
                            <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {currentConversation.userInfo.location}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConversationDetail;