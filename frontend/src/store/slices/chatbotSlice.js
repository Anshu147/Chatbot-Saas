import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
    chatbots: [],
    currentChatbot: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchChatbots = createAsyncThunk(
    'chatbot/fetchChatbots',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/chatbots');
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch chatbots'
            );
        }
    }
);

export const createChatbot = createAsyncThunk(
    'chatbot/createChatbot',
    async (chatbotData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/chatbots', chatbotData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create chatbot'
            );
        }
    }
);

export const fetchChatbot = createAsyncThunk(
    'chatbot/fetchChatbot',
    async (chatbotId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/chatbots/${chatbotId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch chatbot'
            );
        }
    }
);

export const updateChatbot = createAsyncThunk(
    'chatbot/updateChatbot',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/chatbots/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update chatbot'
            );
        }
    }
);

export const deleteChatbot = createAsyncThunk(
    'chatbot/deleteChatbot',
    async (chatbotId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`/chatbots/${chatbotId}`);
            return { id: chatbotId, ...response.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete chatbot'
            );
        }
    }
);

const chatbotSlice = createSlice({
    name: 'chatbot',
    initialState,
    reducers: {
        clearChatbotError: (state) => {
            state.error = null;
        },
        setCurrentChatbot: (state, action) => {
            state.currentChatbot = action.payload;
        },
        clearCurrentChatbot: (state) => {
            state.currentChatbot = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Chatbots
            .addCase(fetchChatbots.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChatbots.fulfilled, (state, action) => {
                state.loading = false;
                state.chatbots = action.payload.chatbots || [];
            })
            .addCase(fetchChatbots.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Chatbot
            .addCase(createChatbot.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createChatbot.fulfilled, (state, action) => {
                state.loading = false;
                state.chatbots.unshift(action.payload.chatbot);
            })
            .addCase(createChatbot.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Single Chatbot
            .addCase(fetchChatbot.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChatbot.fulfilled, (state, action) => {
                state.loading = false;
                state.currentChatbot = action.payload.chatbot;
            })
            .addCase(fetchChatbot.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Chatbot
            .addCase(updateChatbot.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateChatbot.fulfilled, (state, action) => {
                state.loading = false;
                state.currentChatbot = action.payload.chatbot;

                // Update in list
                const index = state.chatbots.findIndex(
                    (c) => c._id === action.payload.chatbot._id
                );
                if (index !== -1) {
                    state.chatbots[index] = action.payload.chatbot;
                }
            })
            .addCase(updateChatbot.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete Chatbot
            .addCase(deleteChatbot.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteChatbot.fulfilled, (state, action) => {
                state.loading = false;
                state.chatbots = state.chatbots.filter(
                    (c) => c._id !== action.payload.id
                );
                if (state.currentChatbot?._id === action.payload.id) {
                    state.currentChatbot = null;
                }
            })
            .addCase(deleteChatbot.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearChatbotError, setCurrentChatbot, clearCurrentChatbot } = chatbotSlice.actions;
export default chatbotSlice.reducer;