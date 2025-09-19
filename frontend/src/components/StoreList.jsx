import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [stores, filters]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await api.getStores();
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
    if (filters.name) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.email) {
      filtered = filtered.filter(store =>
        store.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    if (filters.address) {
      filtered = filtered.filter(store =>
        store.address.toLowerCase().includes(filters.address.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === 'rating') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }

      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    setFilteredStores(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field) => {
    if (filters.sortBy !== field) {
      return <i className="fas fa-sort text-muted"></i>;
    }
    return filters.sortOrder === 'asc' ? 
      <i className="fas fa-sort-up text-primary"></i> : 
      <i className="fas fa-sort-down text-primary"></i>;
  };

  const renderStars = (rating, count) => {
    if (!rating) {
      return <span className="text-muted">No ratings</span>;
    }
    
    const stars = [];
    const roundedRating = Math.round(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`${i <= roundedRating ? 'fas text-warning' : 'far text-muted'} fa-star`}
        />
      );
    }
    
    return (
      <div className="d-flex align-items-center">
        <div className="me-2">{stars}</div>
        <span className="small text-muted">
          {rating.toFixed(1)} ({count} rating{count !== 1 ? 's' : ''})
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row mb-4">
        <div className="col-12">
          <h2>Store Management</h2>
          <p className="text-muted">View and manage all registered stores</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by name..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by email..."
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by address..."
                value={filters.address}
                onChange={(e) => handleFilterChange('address', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({
                  name: '',
                  email: '',
                  address: '',
                  sortBy: 'name',
                  sortOrder: 'asc'
                })}
              >
                <i className="fas fa-times me-1"></i>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="card">
        <div className="card-body">
          {filteredStores.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-store fa-3x text-muted mb-3"></i>
              <h4>No Stores Found</h4>
              <p className="text-muted">Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
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
                      onClick={() => handleSort('address')}
                      style={{ cursor: 'pointer' }}
                    >
                      Address {getSortIcon('address')}
                    </th>
                    <th>Rating</th>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('created_at')}
                      style={{ cursor: 'pointer' }}
                    >
                      Created {getSortIcon('created_at')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStores.map((store) => (
                    <tr key={store.id}>
                      <td>{store.id}</td>
                      <td>
                        <strong>{store.name}</strong>
                      </td>
                      <td>{store.email}</td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '250px' }} title={store.address}>
                          {store.address}
                        </div>
                      </td>
                      <td>
                        {renderStars(store.rating, store.rating_count)}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(store.created_at).toLocaleDateString()}
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
};

export default StoreList;
