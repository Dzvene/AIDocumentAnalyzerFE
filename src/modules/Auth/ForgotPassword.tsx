import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@api/authApi';
import './Auth.scss';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateEmail = () => {
    if (!email) {
      setValidationError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Invalid email format');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  if (success) {
    return (
      <div className="auth">
        <div className="auth__container">
          <div className="auth__card">
            <div className="auth__success-icon">✓</div>
            <h1 className="auth__title">Check Your Email</h1>
            <p className="auth__subtitle">
              We've sent a password reset link to {email}
            </p>
            <p className="auth__text">
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <Link to="/login" className="auth__submit">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__card">
          <h1 className="auth__title">Forgot Password?</h1>
          <p className="auth__subtitle">
            No worries! Enter your email and we'll send you reset instructions.
          </p>

          {error && (
            <div className="auth__error">
              {error}
            </div>
          )}

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__field">
              <label className="auth__label" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`auth__input ${validationError ? 'auth__input--error' : ''}`}
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {validationError && (
                <span className="auth__error-text">{validationError}</span>
              )}
            </div>

            <button
              type="submit"
              className="auth__submit"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth__footer">
            <Link to="/login" className="auth__link">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;