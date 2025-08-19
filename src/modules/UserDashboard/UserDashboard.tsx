import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './UserDashboard.scss'

interface Order {
  id: number
  number: string
  date: string
  status: 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled'
  items: number
  total: number
  shop: string
}

interface Notification {
  id: number
  type: 'order' | 'promo' | 'system'
  title: string
  message: string
  date: string
  isRead: boolean
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
  const [user, setUser] = useState({
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    phone: '+7 (999) 123-45-67',
    avatar: 'https://via.placeholder.com/100x100'
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteShops: 0,
    activePromocodes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: 1,
          number: '#12345',
          date: '2024-01-15',
          status: 'delivered',
          items: 5,
          total: 1250,
          shop: 'Фермерская лавка'
        },
        {
          id: 2,
          number: '#12346',
          date: '2024-01-14',
          status: 'shipping',
          items: 3,
          total: 890,
          shop: 'Молочная ферма'
        },
        {
          id: 3,
          number: '#12347',
          date: '2024-01-12',
          status: 'preparing',
          items: 7,
          total: 2100,
          shop: 'Пекарня "Золотой колос"'
        }
      ]

      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'order',
          title: 'Заказ доставлен',
          message: 'Заказ #12345 успешно доставлен',
          date: '2024-01-15T14:30:00',
          isRead: false
        },
        {
          id: 2,
          type: 'promo',
          title: 'Новая акция!',
          message: 'Скидка 15% на все молочные продукты до конца недели',
          date: '2024-01-14T10:00:00',
          isRead: false
        },
        {
          id: 3,
          type: 'system',
          title: 'Обновление профиля',
          message: 'Рекомендуем обновить контактную информацию',
          date: '2024-01-13T16:45:00',
          isRead: true
        }
      ]

      setOrders(mockOrders)
      setNotifications(mockNotifications)
      setStats({
        totalOrders: 15,
        totalSpent: 18500,
        favoriteShops: 5,
        activePromocodes: 2
      })
      setLoading(false)
    }, 800)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦'
      case 'promo':
        return '🎁'
      case 'system':
        return '⚙️'
      default:
        return '📢'
    }
  }

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Загрузка профиля...</p>
      </div>
    )
  }

  return (
    <div className="user-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="user-welcome">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div className="user-info">
              <h1>Добро пожаловать, {user.name.split(' ')[0]}!</h1>
              <p>Управляйте заказами и настройками аккаунта</p>
            </div>
          </div>
          <Link to={ROUTES.USER_PROFILE} className="edit-profile-btn">
            ✏️ Редактировать профиль
          </Link>
        </div>

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

          <div className="sidebar">
            <div className="sidebar-section">
              <div className="section-header">
                <h3>Уведомления</h3>
                <span className="notifications-count">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              </div>
              <div className="notifications-list">
                {notifications.slice(0, 5).map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {formatDate(notification.date)}
                      </span>
                    </div>
                    {!notification.isRead && <div className="unread-dot"></div>}
                  </div>
                ))}
                <Link to="/notifications" className="view-all-notifications">
                  Все уведомления
                </Link>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Персональные предложения</h3>
              <div className="promo-card">
                <div className="promo-icon">🎁</div>
                <div className="promo-content">
                  <h4>Скидка 10%</h4>
                  <p>На следующий заказ от 1000₽</p>
                  <span className="promo-code">SAVE10</span>
                </div>
              </div>
              <div className="promo-card">
                <div className="promo-icon">🚚</div>
                <div className="promo-content">
                  <h4>Бесплатная доставка</h4>
                  <p>При заказе от 500₽</p>
                  <span className="promo-code">FREE500</span>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Поддержка</h3>
              <div className="support-links">
                <a href="#" className="support-link">
                  💬 Чат с поддержкой
                </a>
                <a href="#" className="support-link">
                  📞 Обратный звонок
                </a>
                <a href="#" className="support-link">
                  ❓ Частые вопросы
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}