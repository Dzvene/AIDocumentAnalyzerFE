import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@store/store';
import { verifyEmail } from '@store/slices/authSlice';
import './Auth.scss';

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('No verification token provided');
        setStatus('error');
        return;
      }

      try {
        await dispatch(verifyEmail({ token })).unwrap();
        setStatus('success');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
      } catch (err: any) {
        setError(err.message || 'Email verification failed');
        setStatus('error');
      }
    };

    verify();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__card">
          {status === 'verifying' && (
            <>
              <h1 className="auth__title">Verifying Email</h1>
              <div className="auth__loading">
                <div className="auth__spinner"></div>
                <p className="auth__message">
                  Please wait while we verify your email address...
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="auth__success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" stroke="#10b981" strokeWidth="2"/>
                  <path d="M7 12l3 3 7-7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="auth__title">Email Verified!</h1>
              <p className="auth__message auth__message--success">
                Your email has been successfully verified. You can now access all features of AI Document Analyzer.
              </p>
              <p className="auth__redirect-message">
                Redirecting to dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="auth__error-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" stroke="#ef4444" strokeWidth="2"/>
                  <path d="M8 8l8 8M16 8l-8 8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className="auth__title">Verification Failed</h1>
              <div className="auth__error">
                <p>{error}</p>
              </div>
              <div className="auth__actions">
                <Link to="/login" className="auth__button auth__button--primary">
                  Go to Login
                </Link>
                <Link to="/resend-verification" className="auth__button auth__button--secondary">
                  Resend Verification Email
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;