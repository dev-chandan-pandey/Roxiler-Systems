import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import UserList from './UserList';
import StoreList from './StoreList';
import AddUser from './AddUser';
import AddStore from './AddStore';
import PasswordUpdate from './PasswordUpdate';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const stats = await api.getAdminDashboard();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="row">
            <div className="col-12 mb-4">
              <h2>Dashboard Overview</h2>
            </div>
            {loading ? (
              <div className="col-12 text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : dashboardStats ? (
              <>
                <div className="col-md-4 mb-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <h3 className="mb-0">{dashboardStats.totalUsers}</h3>
                          <p className="mb-0">Total Users</p>
                        </div>
                        <i className="fas fa-users fa-3x opacity-50"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <h3 className="mb-0">{dashboardStats.totalStores}</h3>
                          <p className="mb-0">Total Stores</p>
                        </div>
                        <i className="fas fa-store fa-3x opacity-50"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <h3 className="mb-0">{dashboardStats.totalRatings}</h3>
                          <p className="mb-0">Total Ratings</p>
                        </div>
                        <i className="fas fa-star fa-3x opacity-50"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-12">
                <div className="alert alert-warning">
                  Failed to load dashboard statistics.
                </div>
              </div>
            )}
          </div>
        );
      case 'users':
        return <UserList />;
      case 'stores':
        return <StoreList />;
      case 'add-user':
        return <AddUser onSuccess={() => setActiveTab('users')} />;
      case 'add-store':
        return <AddStore onSuccess={() => setActiveTab('stores')} />;
      case 'password':
        return <PasswordUpdate />;
      default:
        return null;
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand">
            <i className="fas fa-user-shield me-2"></i>
            Admin Panel
          </span>
          
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button 
                className="btn btn-outline-light dropdown-toggle" 
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-user me-2"></i>
                {user.name}
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={() => setActiveTab('password')}
                  >
                    <i className="fas fa-key me-2"></i>
                    Change Password
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar and Content */}
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 bg-white shadow-sm">
            <div className="list-group list-group-flush mt-3">
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <i className="fas fa-tachometer-alt me-2"></i>
                Dashboard
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="fas fa-users me-2"></i>
                Users
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'stores' ? 'active' : ''}`}
                onClick={() => setActiveTab('stores')}
              >
                <i className="fas fa-store me-2"></i>
                Stores
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'add-user' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-user')}
              >
                <i className="fas fa-user-plus me-2"></i>
                Add User
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'add-store' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-store')}
              >
                <i className="fas fa-plus me-2"></i>
                Add Store
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10 p-4">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
