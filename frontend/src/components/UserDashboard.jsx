import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PasswordUpdate from './PasswordUpdate';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('stores');
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    address: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [submittingRating, setSubmittingRating] = useState({});
  const { user, logout } = useAuth();

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [stores, searchFilters]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await api.getUserStores();
      setStores(response.stores);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...stores];

    // Apply search filters
    if (searchFilters.name) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      );
    }
    if (searchFilters.address) {
      filtered = filtered.filter(store =>
        store.address.toLowerCase().includes(searchFilters.address.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[searchFilters.sortBy];
      let bValue = b[searchFilters.sortBy];

      if (searchFilters.sortBy === 'overall_rating') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }

      if (searchFilters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    setFilteredStores(filtered);
  };

  const handleSearchChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRatingSubmit = async (storeId, rating) => {
    try {
      setSubmittingRating(prev => ({ ...prev, [storeId]: true }));
      await api.submitRating(storeId, parseInt(rating));
      
      // Reload stores to get updated ratings
      await loadStores();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(prev => ({ ...prev, [storeId]: false }));
    }
  };

  const renderStars = (rating, storeId, isUserRating = false, interactive = false) => {
    const stars = [];
    const displayRating = rating || 0;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${interactive ? 'interactive-star' : ''} ${
            i <= displayRating ? 'text-warning' : 'text-muted'
          }`}
          onClick={interactive ? () => handleRatingSubmit(storeId, i) : undefined}
          style={{ 
            cursor: interactive ? 'pointer' : 'default',
            fontSize: '1.2rem'
          }}
        >
          <i className={i <= displayRating ? 'fas fa-star' : 'far fa-star'}></i>
        </span>
      );
    }

    return (
      <div className="d-flex align-items-center">
        {stars}
        {!interactive && (
          <span className="ms-2 text-muted">
            ({displayRating.toFixed(1)})
          </span>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'stores':
        return (
          <div>
            <div className="row mb-4">
              <div className="col-12">
                <h2>Store Directory</h2>
                <p className="text-muted">Browse and rate stores on our platform</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name..."
                      value={searchFilters.name}
                      onChange={(e) => handleSearchChange('name', e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by address..."
                      value={searchFilters.address}
                      onChange={(e) => handleSearchChange('address', e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-control"
                      value={searchFilters.sortBy}
                      onChange={(e) => handleSearchChange('sortBy', e.target.value)}
                    >
                      <option value="name">Sort by Name</option>
                      <option value="address">Sort by Address</option>
                      <option value="overall_rating">Sort by Rating</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-control"
                      value={searchFilters.sortOrder}
                      onChange={(e) => handleSearchChange('sortOrder', e.target.value)}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Stores List */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-store fa-3x text-muted mb-3"></i>
                <h4>No Stores Found</h4>
                <p className="text-muted">Try adjusting your search filters.</p>
              </div>
            ) : (
              <div className="row">
                {filteredStores.map((store) => (
                  <div key={store.id} className="col-lg-6 mb-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title mb-0">{store.name}</h5>
                          <span className="badge bg-primary">ID: {store.id}</span>
                        </div>
                        
                        <p className="card-text text-muted">
                          <i className="fas fa-map-marker-alt me-2"></i>
                          {store.address}
                        </p>

                        <div className="row mb-3">
                          <div className="col-sm-6">
                            <small className="text-muted">Overall Rating:</small>
                            {renderStars(store.overall_rating)}
                          </div>
                          <div className="col-sm-6 text-end">
                            <small className="text-muted">
                              ({store.rating_count} rating{store.rating_count !== 1 ? 's' : ''})
                            </small>
                          </div>
                        </div>

                        <div className="border-top pt-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted">Your Rating:</small>
                              <div>
                                {store.user_rating ? (
                                  <span className="text-success">
                                    <i className="fas fa-star me-1"></i>
                                    {store.user_rating}/5
                                  </span>
                                ) : (
                                  <span className="text-muted">Not rated</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <small className="text-muted d-block mb-1">Rate this store:</small>
                              {submittingRating[store.id] ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              ) : (
                                renderStars(0, store.id, true, true)
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">
            <i className="fas fa-user me-2"></i>
            User Dashboard
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
                className={`list-group-item list-group-item-action ${activeTab === 'stores' ? 'active' : ''}`}
                onClick={() => setActiveTab('stores')}
              >
                <i className="fas fa-store me-2"></i>
                Browse Stores
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

export default UserDashboard;
