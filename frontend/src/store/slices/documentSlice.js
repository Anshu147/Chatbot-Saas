import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
    documents: [],
    uploading: false,
    loading: false,
    error: null,
};

// Async thunks
export const uploadDocument = createAsyncThunk(
    'document/upload',
    async ({ chatbotId, file }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chatbotId', chatbotId);

            const response = await axios.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to upload document'
            );
        }
    }
);

export const fetchDocuments = createAsyncThunk(
    'document/fetchDocuments',
    async (chatbotId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/documents/${chatbotId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch documents'
            );
        }
    }
);

export const deleteDocument = createAsyncThunk(
    'document/deleteDocument',
    async (documentId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`/documents/${documentId}`);
            return { id: documentId, ...response.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete document'
            );
        }
    }
);

const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers: {
        clearDocumentError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Upload Document
            .addCase(uploadDocument.pending, (state) => {
                state.uploading = true;
                state.error = null;
            })
            .addCase(uploadDocument.fulfilled, (state, action) => {
                state.uploading = false;
                state.documents.unshift(action.payload.document);
            })
            .addCase(uploadDocument.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.payload;
            })

            // Fetch Documents
            .addCase(fetchDocuments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = action.payload.documents || [];
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete Document
            .addCase(deleteDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = state.documents.filter(
                    (d) => d._id !== action.payload.id
                );
            })
            .addCase(deleteDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearDocumentError } = documentSlice.actions;
export default documentSlice.reducer;