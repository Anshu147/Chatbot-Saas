import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchChatbot, clearCurrentChatbot } from '../../store/slices/chatbotSlice';
import { fetchDocuments, uploadDocument, deleteDocument } from '../../store/slices/documentSlice';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const ChatbotDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentChatbot, loading } = useSelector((state) => state.chatbot);
    const { documents, uploading, error } = useSelector((state) => state.document);

    const [activeTab, setActiveTab] = useState('documents');
    const [selectedFile, setSelectedFile] = useState(null);
    const [showEmbedCode, setShowEmbedCode] = useState(false);

    useEffect(() => {
        dispatch(fetchChatbot(id));
        dispatch(fetchDocuments(id));

        return () => {
            dispatch(clearCurrentChatbot());
        };
    }, [dispatch, id]);

    const handleFileSelect = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        await dispatch(uploadDocument({ chatbotId: id, file: selectedFile }));
        setSelectedFile(null);

        // Refresh documents list
        dispatch(fetchDocuments(id));
    };

    const handleDeleteDocument = async (docId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            await dispatch(deleteDocument(docId));
            dispatch(fetchDocuments(id));
        }
    };

    const getEmbedCode = () => {
        return `<!-- ChatBot Widget -->
<script src="${window.location.origin}/widget.js" 
        data-chatbot-id="${id}"
        data-primary-color="${currentChatbot?.config?.appearance?.primaryColor}"
        data-position="${currentChatbot?.config?.appearance?.position}">
</script>`;
    };

    const copyEmbedCode = () => {
        navigator.clipboard.writeText(getEmbedCode());
        alert('Embed code copied to clipboard!');
    };

    if (loading && !currentChatbot) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!currentChatbot) {
        return (
            <div className="card text-center py-12">
                <p className="text-gray-600">Chatbot not found</p>
                <Button onClick={() => navigate('/chatbots')} className="mt-4">
                    Back to Chatbots
                </Button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/chatbots')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Chatbots
                </button>

                {/* <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{currentChatbot.name}</h1>
                        <p className="text-gray-600 mt-1">
                            Created {new Date(currentChatbot.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <Button onClick={() => setShowEmbedCode(true)}>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Get Embed Code
                    </Button>
                </div> */}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{currentChatbot.name}</h1>
                        <p className="text-gray-600 mt-1">
                            Created {new Date(currentChatbot.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => navigate(`/chatbots/${id}/test`)}
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Test Chat
                        </Button>
                        <Button onClick={() => setShowEmbedCode(true)}>
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Get Embed Code
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/chatbots/${id}/analytics`)}>
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Documents</p>
                            <p className="text-2xl font-bold text-gray-900">{currentChatbot.stats?.documentCount || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/chatbots/${id}/conversations`)}>
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Conversations</p>
                            <p className="text-2xl font-bold text-gray-900">{currentChatbot.stats?.conversationCount || 0}</p>
                        </div>
                    </div>
                </div>
                <div
                    className="card cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/chatbots/${id}/analytics`)}
                >
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Analytics</p>
                            <p className="text-2xl font-semibold text-gray-900">View Stats</p>
                            <p className="text-xs text-purple-600 mt-1">Performance →</p>
                        </div>
                    </div>
                </div>
                <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/chatbots/${id}/analytics`)}>
                    <div className="flex items-center">
                        <div className={`${currentChatbot.isActive ? 'bg-green-100' : 'bg-gray-100'} p-3 rounded-lg`}>
                            <svg className={`h-6 w-6 ${currentChatbot.isActive ? 'text-green-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="text-2xl font-bold text-gray-900">{currentChatbot.isActive ? 'Active' : 'Inactive'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Documents
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Settings
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'documents' && (
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Documents</h2>

                    {error && <Alert type="error" message={error} className="mb-4" />}

                    {/* Upload Section */}
                    <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <input
                                type="file"
                                accept=".pdf,.txt,.docx"
                                onChange={handleFileSelect}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                loading={uploading}
                            >
                                Upload
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Supported formats: PDF, TXT, DOCX (Max 10MB)
                        </p>
                    </div>

                    {/* Documents List */}
                    {documents.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">No documents uploaded yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {documents.map((doc, index) => (
                                <div key={doc._id || doc.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900">{doc.originalName}</p>
                                            <p className="text-sm text-gray-500">
                                                {doc.chunkCount || 0} chunks • {doc.processingStatus}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteDocument(doc._id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Chatbot Settings</h2>
                    <p className="text-gray-600">Settings page coming soon...</p>
                </div>
            )}

            {/* Embed Code Modal */}
            {showEmbedCode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Embed Code</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Copy and paste this code into your website's HTML, just before the closing &lt;/body&gt; tag.
                        </p>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
                            <pre className="text-sm">{getEmbedCode()}</pre>
                        </div>
                        <div className="flex space-x-3">
                            <Button variant="secondary" fullWidth onClick={() => setShowEmbedCode(false)}>
                                Close
                            </Button>
                            <Button fullWidth onClick={copyEmbedCode}>
                                Copy Code
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotDetail;