import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@store/store';
import { handleGoogleCallback } from '@store/slices/authSlice';
import './Auth.scss';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`Google authentication failed: ${errorParam}`);
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received from Google');
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      try {
        await dispatch(handleGoogleCallback({ code })).unwrap();
        
        // Redirect to the originally requested page or dashboard
        const redirectTo = state ? decodeURIComponent(state) : '/dashboard';
        navigate(redirectTo, { replace: true });
      } catch (err: any) {
        setError(err.message || 'Failed to complete Google sign-in');
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__card">
          <h1 className="auth__title">
            {isProcessing ? 'Completing Sign In...' : 'Authentication Error'}
          </h1>
          
          {isProcessing ? (
            <div className="auth__loading">
              <div className="auth__spinner"></div>
              <p className="auth__message">
                Please wait while we complete your Google sign-in...
              </p>
            </div>
          ) : (
            <div className="auth__error">
              <p>{error}</p>
              <p className="auth__redirect-message">
                Redirecting to login page...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;