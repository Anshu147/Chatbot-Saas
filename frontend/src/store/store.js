import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatbotReducer from './slices/chatbotSlice';
import documentReducer from './slices/documentSlice';
import analyticsReducer from './slices/analyticsSlice';
export const store = configureStore({
    reducer: {
        auth: authReducer,
        chatbot: chatbotReducer,
        document: documentReducer,
        analytics: analyticsReducer,
    },
});