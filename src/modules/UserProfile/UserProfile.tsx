import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './UserProfile.scss'

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  gender: 'male' | 'female' | 'other' | ''
  avatar: string
  joinDate: string
  emailVerified: boolean
  phoneVerified: boolean
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    marketing: boolean
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    loginHistory: Array<{
      date: string
      ip: string
      device: string
    }>
  }
  preferences: {
    language: string
    currency: string
    theme: 'light' | 'dark' | 'auto'
    newsletter: boolean
  }
  stats: {
    totalOrders: number
    totalSpent: number
    favoriteShops: number
    reviews: number
  }
}

export const UserProfile: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('personal')
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userData, setUserData] = useState<UserData>({
    id: 'user-123',
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan.petrov@email.com',
    phone: '+7 (999) 123-45-67',
    birthDate: '1990-05-15',
    gender: 'male',
    avatar: '',
    joinDate: '2024-01-15',
    emailVerified: true,
    phoneVerified: true,
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: true
    },
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: '2024-06-20',
      loginHistory: [
        { date: '2025-01-13T12:30:00', ip: '192.168.1.1', device: 'Chrome, Windows' },
        { date: '2025-01-12T18:45:00', ip: '192.168.1.1', device: 'Safari, iPhone' },
        { date: '2025-01-11T09:15:00', ip: '192.168.1.2', device: 'Chrome, Windows' }
      ]
    },
    preferences: {
      language: 'ru',
      currency: 'RUB',
      theme: 'light',
      newsletter: true
    },
    stats: {
      totalOrders: 24,
      totalSpent: 45670,
      favoriteShops: 8,
      reviews: 12
    }
  })

  const [formData, setFormData] = useState(userData)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      const [section, field] = name.split('.')
      
      if (section && field) {
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...prev[section as keyof UserData],
            [field]: checkbox.checked
          }
        }))
      }
    } else {
      const [section, field] = name.includes('.') ? name.split('.') : [null, name]
      
      if (section && field) {
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...prev[section as keyof UserData],
            [field]: value
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }))
      }
    }
  }

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setUserData(formData)
      setIsEditing(false)
    }, 500)
  }

  const handleCancel = () => {
    setFormData(userData)
    setIsEditing(false)
  }

  const handlePasswordChange = () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Пароли не совпадают')
      return
    }
    
    // Simulate API call
    setTimeout(() => {
      setShowPasswordModal(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      alert('Пароль успешно изменен')
    }, 500)
  }

  const handleDeleteAccount = () => {
    // Simulate account deletion
    setTimeout(() => {
      navigate(ROUTES.HOME)
    }, 500)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="container">
          <div className="header-content">
            <div className="user-avatar-section">
              <div className="avatar-wrapper">
                {userData.avatar ? (
                  <img src={userData.avatar} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {userData.firstName[0]}{userData.lastName[0]}
                  </div>
                )}
                {isEditing && (
                  <button className="change-avatar-btn">
                    📷 Изменить
                  </button>
                )}
              </div>
              <div className="user-info">
                <h1>{userData.firstName} {userData.lastName}</h1>
                <p className="user-email">
                  {userData.email}
                  {userData.emailVerified && <span className="verified">✓ Подтвержден</span>}
                </p>
                <p className="member-since">Участник с {formatDate(userData.joinDate)}</p>
              </div>
            </div>
            
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{userData.stats.totalOrders}</span>
                <span className="stat-label">Заказов</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userData.stats.totalSpent.toLocaleString()} ₽</span>
                <span className="stat-label">Потрачено</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userData.stats.favoriteShops}</span>
                <span className="stat-label">Избранных магазинов</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userData.stats.reviews}</span>
                <span className="stat-label">Отзывов</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="profile-content">
          <div className="profile-tabs">
            <button 
              className={activeTab === 'personal' ? 'active' : ''}
              onClick={() => setActiveTab('personal')}
            >
              👤 Личные данные
            </button>
            <button 
              className={activeTab === 'notifications' ? 'active' : ''}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Уведомления
            </button>
            <button 
              className={activeTab === 'security' ? 'active' : ''}
              onClick={() => setActiveTab('security')}
            >
              🔒 Безопасность
            </button>
            <button 
              className={activeTab === 'preferences' ? 'active' : ''}
              onClick={() => setActiveTab('preferences')}
            >
              ⚙️ Настройки
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'personal' && (
              <div className="personal-tab">
                <div className="section-header">
                  <h2>Личная информация</h2>
                  {!isEditing ? (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                      ✏️ Редактировать
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="cancel-btn" onClick={handleCancel}>
                        Отмена
                      </button>
                      <button className="save-btn" onClick={handleSave}>
                        💾 Сохранить
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Имя</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>Фамилия</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>Телефон</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>Дата рождения</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>Пол</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    >
                      <option value="">Не указан</option>
                      <option value="male">Мужской</option>
                      <option value="female">Женский</option>
                      <option value="other">Другой</option>
                    </select>
                  </div>
                </div>

                <div className="verification-section">
                  <h3>Верификация</h3>
                  <div className="verification-items">
                    <div className="verification-item">
                      <span className={userData.emailVerified ? 'verified' : 'unverified'}>
                        {userData.emailVerified ? '✓' : '✗'} Email {userData.emailVerified ? 'подтвержден' : 'не подтвержден'}
                      </span>
                      {!userData.emailVerified && (
                        <button className="verify-btn">Подтвердить</button>
                      )}
                    </div>
                    <div className="verification-item">
                      <span className={userData.phoneVerified ? 'verified' : 'unverified'}>
                        {userData.phoneVerified ? '✓' : '✗'} Телефон {userData.phoneVerified ? 'подтвержден' : 'не подтвержден'}
                      </span>
                      {!userData.phoneVerified && (
                        <button className="verify-btn">Подтвердить</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="notifications-tab">
                <div className="section-header">
                  <h2>Настройки уведомлений</h2>
                </div>

                <div className="notification-settings">
                  <div className="setting-group">
                    <h3>Каналы уведомлений</h3>
                    
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="notifications.email"
                        checked={formData.notifications.email}
                        onChange={handleInputChange}
                      />
                      <span>Email уведомления</span>
                      <small>Получать уведомления о заказах и акциях на email</small>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="notifications.sms"
                        checked={formData.notifications.sms}
                        onChange={handleInputChange}
                      />
                      <span>SMS уведомления</span>
                      <small>Получать SMS о статусе заказов</small>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="notifications.push"
                        checked={formData.notifications.push}
                        onChange={handleInputChange}
                      />
                      <span>Push-уведомления</span>
                      <small>Уведомления в браузере и мобильном приложении</small>
                    </label>
                  </div>

                  <div className="setting-group">
                    <h3>Типы уведомлений</h3>
                    
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="notifications.marketing"
                        checked={formData.notifications.marketing}
                        onChange={handleInputChange}
                      />
                      <span>Маркетинговые сообщения</span>
                      <small>Акции, скидки и специальные предложения</small>
                    </label>
                  </div>

                  <button className="save-settings-btn" onClick={handleSave}>
                    Сохранить настройки
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="security-tab">
                <div className="section-header">
                  <h2>Безопасность аккаунта</h2>
                </div>

                <div className="security-sections">
                  <div className="security-section">
                    <h3>Пароль</h3>
                    <p className="last-changed">
                      Последнее изменение: {formatDate(userData.security.lastPasswordChange)}
                    </p>
                    <button 
                      className="change-password-btn"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Изменить пароль
                    </button>
                  </div>

                  <div className="security-section">
                    <h3>Двухфакторная аутентификация</h3>
                    <div className="two-factor-status">
                      <span className={userData.security.twoFactorEnabled ? 'enabled' : 'disabled'}>
                        {userData.security.twoFactorEnabled ? '✓ Включена' : '✗ Отключена'}
                      </span>
                      <button className="toggle-2fa-btn">
                        {userData.security.twoFactorEnabled ? 'Отключить' : 'Включить'}
                      </button>
                    </div>
                  </div>

                  <div className="security-section">
                    <h3>История входов</h3>
                    <div className="login-history">
                      {userData.security.loginHistory.map((login, index) => (
                        <div key={index} className="login-item">
                          <div className="login-info">
                            <span className="login-date">{formatDateTime(login.date)}</span>
                            <span className="login-device">{login.device}</span>
                          </div>
                          <span className="login-ip">IP: {login.ip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="security-section danger-zone">
                    <h3>Удаление аккаунта</h3>
                    <p className="warning-text">
                      Внимание! Это действие необратимо. Все ваши данные будут удалены.
                    </p>
                    <button 
                      className="delete-account-btn"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Удалить аккаунт
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="preferences-tab">
                <div className="section-header">
                  <h2>Настройки приложения</h2>
                </div>

                <div className="preferences-form">
                  <div className="form-group">
                    <label>Язык интерфейса</label>
                    <select
                      name="preferences.language"
                      value={formData.preferences.language}
                      onChange={handleInputChange}
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                      <option value="kz">Қазақша</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Валюта</label>
                    <select
                      name="preferences.currency"
                      value={formData.preferences.currency}
                      onChange={handleInputChange}
                    >
                      <option value="RUB">₽ Российский рубль</option>
                      <option value="USD">$ Доллар США</option>
                      <option value="EUR">€ Евро</option>
                      <option value="KZT">₸ Тенге</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Тема оформления</label>
                    <select
                      name="preferences.theme"
                      value={formData.preferences.theme}
                      onChange={handleInputChange}
                    >
                      <option value="light">Светлая</option>
                      <option value="dark">Темная</option>
                      <option value="auto">Автоматически</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="preferences.newsletter"
                        checked={formData.preferences.newsletter}
                        onChange={handleInputChange}
                      />
                      <span>Подписка на рассылку</span>
                      <small>Получать новости и обновления сервиса</small>
                    </label>
                  </div>

                  <button className="save-preferences-btn" onClick={handleSave}>
                    Сохранить настройки
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Изменение пароля</h2>
              <button 
                className="close-btn"
                onClick={() => setShowPasswordModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Текущий пароль</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  placeholder="Введите текущий пароль"
                />
              </div>

              <div className="form-group">
                <label>Новый пароль</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  placeholder="Введите новый пароль"
                />
              </div>

              <div className="form-group">
                <label>Подтверждение пароля</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  placeholder="Повторите новый пароль"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowPasswordModal(false)}
              >
                Отмена
              </button>
              <button 
                className="confirm-btn"
                onClick={handlePasswordChange}
              >
                Изменить пароль
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Удаление аккаунта</h2>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p className="warning-message">
                ⚠️ Вы действительно хотите удалить свой аккаунт?
              </p>
              <p>
                Это действие необратимо. Все ваши данные, история заказов 
                и настройки будут удалены навсегда.
              </p>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Отмена
              </button>
              <button 
                className="delete-btn"
                onClick={handleDeleteAccount}
              >
                Удалить аккаунт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}