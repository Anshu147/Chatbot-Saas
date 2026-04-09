import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ChatWidget from '../../components/chat/ChatWidget';

const WidgetView = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // We fetch the chatbot config even though some params might be in the query
                // This ensures we have the latest settings from the database
                const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chatbots/${id}/public`);
                setConfig(response.data.chatbot.config);
            } catch (err) {
                console.error('Failed to fetch chatbot config:', err);
                // Fallback to query params if available
                const fallbackConfig = {
                    appearance: {
                        primaryColor: searchParams.get('primaryColor') || '#3B82F6',
                        botName: searchParams.get('botName') || 'Chat Assistant',
                        position: searchParams.get('position') || 'bottom-right',
                    }
                };
                setConfig(fallbackConfig);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchConfig();
        }
    }, [id, searchParams]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-transparent">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-transparent overflow-hidden">
            <ChatWidget chatbotId={id} config={config} />
        </div>
    );
};

export default WidgetView;
