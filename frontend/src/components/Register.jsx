import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validatePassword, validateAddress, formatErrors } from '../utils/validation';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await register(formData);
    
    if (!result.success) {
      if (result.errors) {
        const fieldErrors = {};
        result.errors.forEach(error => {
          if (error.param) {
            fieldErrors[error.param] = error.msg;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: result.error });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="card-title mb-2">Create Account</h2>
                  <p className="text-muted">Join our store rating platform</p>
                </div>

                {errors.general && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full Name <span className="text-muted">(20-60 characters)</span>
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
                    <label htmlFor="email" className="form-label">Email Address</label>
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
                      Password <span className="text-muted">(8-16 chars, 1 uppercase, 1 special)</span>
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

                  <div className="mb-4">
                    <label htmlFor="address" className="form-label">
                      Address <span className="text-muted">(Max 400 characters)</span>
                    </label>
                    <textarea
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
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

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </span>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary text-decoration-none">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
