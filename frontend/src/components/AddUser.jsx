import React, { useState } from 'react';
import { api } from '../services/api';
import { validateName, validateEmail, validatePassword, validateAddress, formatErrors } from '../utils/validation';

const AddUser = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await api.addUser(formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'user'
      });
      setErrors({});
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.param) {
            fieldErrors[err.param] = err.msg;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.response?.data?.error || 'Failed to add user' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row mb-4">
        <div className="col-12">
          <h2>Add New User</h2>
          <p className="text-muted">Create a new user account</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {errors.general && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name <span className="text-danger">*</span>
                    <small className="text-muted">(20-60 characters)</small>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    minLength={20}
                    maxLength={60}
                    required
                  />
                  {errors.name && (
                    <div className="invalid-feedback">
                      {errors.name}
                    </div>
                  )}
                  <div className="form-text">
                    {formData.name.length}/60 characters
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password <span className="text-danger">*</span>
                    <small className="text-muted">(8-16 chars, 1 uppercase, 1 special)</small>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    maxLength={16}
                    required
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    User Role <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-control ${errors.role ? 'is-invalid' : ''}`}
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="user">Normal User</option>
                    <option value="admin">System Administrator</option>
                    <option value="store_owner">Store Owner</option>
                  </select>
                  {errors.role && (
                    <div className="invalid-feedback">
                      {errors.role}
                    </div>
                  )}
                  <div className="form-text">
                    {formData.role === 'store_owner' && 
                      'A store will be automatically created for store owners.'
                    }
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Address <span className="text-danger">*</span>
                    <small className="text-muted">(Max 400 characters)</small>
                  </label>
                  <textarea
                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={4}
                    maxLength={400}
                    required
                  />
                  {errors.address && (
                    <div className="invalid-feedback">
                      {errors.address}
                    </div>
                  )}
                  <div className="form-text">
                    {formData.address.length}/400 characters
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </span>
                    Creating User...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus me-2"></i>
                    Create User
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    address: '',
                    role: 'user'
                  });
                  setErrors({});
                }}
                disabled={loading}
              >
                <i className="fas fa-times me-2"></i>
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
