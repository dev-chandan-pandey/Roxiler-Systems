import React, { useState } from 'react';
import { api } from '../services/api';
import { validateEmail, validateAddress } from '../utils/validation';

const AddStore = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
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
    
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Store name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Store name must not exceed 100 characters';
    }
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;

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
      await api.addStore(formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        address: ''
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
        setErrors({ general: error.response?.data?.error || 'Failed to add store' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row mb-4">
        <div className="col-12">
          <h2>Add New Store</h2>
          <p className="text-muted">Register a new store on the platform</p>
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
                    Store Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                  {errors.name && (
                    <div className="invalid-feedback">
                      {errors.name}
                    </div>
                  )}
                  <div className="form-text">
                    {formData.name.length}/100 characters
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Store Email <span className="text-danger">*</span>
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
                  <div className="form-text">
                    This will be the store's contact email address
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Store Address <span className="text-danger">*</span>
                    <small className="text-muted">(Max 400 characters)</small>
                  </label>
                  <textarea
                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={6}
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

            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Note:</strong> This store will be created without an associated owner. 
              To create a store with an owner, add a new user with the "Store Owner" role instead.
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </span>
                    Creating Store...
                  </>
                ) : (
                  <>
                    <i className="fas fa-store me-2"></i>
                    Create Store
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
                    address: ''
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

export default AddStore;
