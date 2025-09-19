import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PasswordUpdate from './PasswordUpdate';

const StoreOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [raters, setRaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratersLoading, setRatersLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const { user, logout } = useAuth();

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'raters') {
      loadRaters();
    }
  }, [activeTab, sortConfig]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getStoreOwnerDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRaters = async () => {
    try {
      setRatersLoading(true);
      const response = await api.getStoreRaters(sortConfig);
      setRaters(response.raters);
    } catch (error) {
      console.error('Failed to load raters:', error);
    } finally {
      setRatersLoading(false);
    }
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`${i <= rating ? 'fas text-warning' : 'far text-muted'} fa-star`}
        />
      );
    }
    return stars;
  };

  const getSortIcon = (field) => {
    if (sortConfig.sortBy !== field) {
      return <i className="fas fa-sort text-muted"></i>;
    }
    return sortConfig.sortOrder === 'asc' ? 
      <i className="fas fa-sort-up text-primary"></i> : 
      <i className="fas fa-sort-down text-primary"></i>;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (loading) {
          return (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          );
        }

        if (!dashboardData) {
          return (
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Failed to load dashboard data.
            </div>
          );
        }

        return (
          <div>
            <div className="row mb-4">
              <div className="col-12">
                <h2>Store Dashboard</h2>
                <p className="text-muted">Overview of your store performance</p>
              </div>
            </div>

            {/* Store Info Card */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">{dashboardData.store.name}</h4>
                    <p className="text-muted mb-0">Store ID: {dashboardData.store.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h2 className="mb-0">{dashboardData.statistics.averageRating}</h2>
                        <p className="mb-0">Average Rating</p>
                      </div>
                      <i className="fas fa-star fa-3x opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4 mb-3">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h2 className="mb-0">{dashboardData.statistics.totalRatings}</h2>
                        <p className="mb-0">Total Ratings</p>
                      </div>
                      <i className="fas fa-thumbs-up fa-3x opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4 mb-3">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h2 className="mb-0">{dashboardData.statistics.uniqueRaters}</h2>
                        <p className="mb-0">Unique Raters</p>
                      </div>
                      <i className="fas fa-users fa-3x opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Ratings */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Recent Ratings</h5>
              </div>
              <div className="card-body">
                {dashboardData.ratings.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-star fa-3x text-muted mb-3"></i>
                    <h5>No Ratings Yet</h5>
                    <p className="text-muted">Your store hasn't received any ratings yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Rating</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.ratings.slice(0, 10).map((rating, index) => (
                          <tr key={index}>
                            <td>
                              <div>
                                <strong>{rating.user_name}</strong>
                                <br />
                                <small className="text-muted">{rating.user_email}</small>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {renderStars(rating.rating)}
                                <span className="ms-2">({rating.rating}/5)</span>
                              </div>
                            </td>
                            <td>
                              <small>
                                {new Date(rating.created_at).toLocaleDateString()}
                                {rating.updated_at !== rating.created_at && (
                                  <div className="text-muted">Updated: {new Date(rating.updated_at).toLocaleDateString()}</div>
                                )}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'raters':
        return (
          <div>
            <div className="row mb-4">
              <div className="col-12">
                <h2>Store Raters</h2>
                <p className="text-muted">Users who have rated your store</p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                {ratersLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : raters.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                    <h4>No Raters Yet</h4>
                    <p className="text-muted">No users have rated your store yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th 
                            className="sortable" 
                            onClick={() => handleSort('name')}
                            style={{ cursor: 'pointer' }}
                          >
                            Name {getSortIcon('name')}
                          </th>
                          <th 
                            className="sortable" 
                            onClick={() => handleSort('email')}
                            style={{ cursor: 'pointer' }}
                          >
                            Email {getSortIcon('email')}
                          </th>
                          <th 
                            className="sortable" 
                            onClick={() => handleSort('rating')}
                            style={{ cursor: 'pointer' }}
                          >
                            Rating {getSortIcon('rating')}
                          </th>
                          <th 
                            className="sortable" 
                            onClick={() => handleSort('created_at')}
                            style={{ cursor: 'pointer' }}
                          >
                            Date {getSortIcon('created_at')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {raters.map((rater, index) => (
                          <tr key={index}>
                            <td>{rater.name}</td>
                            <td>{rater.email}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                {renderStars(rater.rating)}
                                <span className="ms-2">({rater.rating}/5)</span>
                              </div>
                            </td>
                            <td>
                              <div>
                                {new Date(rater.created_at).toLocaleDateString()}
                                {rater.updated_at !== rater.created_at && (
                                  <div className="text-muted small">
                                    Updated: {new Date(rater.updated_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'password':
        return <PasswordUpdate />;

      default:
        return null;
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-success">
        <div className="container-fluid">
          <span className="navbar-brand">
            <i className="fas fa-store me-2"></i>
            Store Owner Dashboard
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
                    onClick={logout}
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
                className={`list-group-item list-group-item-action ${activeTab === 'raters' ? 'active' : ''}`}
                onClick={() => setActiveTab('raters')}
              >
                <i className="fas fa-users me-2"></i>
                Raters
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

export default StoreOwnerDashboard;
