import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './Checkout.scss'

interface DeliveryAddress {
  id: number
  title: string
  address: string
  entrance?: string
  floor?: string
  apartment?: string
  intercom?: string
  comment?: string
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  type: 'card' | 'cash' | 'sbp'
  title: string
  description: string
  icon: string
}

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  shopName: string
  image: string
  unit: string
}

export const Checkout: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>('card')
  const [deliveryTime, setDeliveryTime] = useState('asap')
  const [orderComment, setOrderComment] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newAddress, setNewAddress] = useState({
    address: '',
    entrance: '',
    floor: '',
    apartment: '',
    intercom: '',
    comment: ''
  })
  const [showAddressForm, setShowAddressForm] = useState(false)

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      title: 'Банковской картой онлайн',
      description: 'Оплата картой через безопасный платежный шлюз',
      icon: '💳'
    },
    {
      id: 'cash',
      type: 'cash',
      title: 'Наличными курьеру',
      description: 'Оплата наличными при получении заказа',
      icon: '💵'
    },
    {
      id: 'sbp',
      type: 'sbp',
      title: 'Система быстрых платежей',
      description: 'Оплата через СБП по QR-коду',
      icon: '📱'
    }
  ]

  const deliveryTimeOptions = [
    { value: 'asap', label: 'Как можно скорее', description: '30-45 мин' },
    { value: 'schedule', label: 'Назначить время', description: 'Выберите удобное время' }
  ]

  useEffect(() => {
    // TODO: Replace with actual data from cart and user
    setTimeout(() => {
      const mockItems: OrderItem[] = [
        {
          id: 1,
          name: 'Помидоры розовые',
          price: 120,
          quantity: 2,
          shopName: 'Фермерская лавка',
          image: 'https://via.placeholder.com/60x60',
          unit: 'кг'
        },
        {
          id: 2,
          name: 'Молоко фермерское',
          price: 95,
          quantity: 3,
          shopName: 'Молочная ферма',
          image: 'https://via.placeholder.com/60x60',
          unit: 'л'
        }
      ]

      const mockAddresses: DeliveryAddress[] = [
        {
          id: 1,
          title: 'Дом',
          address: 'г. Москва, ул. Примерная, д. 10',
          entrance: '2',
          floor: '5',
          apartment: '25',
          intercom: '25',
          isDefault: true
        },
        {
          id: 2,
          title: 'Работа',
          address: 'г. Москва, ул. Рабочая, д. 5, стр. 1',
          entrance: '1',
          floor: '3',
          apartment: '301',
          comment: 'Офис компании "Ромашка"',
          isDefault: false
        }
      ]

      setOrderItems(mockItems)
      setAddresses(mockAddresses)
      setSelectedAddress(mockAddresses.find(a => a.isDefault)?.id || mockAddresses[0]?.id || null)
      setLoading(false)
    }, 500)
  }, [])

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const calculateDeliveryFee = () => {
    // Mock delivery calculation
    const subtotal = calculateSubtotal()
    return subtotal >= 500 ? 0 : 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee()
  }

  const addNewAddress = () => {
    const address: DeliveryAddress = {
      id: Date.now(),
      title: newAddress.address.includes('дом') || newAddress.address.includes('Дом') ? 'Дом' : 'Новый адрес',
      address: newAddress.address,
      entrance: newAddress.entrance,
      floor: newAddress.floor,
      apartment: newAddress.apartment,
      intercom: newAddress.intercom,
      comment: newAddress.comment,
      isDefault: false
    }

    setAddresses(prev => [...prev, address])
    setSelectedAddress(address.id)
    setNewAddress({
      address: '',
      entrance: '',
      floor: '',
      apartment: '',
      intercom: '',
      comment: ''
    })
    setShowAddressForm(false)
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)

    // TODO: Replace with actual API call
    setTimeout(() => {
      // Simulate order submission
      alert('Заказ успешно оформлен! Номер заказа: #12345')
      setIsSubmitting(false)
      // Redirect to order confirmation or user orders page
    }, 2000)
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedAddress !== null
      case 2:
        return selectedPayment !== null && phoneNumber.trim() !== ''
      case 3:
        return true
      default:
        return false
    }
  }

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    )
  }

  if (orderItems.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="container">
          <div className="empty-content">
            <span className="icon">🛒</span>
            <h2>Корзина пуста</h2>
            <p>Добавьте товары в корзину, чтобы оформить заказ</p>
            <Link to={ROUTES.VENDORS} className="btn primary">
              Перейти к магазинам
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Оформление заказа</h1>
          <div className="steps-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-title">Доставка</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-title">Оплата</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-title">Подтверждение</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            {/* Step 1: Delivery */}
            {currentStep === 1 && (
              <div className="step-content delivery-step">
                <h2>Адрес доставки</h2>
                
                <div className="addresses-list">
                  {addresses.map(address => (
                    <div 
                      key={address.id}
                      className={`address-card ${selectedAddress === address.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <div className="address-header">
                        <div className="radio-btn">
                          <input 
                            type="radio" 
                            checked={selectedAddress === address.id}
                            onChange={() => setSelectedAddress(address.id)}
                          />
                        </div>
                        <div className="address-info">
                          <h4>{address.title}</h4>
                          <p className="address-text">{address.address}</p>
                          {(address.entrance || address.floor || address.apartment) && (
                            <p className="address-details">
                              {address.entrance && `Подъезд ${address.entrance}`}
                              {address.floor && `, этаж ${address.floor}`}
                              {address.apartment && `, кв. ${address.apartment}`}
                            </p>
                          )}
                          {address.comment && (
                            <p className="address-comment">{address.comment}</p>
                          )}
                          {address.isDefault && (
                            <span className="default-badge">По умолчанию</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    className="add-address-btn"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                  >
                    <span className="icon">+</span>
                    Добавить новый адрес
                  </button>

                  {showAddressForm && (
                    <div className="address-form">
                      <h4>Новый адрес доставки</h4>
                      <div className="form-grid">
                        <div className="form-group full">
                          <label>Адрес *</label>
                          <input
                            type="text"
                            placeholder="Улица, дом, строение"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Подъезд</label>
                          <input
                            type="text"
                            placeholder="1"
                            value={newAddress.entrance}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, entrance: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Этаж</label>
                          <input
                            type="text"
                            placeholder="1"
                            value={newAddress.floor}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, floor: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Квартира</label>
                          <input
                            type="text"
                            placeholder="1"
                            value={newAddress.apartment}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, apartment: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Домофон</label>
                          <input
                            type="text"
                            placeholder="1"
                            value={newAddress.intercom}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, intercom: e.target.value }))}
                          />
                        </div>
                        <div className="form-group full">
                          <label>Комментарий</label>
                          <input
                            type="text"
                            placeholder="Дополнительная информация"
                            value={newAddress.comment}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, comment: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button 
                          onClick={addNewAddress}
                          disabled={!newAddress.address.trim()}
                          className="btn primary"
                        >
                          Добавить адрес
                        </button>
                        <button 
                          onClick={() => setShowAddressForm(false)}
                          className="btn secondary"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="delivery-time">
                  <h3>Время доставки</h3>
                  <div className="time-options">
                    {deliveryTimeOptions.map(option => (
                      <div 
                        key={option.value}
                        className={`time-option ${deliveryTime === option.value ? 'selected' : ''}`}
                        onClick={() => setDeliveryTime(option.value)}
                      >
                        <input 
                          type="radio" 
                          checked={deliveryTime === option.value}
                          onChange={() => setDeliveryTime(option.value)}
                        />
                        <div className="option-info">
                          <h4>{option.label}</h4>
                          <p>{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {deliveryTime === 'schedule' && (
                    <div className="schedule-picker">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Дата</label>
                          <input type="date" />
                        </div>
                        <div className="form-group">
                          <label>Время</label>
                          <select>
                            <option>10:00 - 11:00</option>
                            <option>11:00 - 12:00</option>
                            <option>12:00 - 13:00</option>
                            <option>13:00 - 14:00</option>
                            <option>14:00 - 15:00</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="step-content payment-step">
                <h2>Способ оплаты</h2>
                
                <div className="payment-methods">
                  {paymentMethods.map(method => (
                    <div 
                      key={method.id}
                      className={`payment-method ${selectedPayment === method.id ? 'selected' : ''}`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <div className="radio-btn">
                        <input 
                          type="radio" 
                          checked={selectedPayment === method.id}
                          onChange={() => setSelectedPayment(method.id)}
                        />
                      </div>
                      <div className="method-icon">{method.icon}</div>
                      <div className="method-info">
                        <h4>{method.title}</h4>
                        <p>{method.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="contact-info">
                  <h3>Контактная информация</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Телефон *</label>
                      <input
                        type="tel"
                        placeholder="+7 (999) 123-45-67"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="order-comment">
                  <h3>Комментарий к заказу</h3>
                  <textarea
                    placeholder="Дополнительные пожелания к заказу..."
                    value={orderComment}
                    onChange={(e) => setOrderComment(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="step-content confirmation-step">
                <h2>Подтверждение заказа</h2>
                
                <div className="order-summary">
                  <div className="summary-section">
                    <h3>Адрес доставки</h3>
                    {selectedAddress && (
                      <div className="selected-address">
                        <p className="address-text">
                          {addresses.find(a => a.id === selectedAddress)?.address}
                        </p>
                        <p className="delivery-details">
                          Время доставки: {deliveryTime === 'asap' ? '30-45 мин' : 'По расписанию'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="summary-section">
                    <h3>Способ оплаты</h3>
                    <div className="selected-payment">
                      {paymentMethods.find(m => m.id === selectedPayment)?.title}
                    </div>
                  </div>

                  <div className="summary-section">
                    <h3>Контакты</h3>
                    <p>Телефон: {phoneNumber}</p>
                    {email && <p>Email: {email}</p>}
                  </div>

                  {orderComment && (
                    <div className="summary-section">
                      <h3>Комментарий</h3>
                      <p>{orderComment}</p>
                    </div>
                  )}
                </div>

                <div className="final-actions">
                  <button 
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="submit-order-btn"
                  >
                    {isSubmitting ? 'Оформляем заказ...' : 'Оформить заказ'}
                  </button>

                  <p className="terms-agreement">
                    Нажимая кнопку "Оформить заказ", вы соглашаетесь с{' '}
                    <Link to={ROUTES.TERMS_CONDITIONS}>условиями использования</Link> и{' '}
                    <Link to={ROUTES.PRIVACY_POLICY}>политикой конфиденциальности</Link>
                  </p>
                </div>
              </div>
            )}

            <div className="step-navigation">
              {currentStep > 1 && (
                <button onClick={prevStep} className="btn secondary">
                  ← Назад
                </button>
              )}
              {currentStep < 3 && (
                <button 
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                  className="btn primary"
                >
                  Далее →
                </button>
              )}
            </div>
          </div>

          <div className="checkout-sidebar">
            <div className="order-items">
              <h3>Ваш заказ</h3>
              <div className="items-list">
                {orderItems.map(item => (
                  <div key={item.id} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p className="shop-name">{item.shopName}</p>
                      <div className="item-price">
                        {item.quantity} {item.unit} × {item.price}₽
                      </div>
                    </div>
                    <div className="item-total">
                      {item.price * item.quantity}₽
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-line">
                  <span>Товары</span>
                  <span>{calculateSubtotal()}₽</span>
                </div>
                <div className="total-line">
                  <span>Доставка</span>
                  <span>{calculateDeliveryFee() === 0 ? 'Бесплатно' : `${calculateDeliveryFee()}₽`}</span>
                </div>
                <div className="total-line final">
                  <span>Итого</span>
                  <span>{calculateTotal()}₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}