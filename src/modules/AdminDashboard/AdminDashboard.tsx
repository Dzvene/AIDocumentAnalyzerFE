import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import { adminApi } from '@api/adminApi'
import type { DashboardStats, RecentActivity, TopProduct, TopShop } from '@types/interfaces/admin'
import './AdminDashboard.scss'

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalShops: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeUsers: 0,
    newUsersToday: 0
  })
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [topShops, setTopShops] = useState<TopShop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    loadDashboardData()
    
    // Check admin authentication (would be replaced with real auth check)
    const isAdmin = localStorage.getItem('isAdmin') === 'true'
    if (!isAdmin) {
      navigate(ROUTES.LOGIN)
      return
    }
  }, [navigate])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      // Load data from API
      const [statsData, activityData, topProductsData, topShopsData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRecentActivity(5),
        adminApi.getTopProducts(4),
        adminApi.getTopShops(4)
      ])
      
      setStats(statsData)
      setRecentActivity(activityData)
      setTopProducts(topProductsData)
      setTopShops(topShopsData)
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      
      // Fallback to mock data if API fails
      setStats({
        totalUsers: 15247,
        totalShops: 1834,
        totalProducts: 45632,
        totalOrders: 8956,
        totalRevenue: 2847500,
        pendingOrders: 127,
        activeUsers: 1543,
        newUsersToday: 47
      })

      setRecentActivity([
        {
          id: '1',
          type: 'order',
          message: 'Новый заказ #ORD-2025-001234 от пользователя Иван Петров',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'shop',
          message: 'Магазин "Фермерская лавка" подал заявку на верификацию',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          status: 'info'
        },
        {
          id: '3',
          type: 'user',
          message: 'Пользователь Мария Сидорова подала жалобу на доставку',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          status: 'warning'
        },
        {
          id: '4',
          type: 'product',
          message: 'Товар "Органические яблоки" закончился на складе',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'error'
        },
        {
          id: '5',
          type: 'order',
          message: 'Заказ #ORD-2025-001230 отменен клиентом',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'warning'
        }
      ])

      setTopProducts([
        {
          id: '1',
          name: 'Органические яблоки Голден',
          image: '/images/products/apples.jpg',
          sales: 342,
          revenue: 51300,
          category: 'Фрукты'
        },
        {
          id: '2',
          name: 'Молоко фермерское 3.2%',
          image: '/images/products/milk.jpg',
          sales: 287,
          revenue: 25830,
          category: 'Молочные продукты'
        },
        {
          id: '3',
          name: 'Хлеб ремесленный на закваске',
          image: '/images/products/bread.jpg',
          sales: 198,
          revenue: 23760,
          category: 'Хлебобулочные'
        },
        {
          id: '4',
          name: 'Сыр твердый "Российский"',
          image: '/images/products/cheese.jpg',
          sales: 156,
          revenue: 62400,
          category: 'Молочные продукты'
        }
      ])

      setTopShops([
        {
          id: '1',
          name: 'Фермерская лавка',
          logo: '/images/shops/farm.jpg',
          orders: 1247,
          revenue: 456789,
          rating: 4.9
        },
        {
          id: '2',
          name: 'Пекарня "Традиция"',
          logo: '/images/shops/bakery.jpg',
          orders: 856,
          revenue: 234567,
          rating: 4.7
        },
        {
          id: '3',
          name: 'Мясная лавка "Премиум"',
          logo: '/images/shops/meat.jpg',
          orders: 634,
          revenue: 567890,
          rating: 4.8
        },
        {
          id: '4',
          name: 'Овощи & Фрукты',
          logo: '/images/shops/vegetables.jpg',
          orders: 523,
          revenue: 187432,
          rating: 4.6
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'order': return '📦'
      case 'user': return '👤'
      case 'shop': return '🏪'
      case 'product': return '📱'
      default: return '🔔'
    }
  }

  const getActivityStatusClass = (status: RecentActivity['status']) => {
    return `activity-status-${status}`
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'только что'
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} ч назад`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} дн назад`
  }

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Загрузка панели администратора...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-page">
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="header-main">
              <h1>Панель администратора</h1>
              <p>Обзор системы и управление платформой</p>
            </div>
            
            <div className="header-actions">
              <button className="refresh-btn" onClick={loadDashboardData}>
                🔄 Обновить
              </button>
              <Link to="/admin/settings" className="settings-btn">
                ⚙️ Настройки
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{formatNumber(stats.totalUsers)}</h3>
                <p>Всего пользователей</p>
                <span className="stat-change positive">+{stats.newUsersToday} сегодня</span>
              </div>
            </div>

            <div className="stat-card secondary">
              <div className="stat-icon">🏪</div>
              <div className="stat-content">
                <h3>{formatNumber(stats.totalShops)}</h3>
                <p>Активных магазинов</p>
                <span className="stat-change neutral">+12 этот месяц</span>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">📱</div>
              <div className="stat-content">
                <h3>{formatNumber(stats.totalProducts)}</h3>
                <p>Товаров в каталоге</p>
                <span className="stat-change positive">+234 за неделю</span>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{formatNumber(stats.totalOrders)}</h3>
                <p>Всего заказов</p>
                <span className="stat-change attention">{stats.pendingOrders} в обработке</span>
              </div>
            </div>

            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.totalRevenue)}</h3>
                <p>Общий оборот</p>
                <span className="stat-change positive">+15.3% к прошлому месяцу</span>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <h3>{formatNumber(stats.activeUsers)}</h3>
                <p>Активных сейчас</p>
                <span className="stat-change positive">Пик активности</span>
              </div>
            </div>
          </div>

          <div className="dashboard-main">
            <div className="main-content">
              {/* Recent Activity */}
              <div className="activity-section">
                <div className="section-header">
                  <h2>Последняя активность</h2>
                  <Link to="/admin/activity" className="view-all-btn">
                    Посмотреть все
                  </Link>
                </div>
                
                <div className="activity-list">
                  {recentActivity.map(activity => (
                    <div 
                      key={activity.id} 
                      className={`activity-item ${getActivityStatusClass(activity.status)}`}
                    >
                      <div className="activity-icon">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="activity-content">
                        <p className="activity-message">{activity.message}</p>
                        <span className="activity-time">{getTimeAgo(activity.timestamp)}</span>
                      </div>
                      <div className="activity-status">
                        <span className={`status-dot ${activity.status}`}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-section">
                <div className="section-header">
                  <h2>Быстрые действия</h2>
                </div>
                
                <div className="actions-grid">
                  <Link to="/admin/users" className="action-card">
                    <div className="action-icon">👥</div>
                    <div className="action-content">
                      <h3>Управление пользователями</h3>
                      <p>Просмотр, редактирование и блокировка пользователей</p>
                    </div>
                  </Link>

                  <Link to="/admin/shops" className="action-card">
                    <div className="action-icon">🏪</div>
                    <div className="action-content">
                      <h3>Управление магазинами</h3>
                      <p>Верификация и модерация магазинов</p>
                    </div>
                  </Link>

                  <Link to="/admin/orders" className="action-card">
                    <div className="action-icon">📦</div>
                    <div className="action-content">
                      <h3>Управление заказами</h3>
                      <p>Мониторинг и решение проблем с заказами</p>
                    </div>
                  </Link>

                  <Link to="/admin/products" className="action-card">
                    <div className="action-icon">📱</div>
                    <div className="action-content">
                      <h3>Управление товарами</h3>
                      <p>Модерация и категоризация товаров</p>
                    </div>
                  </Link>

                  <Link to="/admin/categories" className="action-card">
                    <div className="action-icon">📋</div>
                    <div className="action-content">
                      <h3>Управление категориями</h3>
                      <p>Создание и редактирование категорий</p>
                    </div>
                  </Link>

                  <Link to="/admin/settings" className="action-card">
                    <div className="action-icon">⚙️</div>
                    <div className="action-content">
                      <h3>Настройки системы</h3>
                      <p>Конфигурация платформы и параметры</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="sidebar">
              {/* Top Products */}
              <div className="top-products-section">
                <div className="section-header">
                  <h3>Топ товары</h3>
                  <Link to="/admin/products" className="view-all-btn">
                    Все товары
                  </Link>
                </div>
                
                <div className="products-list">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="product-item">
                      <div className="product-rank">#{index + 1}</div>
                      <div className="product-image">
                        <img src={product.image} alt={product.name} />
                      </div>
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <p className="product-category">{product.category}</p>
                        <div className="product-stats">
                          <span className="sales">{product.sales} продаж</span>
                          <span className="revenue">{formatCurrency(product.revenue)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Shops */}
              <div className="top-shops-section">
                <div className="section-header">
                  <h3>Топ магазины</h3>
                  <Link to="/admin/shops" className="view-all-btn">
                    Все магазины
                  </Link>
                </div>
                
                <div className="shops-list">
                  {topShops.map((shop, index) => (
                    <div key={shop.id} className="shop-item">
                      <div className="shop-rank">#{index + 1}</div>
                      <div className="shop-logo">
                        <img src={shop.logo} alt={shop.name} />
                      </div>
                      <div className="shop-info">
                        <h4>{shop.name}</h4>
                        <div className="shop-rating">
                          ⭐ {shop.rating}
                        </div>
                        <div className="shop-stats">
                          <span className="orders">{shop.orders} заказов</span>
                          <span className="revenue">{formatCurrency(shop.revenue)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}