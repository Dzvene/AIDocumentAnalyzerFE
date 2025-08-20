import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotification } from '@hooks/useNotification'
import { ordersApi } from '@api/ordersApi'
import { ROUTES } from '@constants/routes'
import './OrderHistory.scss'

interface OrderItem {
  id: string
  productName: string
  productImage: string
  quantity: number
  price: number
  shopName: string
}

interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'delivered' | 'processing' | 'shipped' | 'cancelled' | 'refunded'
  total: number
  items: OrderItem[]
  deliveryAddress: string
  paymentMethod: string
  trackingNumber?: string
  estimatedDelivery?: string
  deliveryTime?: string
}

export const OrderHistory: React.FC = () => {
  const { t } = useTranslation()
  const notification = useNotification()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date')
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)


  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch orders from backend API
      const response = await ordersApi.getMyOrders()
      
      // Transform backend response to match our interface
      if (response.data && Array.isArray(response.data)) {
        setOrders(response.data)
      } else if (response.orders && Array.isArray(response.orders)) {
        // Handle different response structure
        setOrders(response.orders)
      } else {
        setOrders([])
      }
    } catch (apiError: any) {
      console.error('Failed to fetch orders:', apiError)
      
      const errorMessage = apiError?.response?.data?.message || 
                          apiError?.message || 
                          t('errors.failedToLoadOrders', 'Не удалось загрузить заказы')
      
      setError(errorMessage)
      notification.error(t('errors.failedToLoadOrders', 'Не удалось загрузить заказы'), errorMessage)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const createNewOrder = () => {
    // Navigate to shopping
    window.location.href = ROUTES.VENDORS
  }

  const retryLoadOrders = () => {
    loadOrders()
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    loadOrders()
  }, [])

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      delivered: { label: 'Доставлен', className: 'status-delivered' },
      processing: { label: 'В обработке', className: 'status-processing' },
      shipped: { label: 'В пути', className: 'status-shipped' },
      cancelled: { label: 'Отменен', className: 'status-cancelled' },
      refunded: { label: 'Возврат', className: 'status-refunded' }
    }
    
    const config = statusConfig[status]
    return <span className={`status-badge ${config.className}`}>{config.label}</span>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const handleReorder = async (order: Order) => {
    try {
      await ordersApi.reorder(order.id)
      notification.success(t('orders.reorderSuccess', 'Товары добавлены в корзину'))
      // Navigate to cart
      window.location.href = ROUTES.CART
    } catch (error) {
      notification.error(t('orders.reorderFailed', 'Не удалось повторить заказ'))
    }
  }

  const handleTrackOrder = async (orderId: string, trackingNumber: string) => {
    try {
      const response = await ordersApi.getTrackingInfo(orderId)
      if (response.data?.trackingUrl) {
        window.open(response.data.trackingUrl, '_blank')
      } else {
        notification.info(t('orders.trackingNumber', 'Номер отслеживания'), trackingNumber)
      }
    } catch (error) {
      notification.error(t('orders.trackingFailed', 'Не удалось получить информацию об отслеживании'))
    }
  }

  const handleDownloadInvoice = async (orderId: string, orderNumber: string) => {
    try {
      const blob = await ordersApi.downloadInvoice(orderId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      notification.success(t('orders.invoiceDownloaded', 'Счет скачан'))
    } catch (error) {
      notification.error(t('orders.invoiceDownloadFailed', 'Не удалось скачать счет'))
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    notification.confirmAction(
      t('orders.cancelTitle', 'Отменить заказ?'),
      t('orders.cancelMessage', 'Вы уверены, что хотите отменить этот заказ?'),
      async () => {
        setCancellingOrderId(orderId)
        try {
          await ordersApi.cancelOrder(orderId, { reason: 'Customer requested' })
          notification.success(t('orders.cancelSuccess', 'Заказ успешно отменен'))
          // Reload orders to get updated status
          await loadOrders()
        } catch (error: any) {
          const message = error?.response?.data?.message || t('orders.cancelFailed', 'Не удалось отменить заказ')
          notification.error(message)
        } finally {
          setCancellingOrderId(null)
        }
      }
    )
  }

  const handleReportIssue = (orderId: string) => {
    // Navigate to support page with order ID
    window.location.href = `/support?orderId=${orderId}`
  }

  const filteredOrders = orders
    .filter(order => {
      if (filterStatus !== 'all' && order.status !== filterStatus) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          order.orderNumber.toLowerCase().includes(query) ||
          order.items.some(item => 
            item.productName.toLowerCase().includes(query) ||
            item.shopName.toLowerCase().includes(query)
          )
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return b.total - a.total
      }
    })

  const stats = {
    totalOrders: orders.length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
    averageOrder: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0
  }

  // Loading state
  if (loading) {
    return (
      <div className="order-history-page">
        <div className="page-header">
          <div className="container">
            <h1>{t('navigation.orders', 'История заказов')}</h1>
          </div>
        </div>
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('common.loading', 'Загрузка...')}</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && orders.length === 0) {
    return (
      <div className="order-history-page">
        <div className="page-header">
          <div className="container">
            <h1>{t('navigation.orders', 'История заказов')}</h1>
          </div>
        </div>
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>{t('orders.failedToFetch', 'Failed to fetch orders')}</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button 
                className="retry-btn"
                onClick={retryLoadOrders}
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

  return (
    <div className="order-history-page">
      <div className="page-header">
        <div className="container">
          <h1>{t('navigation.orders', 'История заказов')}</h1>
          <nav className="breadcrumb">
            <Link to={ROUTES.HOME}>{t('navigation.home', 'Главная')}</Link>
            <span>/</span>
            <Link to={ROUTES.USER_DASHBOARD}>{t('navigation.dashboard', 'Личный кабинет')}</Link>
            <span>/</span>
            <span>{t('navigation.orders', 'История заказов')}</span>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="order-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalOrders}</span>
              <span className="stat-label">Всего заказов</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-value">{stats.deliveredOrders}</span>
              <span className="stat-label">Доставлено</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalSpent.toLocaleString()} ₽</span>
              <span className="stat-label">Общая сумма</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-value">{Math.round(stats.averageOrder).toLocaleString()} ₽</span>
              <span className="stat-label">Средний чек</span>
            </div>
          </div>
        </div>

        <div className="orders-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по номеру заказа или товару..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filters">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все заказы</option>
              <option value="delivered">Доставленные</option>
              <option value="processing">В обработке</option>
              <option value="shipped">В пути</option>
              <option value="cancelled">Отмененные</option>
              <option value="refunded">Возвраты</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'date' | 'total')}
              className="sort-select"
            >
              <option value="date">По дате</option>
              <option value="total">По сумме</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h3>Заказов не найдено</h3>
            <p>Попробуйте изменить фильтры или поисковый запрос</p>
            <Link to={ROUTES.VENDORS} className="start-shopping-btn">
              Начать покупки
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-main-info">
                    <div className="order-number-date">
                      <h3>{order.orderNumber}</h3>
                      <span className="order-date">
                        {formatDate(order.date)} в {formatTime(order.date)}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="order-actions">
                    <button 
                      className="expand-btn"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      {expandedOrders.has(order.id) ? '▼' : '▶'} Подробнее
                    </button>
                    {order.status === 'delivered' && (
                      <button 
                        className="reorder-btn"
                        onClick={() => handleReorder(order)}
                      >
                        🔄 Повторить
                      </button>
                    )}
                    {order.trackingNumber && ['shipped', 'processing'].includes(order.status) && (
                      <button 
                        className="track-btn"
                        onClick={() => handleTrackOrder(order.id, order.trackingNumber!)}
                      >
                        📍 Отследить
                      </button>
                    )}
                  </div>
                </div>

                <div className="order-summary">
                  <div className="items-preview">
                    {order.items.slice(0, 3).map(item => (
                      <img 
                        key={item.id}
                        src={item.productImage} 
                        alt={item.productName}
                        className="item-thumbnail"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="more-items">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <div className="order-info">
                    <span className="items-count">
                      {order.items.length} {order.items.length === 1 ? 'товар' : 'товара'} на сумму
                    </span>
                    <span className="order-total">{order.total.toLocaleString()} ₽</span>
                  </div>
                </div>

                {expandedOrders.has(order.id) && (
                  <div className="order-details">
                    <div className="details-section">
                      <h4>Товары в заказе</h4>
                      <div className="order-items">
                        {order.items.map(item => (
                          <div key={item.id} className="order-item">
                            <img src={item.productImage} alt={item.productName} />
                            <div className="item-info">
                              <h5>{item.productName}</h5>
                              <p className="shop-name">{item.shopName}</p>
                              <div className="item-price">
                                <span>{item.quantity} × {item.price} ₽</span>
                                <strong>{(item.quantity * item.price).toLocaleString()} ₽</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="details-grid">
                      <div className="detail-block">
                        <h4>Адрес доставки</h4>
                        <p>{order.deliveryAddress}</p>
                      </div>

                      <div className="detail-block">
                        <h4>Способ оплаты</h4>
                        <p>{order.paymentMethod}</p>
                      </div>

                      {order.trackingNumber && (
                        <div className="detail-block">
                          <h4>Номер отслеживания</h4>
                          <p className="tracking-number">{order.trackingNumber}</p>
                        </div>
                      )}

                      {order.estimatedDelivery && (
                        <div className="detail-block">
                          <h4>Ожидаемая доставка</h4>
                          <p>{formatDate(order.estimatedDelivery)}</p>
                        </div>
                      )}

                      {order.deliveryTime && (
                        <div className="detail-block">
                          <h4>Доставлено</h4>
                          <p>
                            {formatDate(order.deliveryTime)} в {formatTime(order.deliveryTime)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="details-actions">
                      <button 
                        className="download-invoice-btn"
                        onClick={() => handleDownloadInvoice(order.id, order.orderNumber)}
                      >
                        📄 Скачать счет
                      </button>
                      {order.status === 'delivered' && (
                        <>
                          <Link 
                            to={`/order/${order.id}/review`}
                            className="leave-review-btn"
                          >
                            ⭐ Оставить отзыв
                          </Link>
                          <button 
                            className="report-issue-btn"
                            onClick={() => handleReportIssue(order.id)}
                          >
                            ⚠️ Сообщить о проблеме
                          </button>
                        </>
                      )}
                      {['processing', 'shipped'].includes(order.status) && (
                        <button 
                          className="cancel-order-btn"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                        >
                          {cancellingOrderId === order.id ? '⏳ Отмена...' : '❌ Отменить заказ'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pagination">
          <button className="page-btn" disabled>←</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">→</button>
        </div>
      </div>
    </div>
  )
}