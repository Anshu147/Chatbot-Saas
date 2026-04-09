import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchAnalyticsOverview,
    fetchConversationTrends,
    fetchPopularQuestions,
    fetchResponseTimes,
} from '../../store/slices/analyticsSlice';
import { fetchChatbot } from '../../store/slices/chatbotSlice';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
const Analytics = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentChatbot } = useSelector((state) => state.chatbot);
    const { overview, trends, popularQuestions, responseTimes, loading } =
        useSelector((state) => state.analytics);

    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        if (id) {
            dispatch(fetchChatbot(id));
            loadAnalytics(id, timeRange);
        }
    }, [dispatch, id]);

    const loadAnalytics = (chatbotId, range) => {
        dispatch(fetchAnalyticsOverview({ chatbotId, timeRange: range }));
        dispatch(fetchConversationTrends({ chatbotId, timeRange: range }));
        dispatch(fetchPopularQuestions({ chatbotId, limit: 10 }));
        dispatch(fetchResponseTimes(chatbotId));
    };

    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        if (id) {
            loadAnalytics(id, range);
        }
    };

    if (loading && !overview) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
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

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Analytics - {currentChatbot?.name}
                        </h1>
                        <p className="text-gray-600 mt-1">Track your chatbot's performance</p>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex space-x-2">
                        {['24h', '7d', '30d', '90d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => handleTimeRangeChange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {range === '24h' && 'Last 24 Hours'}
                                {range === '7d' && 'Last 7 Days'}
                                {range === '30d' && 'Last 30 Days'}
                                {range === '90d' && 'Last 90 Days'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Conversations</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {overview?.totalConversations || 0}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Messages/Conv</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {overview?.avgMessagesPerConversation || 0}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Satisfaction</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {overview?.avgSatisfaction || 0}
                                <span className="text-lg text-gray-500">/5.0</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {overview?.satisfactionRatings || 0} ratings
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Escalation Rate</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {overview?.escalationRate || 0}%
                            </p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-lg">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Conversation Trends */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation Trends</h2>
                    {trends && trends.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="conversations" stroke="#3B82F6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="messages" stroke="#10B981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No data available for selected time range
                        </div>
                    )}
                </div>

                {/* Response Times */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Times</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Average Response Time</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {responseTimes?.avgResponseTime || 0}s
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Fastest Response</span>
                            <span className="text-xl font-semibold text-green-600">
                                {responseTimes?.minResponseTime || 0}s
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Slowest Response</span>
                            <span className="text-xl font-semibold text-red-600">
                                {responseTimes?.maxResponseTime || 0}s
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Total Responses</span>
                            <span className="text-xl font-semibold text-gray-900">
                                {responseTimes?.totalResponses || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Questions */}
            <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Asked Questions</h2>
                {popularQuestions && popularQuestions.length > 0 ? (
                    <div className="space-y-3">
                        {popularQuestions.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-semibold text-primary-600">{index + 1}</span>
                                    </div>
                                    <p className="text-sm text-gray-900 flex-1">{item.question}</p>
                                </div>
                                <span className="ml-4 px-3 py-1 bg-gray-200 rounded-full text-sm font-medium text-gray-700">
                                    {item.count} times
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No questions data available yet
                    </div>
                )}
            </div>

            {/* View Conversations Button */}
            <div className="mt-6 text-center">
                <button
                    onClick={() => navigate(`/chatbots/${id}/conversations`)}
                    className="btn btn-primary"
                >
                    View All Conversations
                </button>
            </div>
        </div>
    );
};

// Simple chart components (you can replace with recharts library)
// const ResponsiveContainer = ({ children, width, height }) => (
//     <div style={{ width, height }}>{children}</div>
// );

// const LineChart = ({ data, children }) => {
//     if (!data || data.length === 0) return null;

//     return (
//         <div className="relative w-full h-full">
//             {/* Simple SVG chart - you can replace this with recharts */}
//             <svg width="100%" height="100%" viewBox="0 0 600 200">
//                 {/* Grid lines */}
//                 <line x1="0" y1="0" x2="600" y2="0" stroke="#e5e7eb" strokeWidth="1" />
//                 <line x1="0" y1="50" x2="600" y2="50" stroke="#e5e7eb" strokeWidth="1" />
//                 <line x1="0" y1="100" x2="600" y2="100" stroke="#e5e7eb" strokeWidth="1" />
//                 <line x1="0" y1="150" x2="600" y2="150" stroke="#e5e7eb" strokeWidth="1" />
//                 <line x1="0" y1="200" x2="600" y2="200" stroke="#e5e7eb" strokeWidth="1" />

//                 {/* Data points */}
//                 {data.map((point, i) => {
//                     const x = (i / (data.length - 1)) * 600;
//                     const y = 200 - (point.conversations / Math.max(...data.map(d => d.conversations))) * 180;
//                     return (
//                         <circle key={i} cx={x} cy={y} r="4" fill="#3B82F6" />
//                     );
//                 })}
//             </svg>
//         </div>
//     );
// };

// const CartesianGrid = () => null;
// const XAxis = () => null;
// const YAxis = () => null;
// const Tooltip = () => null;
// const Legend = () => null;
// const Line = () => null;

export default Analytics;