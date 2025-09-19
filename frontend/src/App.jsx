import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import StoreOwnerDashboard from './components/StoreOwnerDashboard';
import PasswordUpdate from './components/PasswordUpdate';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const getDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'user':
        return <UserDashboard />;
      case 'store_owner':
        return <StoreOwnerDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Routes>
      <Route path="/dashboard" element={getDashboard()} />
      <Route path="/password" element={<PasswordUpdate />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
