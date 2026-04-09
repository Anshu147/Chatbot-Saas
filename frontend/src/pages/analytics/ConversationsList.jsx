import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchConversations } from '../../store/slices/analyticsSlice';
import { fetchChatbot } from '../../store/slices/chatbotSlice';

const ConversationsList = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentChatbot } = useSelector((state) => state.chatbot);
    const { conversations, loading } = useSelector((state) => state.analytics);

    const [filters, setFilters] = useState({
        escalated: undefined,
        rated: undefined,
        page: 1,
    });

    useEffect(() => {
        if (id) {
            dispatch(fetchChatbot(id));
            loadConversations();
        }
    }, [dispatch, id, filters]);

    const loadConversations = () => {
        dispatch(fetchConversations({ chatbotId: id, params: filters }));
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1, // Reset to first page when filtering
        }));
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(`/chatbots/${id}/analytics`)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Analytics
                </button>

                <h1 className="text-2xl font-bold text-gray-900">
                    Conversations - {currentChatbot?.name}
                </h1>
                <p className="text-gray-600 mt-1">View and manage all conversations</p>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex items-center space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Status
                        </label>
                        <select
                            value={filters.escalated || ''}
                            onChange={(e) => handleFilterChange('escalated', e.target.value || undefined)}
                            className="input"
                        >
                            <option value="">All Conversations</option>
                            <option value="true">Escalated Only</option>
                            <option value="false">Not Escalated</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Rating
                        </label>
                        <select
                            value={filters.rated || ''}
                            onChange={(e) => handleFilterChange('rated', e.target.value || undefined)}
                            className="input"
                        >
                            <option value="">All Conversations</option>
                            <option value="true">Rated Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Conversations List */}
            <div className="card">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : conversations && conversations.length > 0 ? (
                    <div className="space-y-3">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                onClick={() => navigate(`/chatbots/${id}/conversations/${conversation.id}`)}
                                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <p className="font-medium text-gray-900">
                                                Session: {conversation.sessionId.substring(0, 16)}...
                                            </p>
                                            {conversation.escalated && (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                                    Escalated
                                                </span>
                                            )}
                                            {conversation.satisfaction?.rating && (
                                                <span className="flex items-center text-yellow-500">
                                                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    {conversation.satisfaction.rating}/5
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                                            <span>{conversation.messageCount} messages</span>
                                            <span>•</span>
                                            <span>Started {new Date(conversation.startedAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No conversations found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationsList;