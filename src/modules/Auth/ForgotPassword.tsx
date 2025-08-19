import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@constants/routes'
import './Auth.scss'

export const ForgotPassword: React.FC = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError(t('auth.emailRequired'))
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.invalidEmail'))
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSuccess(true)
    } catch (error) {
      setError(t('errors.generic'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>{t('auth.emailSent')}</h1>
            <p>{t('auth.passwordResetSent')}</p>
          </div>

          <div className="success-message">
            <span className="success-icon">✅</span>
            <h3>{t('auth.checkEmail')}</h3>
            <p>
              {t('auth.instructionsSentTo')} <strong>{email}</strong>
            </p>
            <p className="note">
              {t('auth.checkSpamFolder')}
            </p>
          </div>

          <div className="auth-footer">
            <p>
              {t('auth.backTo')}{' '}
              <Link to={ROUTES.LOGIN} className="auth-link">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-benefits">
          <div className="benefit-item">
            <span className="benefit-icon">🔒</span>
            <div className="benefit-content">
              <h3>{t('auth.secureRecovery')}</h3>
              <p>{t('auth.secureRecoveryDesc')}</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <div className="benefit-content">
              <h3>{t('auth.quickProcess')}</h3>
              <p>{t('auth.quickProcessDesc')}</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">💬</span>
            <div className="benefit-content">
              <h3>{t('auth.support24')}</h3>
              <p>{t('auth.support24Desc')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{t('auth.resetPassword')}</h1>
          <p>{t('auth.resetPasswordDesc')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message general">
              ❌ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">{t('auth.emailAddress')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              className={error ? 'error' : ''}
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('auth.sending') : t('auth.sendInstructions')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('auth.rememberedPassword')}{' '}
            <Link to={ROUTES.LOGIN} className="auth-link">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-benefits">
        <div className="benefit-item">
          <span className="benefit-icon">🔒</span>
          <div className="benefit-content">
            <h3>Безопасное восстановление</h3>
            <p>Используем безопасные методы сброса пароля</p>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">⚡</span>
          <div className="benefit-content">
            <h3>Быстрый процесс</h3>
            <p>Восстановление пароля займет всего несколько минут</p>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">💬</span>
          <div className="benefit-content">
            <h3>Поддержка 24/7</h3>
            <p>Обратитесь к нам, если возникли проблемы</p>
          </div>
        </div>
      </div>
    </div>
  )
}