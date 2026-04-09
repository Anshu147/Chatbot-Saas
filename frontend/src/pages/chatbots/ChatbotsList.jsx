import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchChatbots, deleteChatbot, clearChatbotError } from '../../store/slices/chatbotSlice';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const ChatbotsList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { chatbots, loading, error } = useSelector((state) => state.chatbot);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        dispatch(fetchChatbots());
    }, [dispatch]);

    const handleDelete = async (id) => {
        await dispatch(deleteChatbot(id));
        setDeleteConfirm(null);
    };

    if (loading && chatbots.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Chatbots</h1>
                    <p className="text-gray-600 mt-1">Manage your AI assistants</p>
                </div>
                <Button onClick={() => navigate('/chatbots/new')}>
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Chatbot
                </Button>
            </div>

            {error && <Alert type="error" message={error} onClose={() => dispatch(clearChatbotError())} />}

            {/* Chatbots Grid */}
            {chatbots.length === 0 ? (
                <div className="card text-center py-12">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No chatbots</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new chatbot.</p>
                    <div className="mt-6">
                        <Button onClick={() => navigate('/chatbots/new')}>
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Chatbot
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {chatbots.map((chatbot) => (
                        <div key={chatbot._id} className="card hover:shadow-md transition-shadow">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between mb-4">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${chatbot.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {chatbot.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => navigate(`/chatbots/${chatbot._id}`)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(chatbot._id)}
                                        className="text-gray-400 hover:text-red-600"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Chatbot Info */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{chatbot.name}</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Created {new Date(chatbot.createdAt).toLocaleDateString()}
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{chatbot.stats?.documentCount || 0}</p>
                                    <p className="text-xs text-gray-600">Documents</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{chatbot.stats?.conversationCount || 0}</p>
                                    <p className="text-xs text-gray-600">Conversations</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate(`/chatbots/${chatbot._id}`)}
                            >
                                Manage
                            </Button>

                            {/* Delete Confirmation Modal */}
                            {deleteConfirm === chatbot._id && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Chatbot?</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            This will permanently delete "{chatbot.name}" and all its data. This action cannot be undone.
                                        </p>
                                        <div className="flex space-x-3">
                                            <Button
                                                variant="secondary"
                                                fullWidth
                                                onClick={() => setDeleteConfirm(null)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                fullWidth
                                                onClick={() => handleDelete(chatbot._id)}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatbotsList;