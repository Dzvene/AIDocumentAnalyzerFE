import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotification } from '@hooks/useNotification'
import { useAppSelector } from '@store/hooks'
import { ROUTES } from '@constants/routes'
import { ordersApi } from '@api/ordersApi'
import './UserDashboard.scss'

interface Order {
  id: number | string
  number: string
  date: string
  status: 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled'
  items: number
  total: number
  shop: string
}

const statusLabels = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтвержден',
  preparing: 'Готовится',
  shipping: 'В доставке',
  delivered: 'Доставлен',
  cancelled: 'Отменен'
}

const statusColors = {
  pending: '#f39c12',
  confirmed: '#3498db',
  preparing: '#9b59b6',
  shipping: '#f39c12',
  delivered: '#27ae60',
  cancelled: '#e74c3c'
}

export const UserDashboard: React.FC = () => {
  const { t } = useTranslation()
  const notification = useNotification()
  const user = useAppSelector(state => state.auth.user)
  
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteShops: 0,
    activePromocodes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        // Load recent orders from API
        const ordersResponse = await ordersApi.getMyOrders({ limit: 3 })
        if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
          const formattedOrders = ordersResponse.data.slice(0, 3).map((order: any) => ({
            id: order.id,
            number: order.orderNumber || `#${order.id}`,
            date: order.date || order.createdAt,
            status: (order.status || 'pending') as Order['status'],
            items: order.items?.length || 0,
            total: order.total || 0,
            shop: order.items?.[0]?.shopName || order.vendorName || 'Магазин'
          }))
          setOrders(formattedOrders)
        }

        // Load statistics from API
        const statsResponse = await ordersApi.getOrderStatistics()
        if (statsResponse) {
          setStats({
            totalOrders: statsResponse.totalOrders || 0,
            totalSpent: statsResponse.totalAmount || 0,
            favoriteShops: statsResponse.uniqueVendors || 0,
            activePromocodes: 0 // Will be loaded from promocodes API when available
          })
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        // Don't show error notification if it's just no data
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t('common.loading', 'Загрузка...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Личный кабинет</h1>
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <h2>{user?.name || 'Пользователь'}</h2>
            <p>{user?.email || ''}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-label">Всего заказов</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalSpent.toLocaleString()}₽</div>
              <div className="stat-label">Потрачено</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏪</div>
            <div className="stat-content">
              <div className="stat-value">{stats.favoriteShops}</div>
              <div className="stat-label">Любимых магазинов</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-content">
              <div className="stat-value">{stats.activePromocodes}</div>
              <div className="stat-label">Активных промокодов</div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="main-content">
            <div className="section">
              <div className="section-header">
                <h2>Последние заказы</h2>
                <Link to={ROUTES.USER_ORDERS} className="view-all-link">
                  Все заказы →
                </Link>
              </div>
              {orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h3>Заказ {order.number}</h3>
                          <p className="order-date">{formatOrderDate(order.date)}</p>
                          <p className="order-shop">🏪 {order.shop}</p>
                        </div>
                        <div className="order-status">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: statusColors[order.status] }}
                          >
                            {statusLabels[order.status]}
                          </span>
                        </div>
                      </div>
                      <div className="order-details">
                        <div className="order-items">
                          {order.items} товаров на сумму {order.total}₽
                        </div>
                        <div className="order-actions">
                          <Link 
                            to={`${ROUTES.USER_ORDER_DETAILS}/${order.id}`}
                            className="order-action-btn primary"
                          >
                            Подробнее
                          </Link>
                          {order.status === 'delivered' && (
                            <button className="order-action-btn secondary">
                              Повторить заказ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-orders">
                  <p>У вас пока нет заказов</p>
                  <Link to={ROUTES.VENDORS} className="start-shopping-btn">
                    Начать покупки
                  </Link>
                </div>
              )}
            </div>

            <div className="section">
              <div className="section-header">
                <h2>Быстрые действия</h2>
              </div>
              <div className="quick-actions">
                <Link to={ROUTES.VENDORS} className="action-card">
                  <div className="action-icon">🛒</div>
                  <div className="action-content">
                    <h3>Сделать заказ</h3>
                    <p>Выберите товары из каталога</p>
                  </div>
                </Link>
                <Link to={ROUTES.USER_ADDRESSES} className="action-card">
                  <div className="action-icon">📍</div>
                  <div className="action-content">
                    <h3>Адреса доставки</h3>
                    <p>Управляйте адресами</p>
                  </div>
                </Link>
                <Link to={ROUTES.USER_WISHLIST} className="action-card">
                  <div className="action-icon">❤️</div>
                  <div className="action-content">
                    <h3>Список желаний</h3>
                    <p>Сохраненные товары</p>
                  </div>
                </Link>
                <Link to={ROUTES.USER_REVIEWS} className="action-card">
                  <div className="action-icon">⭐</div>
                  <div className="action-content">
                    <h3>Мои отзывы</h3>
                    <p>Оцените покупки</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}