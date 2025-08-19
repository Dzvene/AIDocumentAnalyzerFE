import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '@store/hooks'
import { registerAsync } from '@store/slices/authSlice'
import { ROUTES } from '@constants/routes'
import { useNotification } from '@hooks/useNotification'
import './Auth.scss'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const notification = useNotification()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    subscribeNewsletter: false
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('auth.firstNameRequired')
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t('auth.firstNameMinLength')
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('auth.lastNameRequired')
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = t('auth.lastNameMinLength')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.invalidEmail')
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('auth.phoneRequired')
    } else if (!/^[\+]?[7|8]?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('auth.invalidPhone')
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired')
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordMinLength')
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('auth.passwordLettersNumbers')
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch')
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t('auth.acceptTermsRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await dispatch(registerAsync({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        newsletter: formData.subscribeNewsletter
      })).unwrap()
      
      notification.success(t('auth.registerSuccess'))
      navigate(ROUTES.LOGIN)
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        setErrors({ email: t('auth.userAlreadyExists') })
      } else {
        setErrors({ general: error.message || t('auth.registrationError') })
      }
      notification.error(t('auth.registrationFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{t('auth.createAccount')}</h1>
          <p>{t('auth.registerDescription')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-message general">
              ❌ {errors.general}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">{t('auth.firstName')}</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t('auth.placeholderFirstName')}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && (
                <span className="error-text">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">{t('auth.lastName')}</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t('auth.placeholderLastName')}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && (
                <span className="error-text">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('auth.emailAddress')}</label>
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
            <label htmlFor="phone">{t('auth.phoneNumber')}</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('auth.placeholderPhone')}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && (
              <span className="error-text">{errors.phone}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">{t('auth.password')}</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('auth.placeholderPasswordMin')}
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

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('auth.confirmPasswordLabel')}</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('auth.placeholderConfirmPassword')}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="form-checkboxes">
            <label className={`checkbox-label ${errors.acceptTerms ? 'error' : ''}`}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <span>
                {t('auth.acceptTermsText')}{' '}
                <Link to={ROUTES.TERMS_CONDITIONS} target="_blank">
                  {t('auth.termsAndConditions')}
                </Link>{' '}
                {t('auth.and')}{' '}
                <Link to={ROUTES.PRIVACY_POLICY} target="_blank">
                  {t('auth.privacyPolicy')}
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <span className="error-text">{errors.acceptTerms}</span>
            )}

            <label className="checkbox-label optional">
              <input
                type="checkbox"
                name="subscribeNewsletter"
                checked={formData.subscribeNewsletter}
                onChange={handleChange}
              />
              <span>{t('auth.subscribeNewsletterText')}</span>
            </label>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('auth.registering') : t('auth.createAccount')}
          </button>
        </form>

        <div className="auth-divider">
          <span>{t('common.or')}</span>
        </div>

        <div className="social-login">
          <button className="social-btn google" type="button" onClick={() => notification.info(t('auth.oauthInDevelopment'))}>
            <span className="icon">🔴</span>
            {t('auth.registerWithGoogle')}
          </button>
        </div>

        <div className="auth-footer">
          <p>
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to={ROUTES.LOGIN} className="auth-link">
              {t('common.login')}
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-benefits">
        <div className="benefit-item">
          <span className="benefit-icon">🚀</span>
          <div className="benefit-content">
            <h3>{t('auth.fastRegistration')}</h3>
            <p>{t('auth.fastRegistrationDesc')}</p>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">🔒</span>
          <div className="benefit-content">
            <h3>{t('auth.dataSecurity')}</h3>
            <p>{t('auth.dataSecurityDesc')}</p>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">💰</span>
          <div className="benefit-content">
            <h3>{t('auth.exclusiveDiscounts')}</h3>
            <p>{t('auth.exclusiveDiscountsDesc')}</p>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">📱</span>
          <div className="benefit-content">
            <h3>{t('auth.shoppingConvenience')}</h3>
            <p>{t('auth.shoppingConvenienceDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}