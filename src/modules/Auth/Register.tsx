import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@store/store';
import { register, selectAuth, resendVerification } from '@store/slices/authSlice';
import './Auth.scss';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, error } = useSelector(selectAuth);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { name, email, password } = formData;
      await dispatch(register({ full_name: name, email, password })).unwrap();
      setRegisteredEmail(email);
      setRegistrationSuccess(true);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="auth">
        <div className="auth__container">
          <div className="auth__card">
            <div className="auth__success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="#10b981" strokeWidth="2"/>
                <path d="M7 13l3 3 7-7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="auth__title">Check Your Email!</h1>
            <p className="auth__message auth__message--success">
              We've sent a verification email to <strong>{registeredEmail}</strong>
            </p>
            <p className="auth__message">
              Please check your inbox and click the verification link to activate your account.
            </p>
            <div className="auth__info-box">
              <p><strong>Didn't receive the email?</strong></p>
              <ul>
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes and check again</li>
              </ul>
            </div>
            <div className="auth__actions">
              <button
                className="auth__button auth__button--secondary"
                onClick={() => {
                  dispatch(resendVerification({ email: registeredEmail }));
                }}
              >
                Resend Verification Email
              </button>
              <Link to="/login" className="auth__button auth__button--primary">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__card">
          <h1 className="auth__title">Create Account</h1>
          <p className="auth__subtitle">Join us today! Create your account to get started</p>

          {error && (
            <div className="auth__error">
              {error}
            </div>
          )}

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__field">
              <label className="auth__label" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`auth__input ${validationErrors.name ? 'auth__input--error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />
              {validationErrors.name && (
                <span className="auth__error-text">{validationErrors.name}</span>
              )}
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`auth__input ${validationErrors.email ? 'auth__input--error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {validationErrors.email && (
                <span className="auth__error-text">{validationErrors.email}</span>
              )}
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`auth__input ${validationErrors.password ? 'auth__input--error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              {validationErrors.password && (
                <span className="auth__error-text">{validationErrors.password}</span>
              )}
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`auth__input ${validationErrors.confirmPassword ? 'auth__input--error' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {validationErrors.confirmPassword && (
                <span className="auth__error-text">{validationErrors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="auth__submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth__footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth__link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;