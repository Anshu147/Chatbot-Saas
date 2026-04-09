import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
    overview: null,
    trends: [],
    popularQuestions: [],
    responseTimes: null,
    conversations: [],
    currentConversation: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchAnalyticsOverview = createAsyncThunk(
    'analytics/fetchOverview',
    async ({ chatbotId, timeRange }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/analytics/${chatbotId}/overview`, {
                params: { timeRange },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch analytics'
            );
        }
    }
);

export const fetchConversationTrends = createAsyncThunk(
    'analytics/fetchTrends',
    async ({ chatbotId, timeRange }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/analytics/${chatbotId}/trends`, {
                params: { timeRange },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch trends'
            );
        }
    }
);

export const fetchPopularQuestions = createAsyncThunk(
    'analytics/fetchPopularQuestions',
    async ({ chatbotId, limit }, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `/analytics/${chatbotId}/popular-questions`,
                { params: { limit } }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch popular questions'
            );
        }
    }
);

export const fetchResponseTimes = createAsyncThunk(
    'analytics/fetchResponseTimes',
    async (chatbotId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/analytics/${chatbotId}/response-times`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch response times'
            );
        }
    }
);

export const fetchConversations = createAsyncThunk(
    'analytics/fetchConversations',
    async ({ chatbotId, params }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/analytics/${chatbotId}/conversations`, {
                params,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch conversations'
            );
        }
    }
);

export const fetchConversationDetail = createAsyncThunk(
    'analytics/fetchConversationDetail',
    async ({ chatbotId, conversationId }, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `/analytics/${chatbotId}/conversations/${conversationId}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch conversation'
            );
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        clearAnalyticsError: (state) => {
            state.error = null;
        },
        clearCurrentConversation: (state) => {
            state.currentConversation = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Overview
            .addCase(fetchAnalyticsOverview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
                state.loading = false;
                state.overview = action.payload.analytics;
            })
            .addCase(fetchAnalyticsOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Trends
            .addCase(fetchConversationTrends.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchConversationTrends.fulfilled, (state, action) => {
                state.loading = false;
                state.trends = action.payload.trends;
            })
            .addCase(fetchConversationTrends.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Popular Questions
            .addCase(fetchPopularQuestions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPopularQuestions.fulfilled, (state, action) => {
                state.loading = false;
                state.popularQuestions = action.payload.questions;
            })
            .addCase(fetchPopularQuestions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Response Times
            .addCase(fetchResponseTimes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchResponseTimes.fulfilled, (state, action) => {
                state.loading = false;
                state.responseTimes = action.payload.stats;
            })
            .addCase(fetchResponseTimes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Conversations
            .addCase(fetchConversations.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations = action.payload.conversations;
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Conversation Detail
            .addCase(fetchConversationDetail.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchConversationDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.currentConversation = action.payload.conversation;
            })
            .addCase(fetchConversationDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearAnalyticsError, clearCurrentConversation } =
    analyticsSlice.actions;
export default analyticsSlice.reducer;