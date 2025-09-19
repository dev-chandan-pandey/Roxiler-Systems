import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validatePassword } from '../utils/validation';

const PasswordUpdate = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();

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
    // Clear success message when user starts typing
    if (success) {
      setSuccess(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
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
      const result = await updatePassword(formData.currentPassword, formData.newPassword);
      
      if (result.success) {
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setErrors({});
        setSuccess(true);
      } else {
        if (result.errors) {
          const fieldErrors = {};
          result.errors.forEach(err => {
            if (err.param) {
              fieldErrors[err.param] = err.msg;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: result.error });
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    
    let strength = 0;
    let feedback = [];
    
    if (password.length >= 8) strength++;
    else feedback.push('At least 8 characters');
    
    if (password.length <= 16) strength++;
    else feedback.push('No more than 16 characters');
    
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('One uppercase letter');
    
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    else feedback.push('One special character');
    
    const strengthMap = {
      0: { level: 'Very Weak', class: 'bg-danger', width: '20%' },
      1: { level: 'Weak', class: 'bg-warning', width: '40%' },
      2: { level: 'Fair', class: 'bg-info', width: '60%' },
      3: { level: 'Good', class: 'bg-primary', width: '80%' },
      4: { level: 'Strong', class: 'bg-success', width: '100%' }
    };
    
    return {
      ...strengthMap[strength],
      feedback: feedback.length > 0 ? 'Missing: ' + feedback.join(', ') : 'All requirements met'
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div>
      <div className="row mb-4">
        <div className="col-12">
          <h2>Change Password</h2>
          <p className="text-muted">Update your account password</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card">
            <div className="card-body">
              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  Password updated successfully!
                </div>
              )}

              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">
                    Current Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                  />
                  {errors.currentPassword && (
                    <div className="invalid-feedback">
                      {errors.currentPassword}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    New Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    minLength={8}
                    maxLength={16}
                    required
                  />
                  {errors.newPassword && (
                    <div className="invalid-feedback">
                      {errors.newPassword}
                    </div>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword && passwordStrength && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">Password Strength:</small>
                        <small className={`fw-bold ${passwordStrength.class.replace('bg-', 'text-')}`}>
                          {passwordStrength.level}
                        </small>
                      </div>
                      <div className="progress" style={{ height: '4px' }}>
                        <div 
                          className={`progress-bar ${passwordStrength.class}`}
                          style={{ width: passwordStrength.width }}
                        ></div>
                      </div>
                      <small className="text-muted">{passwordStrength.feedback}</small>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">
                      {errors.confirmPassword}
                    </div>
                  )}
                  {formData.confirmPassword && formData.newPassword && 
                   formData.confirmPassword === formData.newPassword && (
                    <div className="text-success small mt-1">
                      <i className="fas fa-check me-1"></i>
                      Passwords match
                    </div>
                  )}
                </div>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Password Requirements:</strong>
                  <ul className="mb-0 mt-2">
                    <li>8-16 characters long</li>
                    <li>At least one uppercase letter</li>
                    <li>At least one special character</li>
                  </ul>
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
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key me-2"></i>
                        Update Password
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setFormData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setErrors({});
                      setSuccess(false);
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
      </div>
    </div>
  );
};

export default PasswordUpdate;
