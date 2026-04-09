import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createChatbot, clearChatbotError } from '../../store/slices/chatbotSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const CreateChatbot = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.chatbot);

    const [formData, setFormData] = useState({
        name: '',
        welcomeMessage: 'Hi! How can I help you today?',
        primaryColor: '#3B82F6',
        position: 'bottom-right',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const chatbotData = {
            name: formData.name,
            config: {
                appearance: {
                    primaryColor: formData.primaryColor,
                    welcomeMessage: formData.welcomeMessage,
                    position: formData.position,
                },
            },
        };

        const result = await dispatch(createChatbot(chatbotData));

        if (result.type === 'chatbot/createChatbot/fulfilled') {
            navigate(`/chatbots/${result.payload.chatbot._id}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
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
                <h1 className="text-2xl font-bold text-gray-900">Create New Chatbot</h1>
                <p className="text-gray-600 mt-1">Set up your AI assistant</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="card space-y-6">
                {error && <Alert type="error" message={error} onClose={() => dispatch(clearChatbotError())} />}

                {/* Basic Info */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                    <Input
                        label="Chatbot Name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Customer Support Bot"
                        required
                    />

                    <Input
                        label="Welcome Message"
                        type="text"
                        name="welcomeMessage"
                        value={formData.welcomeMessage}
                        onChange={handleChange}
                        placeholder="Hi! How can I help you today?"
                        required
                    />
                </div>

                {/* Appearance */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Color
                        </label>
                        <div className="flex items-center space-x-3">
                            <input
                                type="color"
                                name="primaryColor"
                                value={formData.primaryColor}
                                onChange={handleChange}
                                className="h-10 w-20 rounded border border-gray-300"
                            />
                            <input
                                type="text"
                                value={formData.primaryColor}
                                onChange={handleChange}
                                name="primaryColor"
                                className="input flex-1"
                                placeholder="#3B82F6"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Widget Position
                        </label>
                        <select
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="input"
                        >
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                        </select>
                    </div>
                </div>

                {/* Preview */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="bg-white rounded-lg shadow-lg max-w-sm">
                            <div
                                className="p-4 rounded-t-lg text-white"
                                style={{ backgroundColor: formData.primaryColor }}
                            >
                                <h3 className="font-semibold">{formData.name || 'Your Chatbot'}</h3>
                            </div>
                            <div className="p-4">
                                <div className="bg-gray-100 rounded-lg p-3 mb-2">
                                    <p className="text-sm">{formData.welcomeMessage}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        fullWidth
                        onClick={() => navigate('/chatbots')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading} fullWidth>
                        Create Chatbot
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateChatbot;