import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@constants/routes'
import './Auth.scss'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('errors.validation')
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired')
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordMinLength')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Here should be actual authentication API call
      // const response = await authApi.login(formData)
      // if (response.success) {
      //   navigate(ROUTES.USER_DASHBOARD)
      // }
      
      // Temporary: always show error until real API is connected
      setErrors({ general: t('auth.invalidCredentials') })
    } catch (error) {
      setErrors({ general: t('errors.generic') })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{t('auth.signIn')}</h1>
          <p>{t('auth.signInDescription')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-message general">
              ❌ {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.emailPlaceholder')}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.passwordPlaceholder')}
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>{t('auth.rememberMe')}</span>
            </label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-link">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <div className="auth-divider">
          <span>{t('common.or')}</span>
        </div>

        <div className="social-login">
          <button className="social-btn google">
            <span className="icon">🔴</span>
            {t('auth.signInWithGoogle')}
          </button>
        </div>

        <div className="auth-footer">
          <p>
            {t('auth.dontHaveAccount')}{' '}
            <Link to={ROUTES.REGISTER} className="auth-link">
              {t('auth.signUp')}
            </Link>
          </p>
        </div>

      </div>

      <div className="auth-benefits">
        <div className="benefit-item">
          <span className="benefit-icon">🛒</span>
          <div className="benefit-content">
            <h3>Быстрое оформление</h3>
            <p>Сохраненные адреса и способы оплаты</p>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">📦</span>
          <div className="benefit-content">
            <h3>История заказов</h3>
            <p>Отслеживание статуса и повторные заказы</p>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">❤️</span>
          <div className="benefit-content">
            <h3>Список желаний</h3>
            <p>Сохраняйте понравившиеся товары</p>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">🎁</span>
          <div className="benefit-content">
            <h3>Персональные скидки</h3>
            <p>Эксклюзивные предложения для вас</p>
          </div>
        </div>
      </div>
    </div>
  )
}