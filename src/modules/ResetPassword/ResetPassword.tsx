import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@constants/routes'
import './ResetPassword.scss'

interface FormData {
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  newPassword?: string
  confirmPassword?: string
  general?: string
}

export const ResetPassword: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState<FormData>({
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  })
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  })
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [resetComplete, setResetComplete] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    window.scrollTo(0, 0)
    validateResetToken()
  }, [])

  const validateResetToken = async () => {
    if (!token || !email) {
      setTokenValid(false)
      return
    }

    try {
      // Simulate API call to validate token
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate random token validity (80% valid)
      const isValid = Math.random() > 0.2
      setTokenValid(isValid)
      
      if (!isValid) {
        setErrors({
          general: 'Ссылка для сброса пароля недействительна или истекла'
        })
      }
    } catch (error) {
      setTokenValid(false)
      setErrors({
        general: 'Ошибка при проверке ссылки сброса пароля'
      })
    }
  }

  const validatePasswordStrength = (password: string) => {
    let score = 0
    let feedback = ''

    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

    switch (score) {
      case 0:
      case 1:
        feedback = 'Очень слабый пароль'
        break
      case 2:
        feedback = 'Слабый пароль'
        break
      case 3:
        feedback = 'Средний пароль'
        break
      case 4:
        feedback = 'Сильный пароль'
        break
      case 5:
        feedback = 'Очень сильный пароль'
        break
    }

    return { score, feedback }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }

    // Update password strength for new password
    if (name === 'newPassword') {
      setPasswordStrength(validatePasswordStrength(value))
    }
  }

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'Введите новый пароль'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Пароль должен содержать минимум 8 символов'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите новый пароль'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    // Password strength check
    if (formData.newPassword && passwordStrength.score < 3) {
      newErrors.newPassword = 'Пароль слишком простой. Используйте буквы разного регистра, цифры и специальные символы'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate random server error (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Произошла ошибка при сбросе пароля')
      }

      setResetComplete(true)
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 3000)
      
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Произошла ошибка при сбросе пароля'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1: return '#e74c3c'
      case 2: return '#f39c12'
      case 3: return '#f1c40f'
      case 4: return '#27ae60'
      case 5: return '#2ecc71'
      default: return '#bdc3c7'
    }
  }

  const passwordRequirements = [
    { text: 'Минимум 8 символов', met: formData.newPassword.length >= 8 },
    { text: 'Строчная буква (a-z)', met: /[a-z]/.test(formData.newPassword) },
    { text: 'Заглавная буква (A-Z)', met: /[A-Z]/.test(formData.newPassword) },
    { text: 'Цифра (0-9)', met: /\d/.test(formData.newPassword) },
    { text: 'Специальный символ (!@#$...)', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) }
  ]

  // Loading state while validating token
  if (tokenValid === null) {
    return (
      <div className="reset-password-page">
        <div className="container">
          <div className="reset-password-content">
            <div className="validation-loading">
              <div className="spinner"></div>
              <h2>Проверка ссылки сброса</h2>
              <p>Пожалуйста, подождите...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="reset-password-page">
        <div className="container">
          <div className="reset-password-content">
            <div className="invalid-token">
              <div className="error-icon">⚠️</div>
              <h2>Недействительная ссылка</h2>
              <p>Ссылка для сброса пароля недействительна или истекла.</p>
              <div className="error-actions">
                <Link to={ROUTES.FORGOT_PASSWORD} className="retry-btn">
                  Запросить новую ссылку
                </Link>
                <Link to={ROUTES.LOGIN} className="login-btn">
                  Войти в аккаунт
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (resetComplete) {
    return (
      <div className="reset-password-page">
        <div className="container">
          <div className="reset-password-content">
            <div className="reset-success">
              <div className="success-icon">✅</div>
              <h2>Пароль успешно изменен!</h2>
              <p>Ваш пароль был успешно изменен. Теперь вы можете войти в аккаунт с новым паролем.</p>
              <div className="success-actions">
                <Link to={ROUTES.LOGIN} className="login-btn">
                  Войти в аккаунт
                </Link>
              </div>
              <div className="auto-redirect">
                <p>Автоматический переход через 3 секунды...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reset-password-page">
      <div className="container">
        <div className="reset-password-content">
          <div className="form-section">
            <div className="form-header">
              <div className="header-icon">🔐</div>
              <div>
                <h2>Создание нового пароля</h2>
                <p>Введите новый пароль для вашего аккаунта <strong>{email}</strong></p>
              </div>
            </div>

            {errors.general && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="reset-form">
              <div className="form-group">
                <label htmlFor="newPassword">Новый пароль *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={errors.newPassword ? 'error' : ''}
                    placeholder="Введите новый пароль"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new')}
                    tabIndex={-1}
                  >
                    {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="field-error">{errors.newPassword}</span>
                )}
                
                {formData.newPassword && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill"
                        style={{ 
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthColor(passwordStrength.score)
                        }}
                      />
                    </div>
                    <span 
                      className="strength-text"
                      style={{ color: getPasswordStrengthColor(passwordStrength.score) }}
                    >
                      {passwordStrength.feedback}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Подтвердите новый пароль *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Повторите новый пароль"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm')}
                    tabIndex={-1}
                  >
                    {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="field-error">{errors.confirmPassword}</span>
                )}
                
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <span className="success-text">✓ Пароли совпадают</span>
                )}
              </div>

              <div className="form-actions">
                <Link to={ROUTES.LOGIN} className="cancel-btn">
                  Отмена
                </Link>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Сохранение...
                    </>
                  ) : (
                    '🔐 Сохранить пароль'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="requirements-section">
            <h3>Требования к паролю</h3>
            <div className="requirements-list">
              {passwordRequirements.map((req, index) => (
                <div 
                  key={index}
                  className={`requirement ${req.met ? 'met' : 'not-met'}`}
                >
                  <span className="requirement-icon">
                    {req.met ? '✅' : '⭕'}
                  </span>
                  <span className="requirement-text">{req.text}</span>
                </div>
              ))}
            </div>

            <div className="security-tips">
              <h4>💡 Советы по безопасности</h4>
              <ul>
                <li>Не используйте личную информацию в пароле</li>
                <li>Не используйте один пароль для разных сайтов</li>
                <li>Регулярно меняйте пароль (раз в 3-6 месяцев)</li>
                <li>Используйте менеджер паролей</li>
              </ul>
            </div>

            <div className="two-factor-promo">
              <div className="promo-content">
                <h4>🛡️ Двухфакторная аутентификация</h4>
                <p>После входа настройте двухфакторную аутентификацию для дополнительной защиты</p>
              </div>
            </div>

            <div className="help-links">
              <h4>Нужна помощь?</h4>
              <Link to={ROUTES.CONTACT_US} className="help-link">
                📞 Связаться с поддержкой
              </Link>
              <Link to="/faq" className="help-link">
                ❓ Часто задаваемые вопросы
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}