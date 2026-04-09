import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchChatbots } from '../../store/slices/chatbotSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { chatbots } = useSelector((state) => state.chatbot);

    useEffect(() => {
        dispatch(fetchChatbots());
    }, [dispatch]);

    // Calculate stats from chatbots
    const totalChatbots = chatbots.length;
    const totalDocuments = chatbots.reduce((sum, bot) => sum + (bot.stats?.documentCount || 0), 0);
    const totalConversations = chatbots.reduce((sum, bot) => sum + (bot.stats?.conversationCount || 0), 0);

    const stats = [
        {
            name: 'Total Chatbots',
            value: totalChatbots,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            ),
            color: 'bg-blue-500',
        },
        {
            name: 'Total Conversations',
            value: totalConversations,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
            ),
            color: 'bg-green-500',
        },
        {
            name: 'Documents Uploaded',
            value: totalDocuments,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'bg-purple-500',
        },
        {
            name: 'Active Chatbots',
            value: chatbots.filter(bot => bot.isActive).length,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            color: 'bg-yellow-500',
        },
    ];

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.name}! 👋
                </h1>
                <p className="mt-2 text-gray-600">
                    Here's what's happening with your chatbots today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="card">
                        <div className="flex items-center">
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <div className="text-white">{stat.icon}</div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/chatbots/new"
                        className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
                    >
                        <div className="bg-primary-100 group-hover:bg-primary-200 p-3 rounded-lg">
                            <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="font-medium text-gray-900">Create Chatbot</p>
                            <p className="text-sm text-gray-600">Build a new AI assistant</p>
                        </div>
                    </Link>

                    <Link
                        to="/chatbots"
                        className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
                    >
                        <div className="bg-green-100 group-hover:bg-green-200 p-3 rounded-lg">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="font-medium text-gray-900">Manage Chatbots</p>
                            <p className="text-sm text-gray-600">View all your bots</p>
                        </div>
                    </Link>

                    <Link
                        to="/analytics"
                        className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
                    >
                        <div className="bg-purple-100 group-hover:bg-purple-200 p-3 rounded-lg">
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="font-medium text-gray-900">View Analytics</p>
                            <p className="text-sm text-gray-600">Check performance</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Chatbots */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Chatbots</h2>
                    <Link to="/chatbots" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View All
                    </Link>
                </div>

                {chatbots.length === 0 ? (
                    <div className="text-center py-12">
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
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No chatbots yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by creating your first AI chatbot.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/chatbots/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Chatbot
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {chatbots.slice(0, 3).map((chatbot) => (
                            <Link
                                key={chatbot._id}
                                to={`/chatbots/${chatbot._id}`}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="bg-primary-100 p-2 rounded-lg">
                                        <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{chatbot.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {chatbot.stats?.documentCount || 0} docs • {chatbot.stats?.conversationCount || 0} conversations
                                        </p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${chatbot.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {chatbot.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;