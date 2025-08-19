import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotification } from '@hooks/useNotification'
import { ordersApi } from '@api/ordersApi'
import { ROUTES } from '@constants/routes'
import './OrderDetails.scss'

interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
  originalPrice?: number
  discount?: number
  shopId: string
  shopName: string
  unit: string
}

interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'delivered' | 'processing' | 'shipped' | 'cancelled' | 'refunded'
  items: OrderItem[]
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
  paymentMethod: string
  deliveryAddress: {
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
    instructions?: string
  }
  trackingNumber?: string
  estimatedDelivery?: string
  actualDelivery?: string
  promoCode?: string
  courierInfo?: {
    name: string
    phone: string
    rating: number
  }
  statusHistory: Array<{
    status: string
    date: string
    description: string
  }>
  refundInfo?: {
    amount: number
    reason: string
    date: string
    method: string
  }
}

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const notification = useNotification()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [refundReason, setRefundReason] = useState('')

  const loadOrderDetails = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Try to fetch from API first
      const orderData = await ordersApi.getOrderById(id)
      setOrder(orderData)
    } catch (apiError) {
      console.warn('API not available, using mock data:', apiError)
      
      // Fallback to mock data with realistic delay
      setTimeout(() => {
        const mockOrder: Order = {
        id: id || '1',
        orderNumber: `ORD-2025-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        date: '2025-01-10T14:30:00',
        status: 'delivered',
        subtotal: 1250,
        discount: 125,
        deliveryFee: 150,
        total: 1275,
        paymentMethod: 'Банковская карта ****1234',
        deliveryAddress: {
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
          instructions: 'Позвонить за 10 минут до доставки'
        },
        trackingNumber: 'TRK123456789',
        estimatedDelivery: '2025-01-12T16:00:00',
        actualDelivery: '2025-01-12T15:45:00',
        promoCode: 'SAVE10',
        courierInfo: {
          name: 'Алексей Курьеров',
          phone: '+7 (999) 876-54-32',
          rating: 4.9
        },
        items: [
          {
            id: '1',
            productId: 'prod-1',
            productName: 'Органические яблоки Голден',
            productImage: '/images/products/apples.jpg',
            quantity: 2,
            price: 150,
            originalPrice: 170,
            discount: 12,
            shopId: 'shop-1',
            shopName: 'Фермерская лавка',
            unit: 'кг'
          },
          {
            id: '2',
            productId: 'prod-2',
            productName: 'Молоко фермерское 3.2%',
            productImage: '/images/products/milk.jpg',
            quantity: 3,
            price: 90,
            shopId: 'shop-1',
            shopName: 'Фермерская лавка',
            unit: 'л'
          },
          {
            id: '3',
            productId: 'prod-3',
            productName: 'Хлеб ремесленный на закваске',
            productImage: '/images/products/bread.jpg',
            quantity: 1,
            price: 120,
            originalPrice: 140,
            discount: 14,
            shopId: 'shop-2',
            shopName: 'Пекарня "Традиция"',
            unit: 'шт'
          }
        ],
        statusHistory: [
          {
            status: 'Заказ оформлен',
            date: '2025-01-10T14:30:00',
            description: 'Заказ успешно оформлен и передан в обработку'
          },
          {
            status: 'Подтвержден',
            date: '2025-01-10T15:15:00',
            description: 'Заказ подтвержден магазином и готовится к отправке'
          },
          {
            status: 'В пути',
            date: '2025-01-12T10:30:00',
            description: 'Заказ передан курьеру и находится в пути'
          },
          {
            status: 'Доставлен',
            date: '2025-01-12T15:45:00',
            description: 'Заказ успешно доставлен получателю'
          }
        ]
        }
        
        setOrder(mockOrder)
        notification.info(t('errors.apiNotAvailable', 'API недоступно, используются демо-данные'))
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  const retryLoadOrder = () => {
    loadOrderDetails()
  }

  const createNewOrder = () => {
    navigate(ROUTES.VENDORS)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    loadOrderDetails()
  }, [id])

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      delivered: { label: 'Доставлен', className: 'status-delivered', icon: '✅' },
      processing: { label: 'В обработке', className: 'status-processing', icon: '⏳' },
      shipped: { label: 'В пути', className: 'status-shipped', icon: '🚚' },
      cancelled: { label: 'Отменен', className: 'status-cancelled', icon: '❌' },
      refunded: { label: 'Возврат', className: 'status-refunded', icon: '💰' }
    }
    
    const config = statusConfig[status]
    return (
      <span className={`status-badge ${config.className}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    )
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

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      alert('Укажите причину отмены заказа')
      return
    }
    
    // Simulate API call
    setTimeout(() => {
      if (order) {
        setOrder({
          ...order,
          status: 'cancelled'
        })
      }
      setShowCancelModal(false)
      setCancelReason('')
      alert('Заказ отменен')
    }, 500)
  }

  const handleRefundRequest = () => {
    if (!refundReason.trim()) {
      alert('Укажите причину возврата')
      return
    }
    
    // Simulate API call
    setTimeout(() => {
      setShowRefundModal(false)
      setRefundReason('')
      alert('Заявка на возврат подана')
    }, 500)
  }

  const handleReorder = () => {
    // Simulate adding items to cart
    alert('Товары добавлены в корзину')
    navigate(ROUTES.CART)
  }

  const handleTrackOrder = () => {
    if (order?.trackingNumber) {
      // Simulate tracking
      alert(`Отслеживание заказа: ${order.trackingNumber}`)
    }
  }

  const handleDownloadInvoice = () => {
    // Simulate invoice download
    alert('Скачивание счета...')
  }

  const handleContactSupport = () => {
    navigate(ROUTES.CONTACT_US)
  }

  if (loading) {
    return (
      <div className="order-details-loading">
        <div className="container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Загрузка деталей заказа...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="order-details-page">
        <div className="page-header">
          <div className="container">
            <h1>{t('orders.orderDetails', 'Детали заказа')}</h1>
          </div>
        </div>
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>{t('orders.failedToFetch', 'Failed to fetch order')}</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button 
                className="retry-btn"
                onClick={retryLoadOrder}
              >
                {t('common.retry', 'Повторить')}
              </button>
              <button 
                className="create-order-btn primary"
                onClick={createNewOrder}
              >
                {t('orders.createNew', 'Create New Order')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <div className="container">
          <div className="not-found-content">
            <span className="icon">📦</span>
            <h2>{t('orders.notFound', 'Заказ не найден')}</h2>
            <p>{t('orders.notFoundDescription', 'Заказ с указанным номером не существует или был удален')}</p>
            <Link to={ROUTES.USER_ORDERS} className="back-btn">
              ← {t('orders.backToOrders', 'Вернуться к заказам')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="order-details-page">
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="header-main">
              <h1>Заказ {order.orderNumber}</h1>
              <nav className="breadcrumb">
                <Link to={ROUTES.HOME}>Главная</Link>
                <span>/</span>
                <Link to={ROUTES.USER_DASHBOARD}>Личный кабинет</Link>
                <span>/</span>
                <Link to={ROUTES.USER_ORDERS}>Мои заказы</Link>
                <span>/</span>
                <span>{order.orderNumber}</span>
              </nav>
            </div>
            
            <div className="header-status">
              {getStatusBadge(order.status)}
              <span className="order-date">
                {formatDate(order.date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="order-details-content">
          <div className="main-content">
            {/* Order Status Timeline */}
            <div className="status-timeline">
              <h2>Статус заказа</h2>
              <div className="timeline">
                {order.statusHistory.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h4>{item.status}</h4>
                      <p className="timeline-date">{formatDateTime(item.date)}</p>
                      <p className="timeline-description">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="order-items-section">
              <h2>Товары в заказе ({order.items.length})</h2>
              <div className="items-by-shop">
                {Object.entries(
                  order.items.reduce((groups, item) => {
                    if (!groups[item.shopId]) {
                      groups[item.shopId] = {
                        shopName: item.shopName,
                        items: []
                      }
                    }
                    groups[item.shopId].items.push(item)
                    return groups
                  }, {} as Record<string, { shopName: string, items: OrderItem[] }>)
                ).map(([shopId, group]) => (
                  <div key={shopId} className="shop-group">
                    <div className="shop-header">
                      <h3>
                        <Link to={`/shop/${shopId}`} className="shop-link">
                          🏪 {group.shopName}
                        </Link>
                      </h3>
                    </div>
                    
                    <div className="shop-items">
                      {group.items.map(item => (
                        <div key={item.id} className="order-item">
                          <Link to={`/product/${item.productId}`} className="item-image">
                            <img src={item.productImage} alt={item.productName} />
                            {item.discount && (
                              <span className="discount-badge">-{item.discount}%</span>
                            )}
                          </Link>
                          
                          <div className="item-details">
                            <Link 
                              to={`/product/${item.productId}`}
                              className="item-name"
                            >
                              {item.productName}
                            </Link>
                            <div className="item-price-info">
                              <span className="current-price">
                                {item.price} ₽/{item.unit}
                              </span>
                              {item.originalPrice && (
                                <span className="original-price">
                                  {item.originalPrice} ₽/{item.unit}
                                </span>
                              )}
                            </div>
                            <div className="item-quantity">
                              Количество: {item.quantity} {item.unit}
                            </div>
                          </div>
                          
                          <div className="item-total">
                            <span className="total-price">
                              {(item.price * item.quantity).toLocaleString()} ₽
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="delivery-section">
              <h2>Информация о доставке</h2>
              <div className="delivery-grid">
                <div className="delivery-address">
                  <h3>Адрес доставки</h3>
                  <div className="address-card">
                    <p className="recipient">{order.deliveryAddress.name}</p>
                    <p className="phone">{order.deliveryAddress.phone}</p>
                    <p className="address">
                      {order.deliveryAddress.postalCode}, {order.deliveryAddress.region}, {order.deliveryAddress.city}
                    </p>
                    <p className="street">
                      {order.deliveryAddress.street}, д. {order.deliveryAddress.building}
                      {order.deliveryAddress.apartment && `, кв. ${order.deliveryAddress.apartment}`}
                    </p>
                    {(order.deliveryAddress.entrance || order.deliveryAddress.floor || order.deliveryAddress.intercom) && (
                      <p className="additional">
                        {order.deliveryAddress.entrance && `Подъезд ${order.deliveryAddress.entrance}`}
                        {order.deliveryAddress.floor && `, этаж ${order.deliveryAddress.floor}`}
                        {order.deliveryAddress.intercom && `, домофон ${order.deliveryAddress.intercom}`}
                      </p>
                    )}
                    {order.deliveryAddress.instructions && (
                      <p className="instructions">
                        💬 {order.deliveryAddress.instructions}
                      </p>
                    )}
                  </div>
                </div>
                
                {order.courierInfo && (
                  <div className="courier-info">
                    <h3>Курьер</h3>
                    <div className="courier-card">
                      <div className="courier-avatar">👨‍🚚</div>
                      <div className="courier-details">
                        <p className="courier-name">{order.courierInfo.name}</p>
                        <p className="courier-phone">{order.courierInfo.phone}</p>
                        <div className="courier-rating">
                          <span className="rating">⭐ {order.courierInfo.rating}</span>
                          <span className="rating-label">рейтинг</span>
                        </div>
                      </div>
                      <button className="call-courier-btn">📞 Позвонить</button>
                    </div>
                  </div>
                )}
                
                {order.trackingNumber && (
                  <div className="tracking-info">
                    <h3>Отслеживание</h3>
                    <div className="tracking-card">
                      <p className="tracking-number">
                        <strong>Номер:</strong> {order.trackingNumber}
                      </p>
                      {order.estimatedDelivery && (
                        <p className="estimated-delivery">
                          <strong>Ожидаемая доставка:</strong><br />
                          {formatDateTime(order.estimatedDelivery)}
                        </p>
                      )}
                      {order.actualDelivery && (
                        <p className="actual-delivery">
                          <strong>Доставлено:</strong><br />
                          {formatDateTime(order.actualDelivery)}
                        </p>
                      )}
                      <button 
                        className="track-btn"
                        onClick={handleTrackOrder}
                      >
                        📍 Отследить заказ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sidebar">
            {/* Order Summary */}
            <div className="order-summary">
              <h3>Сводка по заказу</h3>
              <div className="summary-lines">
                <div className="summary-line">
                  <span>Товары ({order.items.length})</span>
                  <span>{order.subtotal.toLocaleString()} ₽</span>
                </div>
                {order.discount > 0 && (
                  <div className="summary-line discount">
                    <span>Скидка</span>
                    <span>-{order.discount.toLocaleString()} ₽</span>
                  </div>
                )}
                {order.promoCode && (
                  <div className="summary-line promo">
                    <span>Промокод {order.promoCode}</span>
                    <span>Применен ✓</span>
                  </div>
                )}
                <div className="summary-line">
                  <span>Доставка</span>
                  <span>{order.deliveryFee > 0 ? `${order.deliveryFee} ₽` : 'Бесплатно'}</span>
                </div>
                <div className="summary-line total">
                  <span><strong>Итого</strong></span>
                  <span><strong>{order.total.toLocaleString()} ₽</strong></span>
                </div>
              </div>
              
              <div className="payment-method">
                <p><strong>Способ оплаты:</strong></p>
                <p>{order.paymentMethod}</p>
              </div>
            </div>

            {/* Order Actions */}
            <div className="order-actions">
              <h3>Действия</h3>
              <div className="actions-list">
                {order.status === 'delivered' && (
                  <>
                    <button 
                      className="action-btn reorder-btn"
                      onClick={handleReorder}
                    >
                      🔄 Повторить заказ
                    </button>
                    <button 
                      className="action-btn refund-btn"
                      onClick={() => setShowRefundModal(true)}
                    >
                      💰 Оформить возврат
                    </button>
                    <Link 
                      to="/order/review"
                      className="action-btn review-btn"
                    >
                      ⭐ Оставить отзыв
                    </Link>
                  </>
                )}
                
                {['processing', 'shipped'].includes(order.status) && (
                  <button 
                    className="action-btn cancel-btn"
                    onClick={() => setShowCancelModal(true)}
                  >
                    ❌ Отменить заказ
                  </button>
                )}
                
                <button 
                  className="action-btn invoice-btn"
                  onClick={handleDownloadInvoice}
                >
                  📄 Скачать счет
                </button>
                
                <button 
                  className="action-btn support-btn"
                  onClick={handleContactSupport}
                >
                  📞 Связаться с поддержкой
                </button>
              </div>
            </div>

            {/* Refund Information */}
            {order.refundInfo && (
              <div className="refund-info">
                <h3>Информация о возврате</h3>
                <div className="refund-details">
                  <p><strong>Сумма возврата:</strong> {order.refundInfo.amount} ₽</p>
                  <p><strong>Причина:</strong> {order.refundInfo.reason}</p>
                  <p><strong>Дата:</strong> {formatDate(order.refundInfo.date)}</p>
                  <p><strong>Способ:</strong> {order.refundInfo.method}</p>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="help-section">
              <h3>Нужна помощь?</h3>
              <div className="help-links">
                <Link to="/faq" className="help-link">
                  ❓ Часто задаваемые вопросы
                </Link>
                <Link to="/delivery-info" className="help-link">
                  🚚 Информация о доставке
                </Link>
                <Link to="/return-policy" className="help-link">
                  ↩️ Условия возврата
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Отмена заказа</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCancelModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p className="warning-message">
                ⚠️ Вы действительно хотите отменить этот заказ?
              </p>
              <div className="form-group">
                <label>Причина отмены *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Укажите причину отмены заказа"
                  rows={4}
                />
              </div>
              <p className="note">
                После отмены заказа средства будут возвращены в течение 3-5 рабочих дней.
              </p>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowCancelModal(false)}
              >
                Не отменять
              </button>
              <button 
                className="confirm-btn"
                onClick={handleCancelOrder}
              >
                Отменить заказ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Request Modal */}
      {showRefundModal && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Оформление возврата</h2>
              <button 
                className="close-btn"
                onClick={() => setShowRefundModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>Укажите причину возврата товара:</p>
              <div className="form-group">
                <label>Причина возврата *</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Опишите причину возврата товара"
                  rows={4}
                />
              </div>
              <p className="note">
                Заявка будет рассмотрена в течение 24 часов. После одобрения 
                возврат будет произведен в течение 7-10 рабочих дней.
              </p>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowRefundModal(false)}
              >
                Отмена
              </button>
              <button 
                className="confirm-btn"
                onClick={handleRefundRequest}
              >
                Подать заявку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}