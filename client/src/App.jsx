import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import DriverConsole from './pages/DriverConsole';
import OperatorHub from './pages/OperatorHub';
import MyTickets from './pages/MyTickets';
import VerifyTicket from './pages/VerifyTicket';
import AgentAssistantWidget from './components/AgentAssistantWidget';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/verify-ticket" element={<VerifyTicket />} />

          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/operator"
            element={
              <ProtectedRoute allowedRoles={['operator', 'admin']}>
                <OperatorHub />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver"
            element={
              <ProtectedRoute allowedRoles={['driver', 'admin']}>
                <DriverConsole />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Autonomous Agentic Assistant Floating Widget */}
      <AgentAssistantWidget />
    </div>
  );
}

export default App;
