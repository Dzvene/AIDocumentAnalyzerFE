import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './ChangePassword.scss'

interface FormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  general?: string
}

export const ChangePassword: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Введите текущий пароль'
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'Введите новый пароль'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Пароль должен содержать минимум 8 символов'
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Новый пароль должен отличаться от текущего'
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
    setSuccessMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate random server error (20% chance)
      if (Math.random() < 0.2) {
        throw new Error('Неверный текущий пароль')
      }

      setSuccessMessage('Пароль успешно изменен!')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordStrength({ score: 0, feedback: '' })
      
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Произошла ошибка при изменении пароля'
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

  return (
    <div className="change-password-page">
      <div className="page-header">
        <div className="container">
          <h1>Изменение пароля</h1>
          <nav className="breadcrumb">
            <Link to={ROUTES.HOME}>Главная</Link>
            <span>/</span>
            <Link to={ROUTES.USER_DASHBOARD}>Личный кабинет</Link>
            <span>/</span>
            <span>Изменение пароля</span>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="change-password-content">
          <div className="form-section">
            <div className="form-header">
              <div className="header-icon">🔐</div>
              <div>
                <h2>Смена пароля</h2>
                <p>Обеспечьте безопасность вашего аккаунта, используя надежный пароль</p>
              </div>
            </div>

            {successMessage && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                {successMessage}
              </div>
            )}

            {errors.general && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Текущий пароль *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={errors.currentPassword ? 'error' : ''}
                    placeholder="Введите текущий пароль"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('current')}
                    tabIndex={-1}
                  >
                    {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.currentPassword && (
                  <span className="field-error">{errors.currentPassword}</span>
                )}
                <div className="forgot-password-link">
                  <Link to={ROUTES.FORGOT_PASSWORD}>Забыли пароль?</Link>
                </div>
              </div>

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
                <Link to={ROUTES.USER_PROFILE} className="cancel-btn">
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
                      Изменение...
                    </>
                  ) : (
                    '🔐 Изменить пароль'
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

            <div className="last-change-info">
              <h4>📅 Информация</h4>
              <p><strong>Последнее изменение:</strong><br />20 июня 2024 г.</p>
              <p><strong>Количество изменений:</strong><br />3 раза</p>
            </div>

            <div className="two-factor-promo">
              <div className="promo-content">
                <h4>🛡️ Двухфакторная аутентификация</h4>
                <p>Повысьте безопасность аккаунта, включив двухфакторную аутентификацию</p>
                <Link to={ROUTES.USER_PROFILE} className="enable-2fa-btn">
                  Настроить 2FA
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}