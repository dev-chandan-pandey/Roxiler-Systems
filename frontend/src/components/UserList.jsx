import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers();
      setUsers(response.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Apply search filters
    if (filters.name) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.email) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    if (filters.address) {
      filtered = filtered.filter(user =>
        user.address.toLowerCase().includes(filters.address.toLowerCase())
      );
    }
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
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

    setFilteredUsers(filtered);
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

  const getRoleDisplay = (role) => {
    const roleMap = {
      admin: { text: 'Admin', class: 'bg-danger' },
      user: { text: 'User', class: 'bg-primary' },
      store_owner: { text: 'Store Owner', class: 'bg-success' }
    };
    return roleMap[role] || { text: role, class: 'bg-secondary' };
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
          <h2>User Management</h2>
          <p className="text-muted">View and manage all system users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-2">
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
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by address..."
                value={filters.address}
                onChange={(e) => handleFilterChange('address', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-control"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({
                  name: '',
                  email: '',
                  address: '',
                  role: '',
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

      {/* Users Table */}
      <div className="card">
        <div className="card-body">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h4>No Users Found</h4>
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
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('role')}
                      style={{ cursor: 'pointer' }}
                    >
                      Role {getSortIcon('role')}
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
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <strong>{user.name}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }} title={user.address}>
                          {user.address}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getRoleDisplay(user.role).class}`}>
                          {getRoleDisplay(user.role).text}
                        </span>
                      </td>
                      <td>
                        {user.role === 'store_owner' && user.rating ? (
                          <div className="d-flex align-items-center">
                            <span className="me-2">{parseFloat(user.rating).toFixed(1)}</span>
                            <i className="fas fa-star text-warning"></i>
                          </div>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(user.created_at).toLocaleDateString()}
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

export default UserList;
