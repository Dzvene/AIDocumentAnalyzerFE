import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'

import { Button } from '@components/Button'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { loginAsync, clearError, verifyTwoFactorAsync } from '@store/slices/authSlice'
import { LoginRequest } from '@types/interfaces/auth'
import { ROUTES } from '@constants/routes'
import { RegisterForm } from './RegisterForm'

import { TwoFactorAuth } from './TwoFactorAuth'
import './Login.scss'

const getSchema = (t: any) => yup.object({
  email: yup
    .string()
    .email(t('auth.emailInvalid'))
    .required(t('auth.emailRequired')),
  password: yup
    .string()
    .min(6, t('auth.passwordMinLength'))
    .required(t('auth.passwordRequired')),
})

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)
  
  const [showPassword, setShowPassword] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [twoFactorData, setTwoFactorData] = useState<{
    required: boolean
    tempToken?: string
    method?: 'sms' | 'email' | 'app'
    contact?: string
  }>({ required: false })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginRequest>({
    resolver: yupResolver(getSchema(t)),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME) // Перенаправляем на главную страницу после входа
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    dispatch(clearError())
    reset()
  }, [dispatch, reset])

  const onSubmit = async (data: LoginRequest) => {
    try {
      const loginData = {
        ...data,
        rememberMe
      }
      const response = await dispatch(loginAsync(loginData)).unwrap()
      
      // Check if 2FA is required
      if ('requiresTwoFactor' in response && response.requiresTwoFactor) {
        setTwoFactorData({
          required: true,
          tempToken: response.tempToken,
          method: response.method,
          contact: response.contact
        })
      }
      // Otherwise navigation handled by useEffect
    } catch (error) {
      // Error is handled by the slice
    }
  }

  const handleTwoFactorVerify = async (code: string) => {
    if (!twoFactorData.tempToken) return
    
    try {
      await dispatch(verifyTwoFactorAsync({
        tempToken: twoFactorData.tempToken,
        code
      })).unwrap()
      
      // Clear 2FA state on success
      setTwoFactorData({ required: false })
      // Navigation handled by useEffect
    } catch (error) {
      // Error is handled by the slice
    }
  }

  const handleTwoFactorCancel = () => {
    setTwoFactorData({ required: false })
    reset()
  }

  return (
    <div className="login">
      <div className="login__container">
        {twoFactorData.required ? (
          <TwoFactorAuth
            onVerify={handleTwoFactorVerify}
            onCancel={handleTwoFactorCancel}
            isLoading={isLoading}
            error={error}
            method={twoFactorData.method}
            contact={twoFactorData.contact}
          />
        ) : (
          <>
            <div className="login__header">
              <h1 className="login__title">
                {isRegisterMode ? t('auth.signUp') : t('common.welcome')}
              </h1>
              <p className="login__subtitle">
                {isRegisterMode 
                  ? t('auth.signUpDescription') 
                  : t('auth.signInDescription')
                }
              </p>
            </div>

        <div className="login__mode-switcher">
          <button
            type="button"
            className={`login__mode-button ${!isRegisterMode ? 'login__mode-button--active' : ''}`}
            onClick={() => setIsRegisterMode(false)}
          >
            {t('auth.signIn')}
          </button>
          <button
            type="button"
            className={`login__mode-button ${isRegisterMode ? 'login__mode-button--active' : ''}`}
            onClick={() => setIsRegisterMode(true)}
          >
            {t('auth.signUp')}
          </button>
        </div>

        {!isRegisterMode ? (
          <form onSubmit={handleSubmit(onSubmit)} className="login__form">
            {error && (
              <div className="login__error">
                ❌ {t(`auth.${error}`) || t(`errors.${error}`) || error}
              </div>
            )}

            <div className="login__field">
              <label htmlFor="email" className="login__label">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                className={`login__input ${errors.email ? 'login__input--error' : ''}`}
                placeholder={t('auth.emailPlaceholder')}
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <span className="login__field-error">{errors.email.message}</span>
              )}
            </div>

            <div className="login__field">
              <label htmlFor="password" className="login__label">
                {t('auth.password')}
              </label>
              <div className="login__password-field">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`login__input ${errors.password ? 'login__input--error' : ''}`}
                  placeholder={t('auth.passwordPlaceholder')}
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="login__password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <span className="login__field-error">{errors.password.message}</span>
              )}
            </div>

            <div className="login__options">
              <label className="login__checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>{t('auth.rememberMe')}</span>
              </label>
              <a href="/forgot-password" className="login__forgot-link">
                {t('auth.forgotPassword')}
              </a>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              fullWidth
              className="login__submit"
            >
              {isLoading ? t('auth.signingIn') : t('auth.signIn')}
            </Button>

            {/* Временно скрыто - социальная авторизация
            <div className="login__divider">
              <span>{t('common.or')}</span>
            </div>

            <div className="login__social">
              <button type="button" className="login__social-btn login__social-btn--google">
                {t('auth.signInWithGoogle')}
              </button>
              <button type="button" className="login__social-btn login__social-btn--vk">
                {t('auth.signInWithVK')}
              </button>
            </div>
            */}

            <div className="login__links">
              <p className="login__register-link">
                {t('auth.dontHaveAccount')}{' '}
                <button
                  type="button"
                  className="login__link-button"
                  onClick={() => setIsRegisterMode(true)}
                >
                  {t('auth.signUp')}
                </button>
              </p>
            </div>
          </form>
        ) : (
          <RegisterForm 
            onSuccess={() => {
              // Registration successful, user is automatically logged in
              // Navigation handled by useEffect when isAuthenticated changes
            }}
          />
        )}
          </>
        )}
      </div>
    </div>
  )
}