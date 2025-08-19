import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './UserAddresses.scss'

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  isDefault: boolean
  name: string
  phone: string
  street: string
  building: string
  apartment?: string
  entrance?: string
  floor?: string
  intercom?: string
  city: string
  region: string
  postalCode: string
  coordinates?: {
    lat: number
    lng: number
  }
  deliveryInstructions?: string
  createdAt: string
  lastUsed?: string
}

export const UserAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      isDefault: true,
      name: 'Иван Петров',
      phone: '+7 (999) 123-45-67',
      street: 'ул. Примерная',
      building: '123',
      apartment: '45',
      entrance: '2',
      floor: '5',
      intercom: '45',
      city: 'Москва',
      region: 'Москва',
      postalCode: '123456',
      coordinates: { lat: 55.7558, lng: 37.6173 },
      deliveryInstructions: 'Позвонить за 10 минут до доставки',
      createdAt: '2024-01-15T10:00:00',
      lastUsed: '2025-01-10T14:30:00'
    },
    {
      id: '2',
      type: 'work',
      isDefault: false,
      name: 'Иван Петров',
      phone: '+7 (999) 123-45-68',
      street: 'ул. Тестовая',
      building: '456',
      apartment: '789',
      city: 'Москва',
      region: 'Москва',
      postalCode: '123457',
      createdAt: '2024-02-20T15:00:00',
      lastUsed: '2025-01-05T11:20:00'
    },
    {
      id: '3',
      type: 'other',
      isDefault: false,
      name: 'Мария Петрова',
      phone: '+7 (999) 123-45-69',
      street: 'ул. Дачная',
      building: '10',
      city: 'Подольск',
      region: 'Московская область',
      postalCode: '142100',
      deliveryInstructions: 'Дача, калитка зеленая',
      createdAt: '2024-06-01T09:00:00'
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [showMapModal, setShowMapModal] = useState(false)
  
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    name: '',
    phone: '',
    street: '',
    building: '',
    apartment: '',
    entrance: '',
    floor: '',
    intercom: '',
    city: '',
    region: '',
    postalCode: '',
    deliveryInstructions: ''
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const getTypeIcon = (type: Address['type']) => {
    switch (type) {
      case 'home': return '🏠'
      case 'work': return '🏢'
      case 'other': return '📍'
    }
  }

  const getTypeLabel = (type: Address['type']) => {
    switch (type) {
      case 'home': return 'Дом'
      case 'work': return 'Работа'
      case 'other': return 'Другое'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleSetDefault = (addressId: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })))
  }

  const handleEdit = (address: Address) => {
    setSelectedAddress(address)
    setFormData(address)
    setShowEditModal(true)
  }

  const handleDelete = (address: Address) => {
    setSelectedAddress(address)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (selectedAddress) {
      setAddresses(prev => prev.filter(addr => addr.id !== selectedAddress.id))
      setShowDeleteModal(false)
      setSelectedAddress(null)
    }
  }

  const handleShowOnMap = (address: Address) => {
    setSelectedAddress(address)
    setShowMapModal(true)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.name?.trim()) errors.name = 'Введите имя получателя'
    if (!formData.phone?.trim()) errors.phone = 'Введите номер телефона'
    if (!formData.street?.trim()) errors.street = 'Введите улицу'
    if (!formData.building?.trim()) errors.building = 'Введите номер дома'
    if (!formData.city?.trim()) errors.city = 'Введите город'
    if (!formData.region?.trim()) errors.region = 'Введите регион'
    if (!formData.postalCode?.trim()) errors.postalCode = 'Введите почтовый индекс'
    
    // Phone validation
    const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = 'Неверный формат телефона'
    }
    
    // Postal code validation
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      errors.postalCode = 'Почтовый индекс должен содержать 6 цифр'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveAddress = () => {
    if (!validateForm()) return
    
    if (showEditModal && selectedAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === selectedAddress.id 
          ? { ...addr, ...formData }
          : addr
      ))
      setShowEditModal(false)
    } else {
      // Add new address
      const newAddress: Address = {
        ...formData as Address,
        id: Date.now().toString(),
        isDefault: addresses.length === 0,
        createdAt: new Date().toISOString()
      }
      setAddresses(prev => [...prev, newAddress])
      setShowAddModal(false)
    }
    
    // Reset form
    setFormData({
      type: 'home',
      name: '',
      phone: '',
      street: '',
      building: '',
      apartment: '',
      entrance: '',
      floor: '',
      intercom: '',
      city: '',
      region: '',
      postalCode: '',
      deliveryInstructions: ''
    })
    setFormErrors({})
    setSelectedAddress(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="user-addresses-page">
      <div className="page-header">
        <div className="container">
          <h1>Мои адреса</h1>
          <nav className="breadcrumb">
            <Link to={ROUTES.HOME}>Главная</Link>
            <span>/</span>
            <Link to={ROUTES.USER_DASHBOARD}>Личный кабинет</Link>
            <span>/</span>
            <span>Адреса доставки</span>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="addresses-content">
          <div className="addresses-header">
            <div className="header-info">
              <h2>Адреса доставки</h2>
              <p className="subtitle">
                Управляйте адресами для быстрого оформления заказов
              </p>
            </div>
            <button 
              className="add-address-btn"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Добавить адрес
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="no-addresses">
              <div className="no-addresses-icon">📍</div>
              <h3>У вас пока нет сохраненных адресов</h3>
              <p>Добавьте адрес доставки для быстрого оформления заказов</p>
              <button 
                className="add-first-btn"
                onClick={() => setShowAddModal(true)}
              >
                Добавить первый адрес
              </button>
            </div>
          ) : (
            <div className="addresses-grid">
              {addresses.map(address => (
                <div 
                  key={address.id} 
                  className={`address-card ${address.isDefault ? 'default' : ''}`}
                >
                  {address.isDefault && (
                    <div className="default-badge">По умолчанию</div>
                  )}
                  
                  <div className="address-header">
                    <div className="address-type">
                      <span className="type-icon">{getTypeIcon(address.type)}</span>
                      <span className="type-label">{getTypeLabel(address.type)}</span>
                    </div>
                    <div className="address-actions">
                      <button 
                        className="action-btn"
                        onClick={() => handleEdit(address)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleDelete(address)}
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="address-body">
                    <div className="recipient-info">
                      <h4>{address.name}</h4>
                      <p className="phone">{address.phone}</p>
                    </div>

                    <div className="address-details">
                      <p className="full-address">
                        {address.postalCode}, {address.region}, {address.city}
                      </p>
                      <p className="street-address">
                        {address.street}, д. {address.building}
                        {address.apartment && `, кв. ${address.apartment}`}
                      </p>
                      {(address.entrance || address.floor || address.intercom) && (
                        <p className="additional-info">
                          {address.entrance && `Подъезд ${address.entrance}`}
                          {address.floor && `, этаж ${address.floor}`}
                          {address.intercom && `, домофон ${address.intercom}`}
                        </p>
                      )}
                      {address.deliveryInstructions && (
                        <p className="instructions">
                          💬 {address.deliveryInstructions}
                        </p>
                      )}
                    </div>

                    <div className="address-meta">
                      {address.lastUsed && (
                        <p className="last-used">
                          Использован: {formatDate(address.lastUsed)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="address-footer">
                    {!address.isDefault && (
                      <button 
                        className="set-default-btn"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Сделать основным
                      </button>
                    )}
                    {address.coordinates && (
                      <button 
                        className="show-map-btn"
                        onClick={() => handleShowOnMap(address)}
                      >
                        📍 На карте
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="addresses-info">
            <div className="info-card">
              <span className="icon">💡</span>
              <div>
                <h4>Совет</h4>
                <p>Добавьте несколько адресов для разных случаев: дом, работа, дача</p>
              </div>
            </div>
            <div className="info-card">
              <span className="icon">🚚</span>
              <div>
                <h4>Доставка</h4>
                <p>Точный адрес поможет курьеру быстрее доставить ваш заказ</p>
              </div>
            </div>
            <div className="info-card">
              <span className="icon">🔒</span>
              <div>
                <h4>Безопасность</h4>
                <p>Ваши адреса видны только вам и курьеру во время доставки</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setFormErrors({})
        }}>
          <div className="modal-content address-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showEditModal ? 'Редактировать адрес' : 'Добавить новый адрес'}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  setFormErrors({})
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Тип адреса</label>
                <div className="type-selector">
                  <label className={formData.type === 'home' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="type"
                      value="home"
                      checked={formData.type === 'home'}
                      onChange={handleInputChange}
                    />
                    <span>🏠 Дом</span>
                  </label>
                  <label className={formData.type === 'work' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="type"
                      value="work"
                      checked={formData.type === 'work'}
                      onChange={handleInputChange}
                    />
                    <span>🏢 Работа</span>
                  </label>
                  <label className={formData.type === 'other' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="type"
                      value="other"
                      checked={formData.type === 'other'}
                      onChange={handleInputChange}
                    />
                    <span>📍 Другое</span>
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Имя получателя *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Иван Иванов"
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Телефон *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+7 (999) 123-45-67"
                    className={formErrors.phone ? 'error' : ''}
                  />
                  {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Регион *</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Москва"
                    className={formErrors.region ? 'error' : ''}
                  />
                  {formErrors.region && <span className="error-message">{formErrors.region}</span>}
                </div>

                <div className="form-group">
                  <label>Город *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Москва"
                    className={formErrors.city ? 'error' : ''}
                  />
                  {formErrors.city && <span className="error-message">{formErrors.city}</span>}
                </div>

                <div className="form-group">
                  <label>Индекс *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="123456"
                    maxLength={6}
                    className={formErrors.postalCode ? 'error' : ''}
                  />
                  {formErrors.postalCode && <span className="error-message">{formErrors.postalCode}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Улица *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="ул. Примерная"
                    className={formErrors.street ? 'error' : ''}
                  />
                  {formErrors.street && <span className="error-message">{formErrors.street}</span>}
                </div>

                <div className="form-group">
                  <label>Дом *</label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleInputChange}
                    placeholder="123"
                    className={formErrors.building ? 'error' : ''}
                  />
                  {formErrors.building && <span className="error-message">{formErrors.building}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Квартира/Офис</label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    placeholder="45"
                  />
                </div>

                <div className="form-group">
                  <label>Подъезд</label>
                  <input
                    type="text"
                    name="entrance"
                    value={formData.entrance}
                    onChange={handleInputChange}
                    placeholder="2"
                  />
                </div>

                <div className="form-group">
                  <label>Этаж</label>
                  <input
                    type="text"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    placeholder="5"
                  />
                </div>

                <div className="form-group">
                  <label>Домофон</label>
                  <input
                    type="text"
                    name="intercom"
                    value={formData.intercom}
                    onChange={handleInputChange}
                    placeholder="45"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Комментарий для курьера</label>
                <textarea
                  name="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={handleInputChange}
                  placeholder="Например: позвонить за 10 минут до доставки"
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  setFormErrors({})
                }}
              >
                Отмена
              </button>
              <button 
                className="save-btn"
                onClick={handleSaveAddress}
              >
                {showEditModal ? 'Сохранить изменения' : 'Добавить адрес'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Удаление адреса</h2>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p className="warning-message">
                ⚠️ Вы действительно хотите удалить этот адрес?
              </p>
              {selectedAddress && (
                <div className="address-preview">
                  <p><strong>{selectedAddress.name}</strong></p>
                  <p>{selectedAddress.street}, д. {selectedAddress.building}</p>
                  <p>{selectedAddress.city}, {selectedAddress.postalCode}</p>
                </div>
              )}
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
                onClick={handleConfirmDelete}
              >
                Удалить адрес
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && selectedAddress && (
        <div className="modal-overlay" onClick={() => setShowMapModal(false)}>
          <div className="modal-content map-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Адрес на карте</h2>
              <button 
                className="close-btn"
                onClick={() => setShowMapModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="map-container">
                <iframe
                  src={`https://maps.google.com/maps?q=${selectedAddress.coordinates?.lat},${selectedAddress.coordinates?.lng}&z=15&output=embed`}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
              <div className="address-info">
                <h4>{selectedAddress.name}</h4>
                <p>{selectedAddress.street}, д. {selectedAddress.building}</p>
                <p>{selectedAddress.city}, {selectedAddress.postalCode}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}