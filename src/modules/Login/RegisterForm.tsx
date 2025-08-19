import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Button } from '@components/Button'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { registerAsync } from '@store/slices/authSlice'
import { RegisterRequest } from '@types/interfaces/auth'
import { authApi } from '@api/authApi'
import { useNotification } from '@hooks/useNotification'

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[@$!%*?&#]/.test(password)) strength++
  return strength
}

const getPasswordStrengthLabel = (strength: number, t: any) => {
  switch (strength) {
    case 0:
    case 1:
      return { label: t('auth.passwordStrength.weak'), color: 'var(--color-error-500)' }
    case 2:
      return { label: t('auth.passwordStrength.fair'), color: 'var(--color-warning-500)' }
    case 3:
      return { label: t('auth.passwordStrength.good'), color: 'var(--color-info-500)' }
    case 4:
    case 5:
      return { label: t('auth.passwordStrength.strong'), color: 'var(--color-success-500)' }
    default:
      return { label: '', color: '' }
  }
}

const getSchema = (t: any) => yup.object({
  email: yup
    .string()
    .email(t('auth.emailInvalid'))
    .required(t('auth.emailRequired'))
    .test('email-available', t('auth.emailTaken'), async function(email) {
      if (!email) return true
      try {
        // Check email availability via API
        const response = await authApi.checkEmailAvailability(email)
        return response.available
      } catch {
        return true // Assume available if API fails
      }
    }),
  password: yup
    .string()
    .min(8, t('auth.passwordMinLength'))
    .matches(/[a-z]/, t('auth.passwordRequiresLowercase'))
    .matches(/[A-Z]/, t('auth.passwordRequiresUppercase'))
    .matches(/\d/, t('auth.passwordRequiresNumber'))
    .matches(/[@$!%*?&#]/, t('auth.passwordRequiresSpecial'))
    .required(t('auth.passwordRequired')),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], t('auth.passwordMismatch'))
    .required(t('auth.confirmPasswordRequired')),
  firstName: yup
    .string()
    .required(t('auth.firstNameRequired'))
    .min(2, t('auth.firstNameMinLength'))
    .matches(/^[a-zA-Zа-яА-ЯёЁїЇіІєЄґҐ\s'-]+$/, t('auth.nameInvalid')),
  lastName: yup
    .string()
    .required(t('auth.lastNameRequired'))
    .min(2, t('auth.lastNameMinLength'))
    .matches(/^[a-zA-Zа-яА-ЯёЁїЇіІєЄґҐ\s'-]+$/, t('auth.nameInvalid')),
  phone: yup
    .string()
    .matches(/^[\d\s()+-]+$/, t('auth.phoneInvalid'))
    .min(10, t('auth.phoneMinLength'))
    .optional(),
  agreeTerms: yup
    .boolean()
    .oneOf([true], t('auth.mustAgreeTerms'))
    .required(t('auth.mustAgreeTerms')),
  newsletter: yup
    .boolean()
    .optional(),
})

interface RegisterFormProps {
  onSuccess?: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const notification = useNotification()
  const { isLoading, error } = useAppSelector((state) => state.auth)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    trigger,
  } = useForm<RegisterRequest & { agreeTerms: boolean }>({
    resolver: yupResolver(getSchema(t)),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      newsletter: false,
      agreeTerms: false,
    }
  })

  // Watch password for strength indicator
  const watchPassword = watch('password')
  React.useEffect(() => {
    if (watchPassword) {
      setPasswordStrength(checkPasswordStrength(watchPassword))
    } else {
      setPasswordStrength(0)
    }
  }, [watchPassword])

  const onSubmit = async (data: RegisterRequest) => {
    try {
      const registrationData = {
        ...data,
        newsletter,
        // Remove agreeTerms from API payload
        agreeTerms: undefined
      }
      
      await dispatch(registerAsync(registrationData)).unwrap()
      
      notification.success(t('auth.registerSuccess'))
      reset()
      onSuccess?.()
    } catch (error: any) {
      // Check for specific error types
      if (error === 'EMAIL_ALREADY_EXISTS') {
        notification.error(t('auth.emailAlreadyExists'))
      } else if (error === 'WEAK_PASSWORD') {
        notification.error(t('auth.weakPassword'))
      } else {
        notification.error(t('errors.generic'))
      }
      console.error('Registration failed:', error)
    }
  }

  const handleSocialRegister = async (provider: 'google' | 'vk') => {
    try {
      if (provider === 'google') {
        // Initialize Google OAuth
        window.location.href = `${process.env.VITE_API_BASE_URL}/auth/google`
      } else if (provider === 'vk') {
        // Initialize VK OAuth
        window.location.href = `${process.env.VITE_API_BASE_URL}/auth/vk`
      }
    } catch (error) {
      notification.error(t('auth.socialAuthFailed'))
    }
  }

  const passwordStrengthInfo = getPasswordStrengthLabel(passwordStrength, t)

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="login__form">
        {error && (
          <div className="login__error">
            {t(`errors.${error}`, error)}
          </div>
        )}

        {/* Name Fields */}
        <div className="login__field-row">
          <div className="login__field login__field--half">
            <label htmlFor="firstName" className="login__label">
              {t('auth.firstName')} *
            </label>
            <input
              id="firstName"
              type="text"
              className={`login__input ${errors.firstName ? 'login__input--error' : ''}`}
              placeholder={t('auth.firstNamePlaceholder')}
              autoComplete="given-name"
              {...register('firstName')}
            />
            {errors.firstName && (
              <span className="login__field-error">{errors.firstName.message}</span>
            )}
          </div>

          <div className="login__field login__field--half">
            <label htmlFor="lastName" className="login__label">
              {t('auth.lastName')} *
            </label>
            <input
              id="lastName"
              type="text"
              className={`login__input ${errors.lastName ? 'login__input--error' : ''}`}
              placeholder={t('auth.lastNamePlaceholder')}
              autoComplete="family-name"
              {...register('lastName')}
            />
            {errors.lastName && (
              <span className="login__field-error">{errors.lastName.message}</span>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="login__field">
          <label htmlFor="email" className="login__label">
            {t('auth.email')} *
          </label>
          <input
            id="email"
            type="email"
            className={`login__input ${errors.email ? 'login__input--error' : ''}`}
            placeholder={t('auth.emailPlaceholder')}
            autoComplete="email"
            {...register('email')}
            onBlur={() => trigger('email')}
          />
          {errors.email && (
            <span className="login__field-error">{errors.email.message}</span>
          )}
        </div>

        {/* Phone Field */}
        <div className="login__field">
          <label htmlFor="phone" className="login__label">
            {t('auth.phone')}
          </label>
          <input
            id="phone"
            type="tel"
            className={`login__input ${errors.phone ? 'login__input--error' : ''}`}
            placeholder={t('auth.phonePlaceholder')}
            autoComplete="tel"
            {...register('phone')}
          />
          {errors.phone && (
            <span className="login__field-error">{errors.phone.message}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="login__field">
          <label htmlFor="password" className="login__label">
            {t('auth.password')} *
          </label>
          <div className="login__password-field">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`login__input ${errors.password ? 'login__input--error' : ''}`}
              placeholder={t('auth.passwordPlaceholder')}
              autoComplete="new-password"
              {...register('password')}
            />
            <button
              type="button"
              className="login__password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {watchPassword && (
            <div className="login__password-strength">
              <div className="login__password-strength-bar">
                <div 
                  className="login__password-strength-fill"
                  style={{
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor: passwordStrengthInfo.color
                  }}
                />
              </div>
              <span 
                className="login__password-strength-label"
                style={{ color: passwordStrengthInfo.color }}
              >
                {passwordStrengthInfo.label}
              </span>
            </div>
          )}
          {errors.password && (
            <span className="login__field-error">{errors.password.message}</span>
          )}
          <div className="login__password-requirements">
            <p className="login__password-requirement-title">{t('auth.passwordRequirements')}:</p>
            <ul className="login__password-requirement-list">
              <li className={watchPassword?.length >= 8 ? 'valid' : ''}>
                {t('auth.passwordReq8Chars')}
              </li>
              <li className={/[a-z]/.test(watchPassword || '') && /[A-Z]/.test(watchPassword || '') ? 'valid' : ''}>
                {t('auth.passwordReqMixedCase')}
              </li>
              <li className={/\d/.test(watchPassword || '') ? 'valid' : ''}>
                {t('auth.passwordReqNumber')}
              </li>
              <li className={/[@$!%*?&#]/.test(watchPassword || '') ? 'valid' : ''}>
                {t('auth.passwordReqSpecial')}
              </li>
            </ul>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="login__field">
          <label htmlFor="confirmPassword" className="login__label">
            {t('auth.confirmPassword')} *
          </label>
          <div className="login__password-field">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`login__input ${errors.confirmPassword ? 'login__input--error' : ''}`}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="login__password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="login__field-error">{errors.confirmPassword.message}</span>
          )}
        </div>

        {/* Terms and Newsletter */}
        <div className="login__agreements">
          <label className="login__checkbox">
            <input
              type="checkbox"
              {...register('agreeTerms')}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span>
              {t('auth.agreeToTerms')}{' '}
              <button
                type="button"
                className="login__link-button"
                onClick={() => setShowTermsModal(true)}
              >
                {t('auth.termsOfService')}
              </button>
              {' '}{t('common.and')}{' '}
              <button
                type="button"
                className="login__link-button"
                onClick={() => setShowPrivacyModal(true)}
              >
                {t('auth.privacyPolicy')}
              </button>
              {' '}*
            </span>
          </label>
          {errors.agreeTerms && (
            <span className="login__field-error">{errors.agreeTerms.message}</span>
          )}

          <label className="login__checkbox">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
            />
            <span>{t('auth.newsletter')}</span>
          </label>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          fullWidth
          className="login__submit"
          disabled={!isValid}
        >
          {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
        </Button>

        {/* Временно скрыто - социальная авторизация
        <div className="login__divider">
          <span>{t('common.or')}</span>
        </div>

        <div className="login__social">
          <button 
            type="button" 
            className="login__social-btn login__social-btn--google"
            onClick={() => handleSocialRegister('google')}
            disabled={isLoading}
          >
            {t('auth.signUpWithGoogle')}
          </button>
          <button 
            type="button" 
            className="login__social-btn login__social-btn--vk"
            onClick={() => handleSocialRegister('vk')}
            disabled={isLoading}
          >
            {t('auth.signUpWithVK')}
          </button>
        </div>
        */}

        <div className="login__field-info">
          <p className="login__info-text">
            * {t('auth.requiredFields')}
          </p>
        </div>
      </form>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('auth.termsOfService')}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowTermsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <iframe 
                src="/terms-of-service" 
                title={t('auth.termsOfService')}
                style={{ width: '100%', height: '400px', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('auth.privacyPolicy')}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowPrivacyModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <iframe 
                src="/privacy-policy" 
                title={t('auth.privacyPolicy')}
                style={{ width: '100%', height: '400px', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}