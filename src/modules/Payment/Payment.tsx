import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './Payment.scss'

interface PaymentMethod {
  id: string
  type: 'card' | 'cash' | 'online'
  name: string
  icon: string
  description: string
  fee?: number
  enabled: boolean
}

interface CardData {
  number: string
  expiry: string
  cvv: string
  holder: string
  saveCard: boolean
}

interface OrderSummary {
  subtotal: number
  discount: number
  deliveryFee: number
  paymentFee?: number
  total: number
  promoCode?: string
  items: number
}

export const Payment: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    expiry: '',
    cvv: '',
    holder: '',
    saveCard: false
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Mock order summary (would come from checkout/cart state)
  const [orderSummary] = useState<OrderSummary>({
    subtotal: 1250,
    discount: 125,
    deliveryFee: 150,
    total: 1275,
    promoCode: 'SAVE10',
    items: 5
  })

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Банковская карта',
      icon: '💳',
      description: 'Visa, MasterCard, МИР',
      enabled: true
    },
    {
      id: 'yandex',
      type: 'online',
      name: 'Яндекс.Деньги',
      icon: '💰',
      description: 'Оплата через Яндекс кошелек',
      enabled: true
    },
    {
      id: 'sber',
      type: 'online',
      name: 'СберПэй',
      icon: '🟢',
      description: 'Быстрая оплата через Сбербанк',
      enabled: true
    },
    {
      id: 'qiwi',
      type: 'online',
      name: 'QIWI Кошелек',
      icon: '🥝',
      description: 'Оплата через QIWI',
      fee: 15,
      enabled: true
    },
    {
      id: 'cash',
      type: 'cash',
      name: 'Наличные при получении',
      icon: '💵',
      description: 'Оплата курьеру наличными',
      enabled: true
    }
  ]

  useEffect(() => {
    window.scrollTo(0, 0)
    
    // Check if we came from checkout
    if (!location.state?.fromCheckout) {
      // Redirect to cart if accessed directly
      navigate(ROUTES.CART)
    }
  }, [location.state, navigate])

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    setShowCardForm(methodId === 'card')
    setErrors({})
    
    // Calculate payment fee if applicable
    const method = paymentMethods.find(m => m.id === methodId)
    if (method?.fee) {
      // Update order summary with fee (would be handled by state management)
    }
  }

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    let formattedValue = value

    // Format card number
    if (name === 'number') {
      formattedValue = value.replace(/\D/g, '').slice(0, 16)
      formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, '$1 ')
    }
    
    // Format expiry date
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2)
      }
    }
    
    // Format CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3)
    }

    setCardData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }))

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateCardData = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!cardData.number.replace(/\s/g, '')) {
      newErrors.number = 'Введите номер карты'
    } else if (cardData.number.replace(/\s/g, '').length < 16) {
      newErrors.number = 'Номер карты должен содержать 16 цифр'
    }

    if (!cardData.expiry) {
      newErrors.expiry = 'Введите срок действия'
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      newErrors.expiry = 'Неверный формат (ММ/ГГ)'
    }

    if (!cardData.cvv) {
      newErrors.cvv = 'Введите CVV код'
    } else if (cardData.cvv.length < 3) {
      newErrors.cvv = 'CVV должен содержать 3 цифры'
    }

    if (!cardData.holder.trim()) {
      newErrors.holder = 'Введите имя держателя карты'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Выберите способ оплаты')
      return
    }

    if (selectedMethod === 'card' && !validateCardData()) {
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simulate random payment failure (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Ошибка обработки платежа')
      }

      // Success - redirect to success page
      navigate('/payment/success', {
        state: {
          orderNumber: `ORD-${Date.now()}`,
          amount: orderSummary.total,
          method: paymentMethods.find(m => m.id === selectedMethod)?.name
        }
      })
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Произошла ошибка при оплате')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="payment-page">
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <h1>Оплата заказа</h1>
            <nav className="breadcrumb">
              <Link to={ROUTES.HOME}>Главная</Link>
              <span>/</span>
              <Link to={ROUTES.CART}>Корзина</Link>
              <span>/</span>
              <Link to={ROUTES.CHECKOUT}>Оформление</Link>
              <span>/</span>
              <span>Оплата</span>
            </nav>
          </div>
          
          <div className="security-notice">
            <span className="security-icon">🔒</span>
            <span>Все платежи защищены SSL-шифрованием</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="payment-content">
          <div className="payment-form-section">
            <div className="payment-methods">
              <h2>Выберите способ оплаты</h2>
              
              <div className="methods-list">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className={`payment-method ${selectedMethod === method.id ? 'selected' : ''} ${!method.enabled ? 'disabled' : ''}`}
                    onClick={() => method.enabled && handleMethodSelect(method.id)}
                  >
                    <div className="method-content">
                      <div className="method-info">
                        <span className="method-icon">{method.icon}</span>
                        <div className="method-details">
                          <h3>{method.name}</h3>
                          <p>{method.description}</p>
                          {method.fee && (
                            <span className="method-fee">Комиссия: {method.fee} ₽</span>
                          )}
                        </div>
                      </div>
                      <div className="method-radio">
                        <div className={`radio-button ${selectedMethod === method.id ? 'checked' : ''}`}>
                          {selectedMethod === method.id && <div className="radio-dot"></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showCardForm && (
              <div className="card-form">
                <h3>Данные банковской карты</h3>
                
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="cardNumber">Номер карты *</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="number"
                      value={cardData.number}
                      onChange={handleCardInputChange}
                      placeholder="1234 5678 9012 3456"
                      className={errors.number ? 'error' : ''}
                      maxLength={19}
                    />
                    {errors.number && <span className="field-error">{errors.number}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cardExpiry">Срок действия *</label>
                    <input
                      type="text"
                      id="cardExpiry"
                      name="expiry"
                      value={cardData.expiry}
                      onChange={handleCardInputChange}
                      placeholder="ММ/ГГ"
                      className={errors.expiry ? 'error' : ''}
                      maxLength={5}
                    />
                    {errors.expiry && <span className="field-error">{errors.expiry}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cardCvv">CVV *</label>
                    <input
                      type="text"
                      id="cardCvv"
                      name="cvv"
                      value={cardData.cvv}
                      onChange={handleCardInputChange}
                      placeholder="123"
                      className={errors.cvv ? 'error' : ''}
                      maxLength={3}
                    />
                    {errors.cvv && <span className="field-error">{errors.cvv}</span>}
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="cardHolder">Имя держателя карты *</label>
                    <input
                      type="text"
                      id="cardHolder"
                      name="holder"
                      value={cardData.holder}
                      onChange={handleCardInputChange}
                      placeholder="IVAN PETROV"
                      className={errors.holder ? 'error' : ''}
                      style={{ textTransform: 'uppercase' }}
                    />
                    {errors.holder && <span className="field-error">{errors.holder}</span>}
                  </div>
                  
                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="saveCard"
                        checked={cardData.saveCard}
                        onChange={handleCardInputChange}
                      />
                      <span className="checkbox-custom"></span>
                      Сохранить карту для будущих покупок
                    </label>
                  </div>
                </div>

                <div className="security-info">
                  <div className="security-badges">
                    <span className="security-badge">🔐 SSL</span>
                    <span className="security-badge">✅ PCI DSS</span>
                    <span className="security-badge">🛡️ 3D Secure</span>
                  </div>
                  <p>Мы не храним данные вашей карты. Все операции проводятся через защищенное соединение.</p>
                </div>
              </div>
            )}

            <div className="payment-actions">
              <Link to={ROUTES.CHECKOUT} className="back-btn">
                ← Вернуться к оформлению
              </Link>
              
              <button
                className="pay-btn"
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Обработка платежа...
                  </>
                ) : (
                  <>💳 Оплатить {orderSummary.total.toLocaleString()} ₽</>
                )}
              </button>
            </div>
          </div>

          <div className="order-summary-sidebar">
            <div className="order-summary">
              <h3>Сводка заказа</h3>
              
              <div className="summary-lines">
                <div className="summary-line">
                  <span>Товары ({orderSummary.items})</span>
                  <span>{orderSummary.subtotal.toLocaleString()} ₽</span>
                </div>
                
                {orderSummary.discount > 0 && (
                  <div className="summary-line discount">
                    <span>Скидка</span>
                    <span>-{orderSummary.discount.toLocaleString()} ₽</span>
                  </div>
                )}
                
                {orderSummary.promoCode && (
                  <div className="summary-line promo">
                    <span>Промокод {orderSummary.promoCode}</span>
                    <span>Применен ✓</span>
                  </div>
                )}
                
                <div className="summary-line">
                  <span>Доставка</span>
                  <span>{orderSummary.deliveryFee > 0 ? `${orderSummary.deliveryFee} ₽` : 'Бесплатно'}</span>
                </div>
                
                {orderSummary.paymentFee && (
                  <div className="summary-line">
                    <span>Комиссия за оплату</span>
                    <span>{orderSummary.paymentFee} ₽</span>
                  </div>
                )}
                
                <div className="summary-line total">
                  <span><strong>К оплате</strong></span>
                  <span><strong>{orderSummary.total.toLocaleString()} ₽</strong></span>
                </div>
              </div>
            </div>

            <div className="payment-guarantee">
              <h4>Гарантия безопасности</h4>
              <div className="guarantee-items">
                <div className="guarantee-item">
                  <span className="guarantee-icon">🔒</span>
                  <div>
                    <h5>Защищенные платежи</h5>
                    <p>SSL-шифрование всех данных</p>
                  </div>
                </div>
                
                <div className="guarantee-item">
                  <span className="guarantee-icon">↩️</span>
                  <div>
                    <h5>Легкий возврат</h5>
                    <p>Возврат средств в течение 14 дней</p>
                  </div>
                </div>
                
                <div className="guarantee-item">
                  <span className="guarantee-icon">🛡️</span>
                  <div>
                    <h5>Защита покупателя</h5>
                    <p>Гарантия возврата при проблемах</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="help-section">
              <h4>Нужна помощь?</h4>
              <div className="help-links">
                <Link to={ROUTES.CONTACT_US} className="help-link">
                  📞 Связаться с поддержкой
                </Link>
                <Link to="/faq" className="help-link">
                  ❓ Часто задаваемые вопросы
                </Link>
                <Link to="/payment-info" className="help-link">
                  💳 Информация об оплате
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}