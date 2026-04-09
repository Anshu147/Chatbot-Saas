import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './store/slices/authSlice';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import ChatbotsList from './pages/chatbots/ChatbotsList';
import CreateChatbot from './pages/chatbots/CreateChatbot';
import ChatbotDetail from './pages/chatbots/ChatbotDetail';
import ConversationDetail from './pages/analytics/ConversationDetail';
// Route Protection
import ProtectedRoute from './pages/auth/ProtectedRoute';
import PublicRoute from './pages/auth/PublicRoute';
import TestChat from './pages/chatbots/TestChat';
import Analytics from './pages/analytics/Analytics';
import ConversationsList from './pages/analytics/ConversationsList';
import WidgetView from './pages/chatbots/WidgetView';

function App() {
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, accessToken, isAuthenticated]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Chatbot Routes */}
          <Route path="chatbots" element={<ChatbotsList />} />
          <Route path="chatbots/new" element={<CreateChatbot />} />
          <Route path="chatbots/:id" element={<ChatbotDetail />} />
          <Route path="chatbots/:id/test" element={<TestChat />} />
          <Route path="chatbots/:id/analytics" element={<Analytics />} />
          <Route path="chatbots/:id/conversations" element={<ConversationsList />} />
          <Route path="chatbots/:id/conversations/:conversationId" element={<ConversationDetail />} />
          {/* Placeholder routes */}
          <Route path="analytics" element={<div className="card">Analytics Page (Coming Soon)</div>} />
          <Route path="documents" element={<div className="card">Documents Page (Coming Soon)</div>} />
          <Route path="profile" element={<div className="card">Profile Page (Coming Soon)</div>} />
          <Route path="settings" element={<div className="card">Settings Page (Coming Soon)</div>} />
          <Route path="billing" element={<div className="card">Billing Page (Coming Soon)</div>} />
        </Route>

        {/* Widget Route (Public) */}
        <Route path="/widget/:id" element={<WidgetView />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;