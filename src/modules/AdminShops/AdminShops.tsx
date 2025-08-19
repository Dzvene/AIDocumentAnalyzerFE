import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '@api/adminApi'
import type { Shop, ShopFilters } from '@types/interfaces/admin'
import './AdminShops.scss'

export const AdminShops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ShopFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadShops()
  }, [filters])

  const loadShops = async () => {
    setLoading(true)
    try {
      const response = await adminApi.getShops(filters)
      setShops(response.data)
      setTotalCount(response.total)
    } catch (error) {
      console.error('Error loading shops:', error)
      // Fallback to mock data
      setShops([
        {
          id: '1',
          name: 'Фермерская лавка',
          description: 'Натуральные фермерские продукты прямо от производителя',
          logo: '/images/shops/farm.jpg',
          banner: '/images/shops/farm-banner.jpg',
          ownerId: 'owner1',
          ownerName: 'Иван Петров',
          ownerEmail: 'ivan@farm.ru',
          phone: '+7 (123) 456-78-90',
          email: 'info@farm.ru',
          address: {
            street: 'ул. Фермерская, 15',
            city: 'Москва',
            state: 'Москва',
            zipCode: '123456',
            country: 'Россия'
          },
          status: 'active',
          isVerified: true,
          rating: 4.9,
          reviewsCount: 256,
          productsCount: 89,
          ordersCount: 1247,
          totalRevenue: 456789,
          settings: {
            allowReviews: true,
            showContactInfo: true,
            autoAcceptOrders: false,
            workingHours: {
              monday: { open: '09:00', close: '18:00', isOpen: true },
              tuesday: { open: '09:00', close: '18:00', isOpen: true },
              wednesday: { open: '09:00', close: '18:00', isOpen: true },
              thursday: { open: '09:00', close: '18:00', isOpen: true },
              friday: { open: '09:00', close: '18:00', isOpen: true },
              saturday: { open: '10:00', close: '16:00', isOpen: true },
              sunday: { open: '10:00', close: '16:00', isOpen: false }
            }
          },
          documents: {
            businessLicense: '/documents/license1.pdf',
            taxCertificate: '/documents/tax1.pdf'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Пекарня "Традиция"',
          description: 'Свежая выпечка и хлеб каждый день',
          logo: '/images/shops/bakery.jpg',
          banner: '/images/shops/bakery-banner.jpg',
          ownerId: 'owner2',
          ownerName: 'Мария Сидорова',
          ownerEmail: 'maria@bakery.ru',
          phone: '+7 (234) 567-89-01',
          email: 'info@bakery.ru',
          address: {
            street: 'ул. Хлебная, 7',
            city: 'Санкт-Петербург',
            state: 'Ленинградская область',
            zipCode: '789012',
            country: 'Россия'
          },
          status: 'pending',
          isVerified: false,
          rating: 4.7,
          reviewsCount: 143,
          productsCount: 45,
          ordersCount: 856,
          totalRevenue: 234567,
          settings: {
            allowReviews: true,
            showContactInfo: true,
            autoAcceptOrders: true,
            workingHours: {
              monday: { open: '07:00', close: '20:00', isOpen: true },
              tuesday: { open: '07:00', close: '20:00', isOpen: true },
              wednesday: { open: '07:00', close: '20:00', isOpen: true },
              thursday: { open: '07:00', close: '20:00', isOpen: true },
              friday: { open: '07:00', close: '20:00', isOpen: true },
              saturday: { open: '08:00', close: '18:00', isOpen: true },
              sunday: { open: '08:00', close: '18:00', isOpen: true }
            }
          },
          documents: {
            businessLicense: '/documents/license2.pdf'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      setTotalCount(2)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }))
    setCurrentPage(1)
  }

  const handleFilterChange = (key: keyof ShopFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setFilters(prev => ({
      ...prev,
      page
    }))
  }

  const handleStatusChange = async (shopId: string, newStatus: string) => {
    try {
      await adminApi.updateShopStatus(shopId, newStatus)
      loadShops()
    } catch (error) {
      console.error('Error updating shop status:', error)
    }
  }

  const handleVerifyShop = async (shopId: string) => {
    try {
      await adminApi.verifyShop(shopId)
      loadShops()
    } catch (error) {
      console.error('Error verifying shop:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'pending': return 'warning'
      case 'approved': return 'info'
      case 'rejected': return 'danger'
      case 'suspended': return 'danger'
      default: return 'secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен'
      case 'pending': return 'На модерации'
      case 'approved': return 'Одобрен'
      case 'rejected': return 'Отклонен'
      case 'suspended': return 'Заблокирован'
      default: return status
    }
  }

  const totalPages = Math.ceil(totalCount / (filters.limit || 20))

  if (loading) {
    return (
      <div className="admin-shops-loading">
        <div className="container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Загрузка магазинов...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shops-page">
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="header-main">
              <h1>Управление магазинами</h1>
              <p>Модерация, верификация и управление магазинами</p>
            </div>
            
            <div className="header-actions">
              <Link to="/admin/shops/analytics" className="btn btn-outline">
                📊 Аналитика
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="shops-content">
          {/* Filters */}
          <div className="filters-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Поиск по названию, владельцу или email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  🔍 Поиск
                </button>
              </div>
            </form>

            <div className="filter-controls">
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="filter-select"
              >
                <option value="">Все статусы</option>
                <option value="pending">На модерации</option>
                <option value="active">Активен</option>
                <option value="approved">Одобрен</option>
                <option value="rejected">Отклонен</option>
                <option value="suspended">Заблокирован</option>
              </select>

              <select
                value={filters.isVerified !== undefined ? filters.isVerified.toString() : ''}
                onChange={(e) => {
                  const value = e.target.value
                  handleFilterChange('isVerified', value === '' ? undefined : value === 'true')
                }}
                className="filter-select"
              >
                <option value="">Все магазины</option>
                <option value="true">Верифицированные</option>
                <option value="false">Неверифицированные</option>
              </select>

              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  handleFilterChange('sortBy', sortBy)
                  handleFilterChange('sortOrder', sortOrder)
                }}
                className="filter-select"
              >
                <option value="createdAt-desc">Сначала новые</option>
                <option value="createdAt-asc">Сначала старые</option>
                <option value="name-asc">По названию (А-Я)</option>
                <option value="name-desc">По названию (Я-А)</option>
                <option value="rating-desc">По рейтингу</option>
                <option value="revenue-desc">По доходу</option>
              </select>

              <button
                onClick={() => {
                  setFilters({
                    page: 1,
                    limit: 20,
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                  })
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
                className="clear-filters-btn"
              >
                Очистить фильтры
              </button>
            </div>
          </div>

          {/* Shops Grid */}
          <div className="shops-grid-section">
            <div className="section-header">
              <h2>Магазины ({totalCount})</h2>
            </div>

            <div className="shops-grid">
              {shops.map(shop => (
                <div key={shop.id} className="shop-card">
                  <div className="shop-header">
                    <div className="shop-banner">
                      <img src={shop.banner} alt={`${shop.name} banner`} />
                      <div className="shop-status-badges">
                        <span className={`status-badge ${getStatusColor(shop.status)}`}>
                          {getStatusText(shop.status)}
                        </span>
                        {shop.isVerified && (
                          <span className="verification-badge">
                            ✓ Верифицирован
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="shop-logo">
                      <img src={shop.logo} alt={shop.name} />
                    </div>
                  </div>

                  <div className="shop-content">
                    <div className="shop-info">
                      <h3>{shop.name}</h3>
                      <p className="shop-description">{shop.description}</p>
                      
                      <div className="shop-meta">
                        <div className="shop-rating">
                          ⭐ {shop.rating} ({shop.reviewsCount} отзывов)
                        </div>
                        <div className="shop-location">
                          📍 {shop.address.city}
                        </div>
                      </div>

                      <div className="shop-stats">
                        <div className="stat">
                          <span className="stat-value">{shop.productsCount}</span>
                          <span className="stat-label">товаров</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{shop.ordersCount}</span>
                          <span className="stat-label">заказов</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{formatCurrency(shop.totalRevenue)}</span>
                          <span className="stat-label">оборот</span>
                        </div>
                      </div>
                    </div>

                    <div className="shop-owner">
                      <h4>Владелец</h4>
                      <p>{shop.ownerName}</p>
                      <p className="owner-email">{shop.ownerEmail}</p>
                      <p className="owner-phone">{shop.phone}</p>
                    </div>

                    <div className="shop-documents">
                      <h4>Документы</h4>
                      <div className="documents-list">
                        {shop.documents.businessLicense && (
                          <a href={shop.documents.businessLicense} target="_blank" rel="noopener noreferrer" className="document-link">
                            📄 Лицензия
                          </a>
                        )}
                        {shop.documents.taxCertificate && (
                          <a href={shop.documents.taxCertificate} target="_blank" rel="noopener noreferrer" className="document-link">
                            📄 Налоговая
                          </a>
                        )}
                        {shop.documents.bankDetails && (
                          <a href={shop.documents.bankDetails} target="_blank" rel="noopener noreferrer" className="document-link">
                            📄 Банковские реквизиты
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="shop-actions">
                      <div className="status-controls">
                        <select
                          value={shop.status}
                          onChange={(e) => handleStatusChange(shop.id, e.target.value)}
                          className={`status-select ${getStatusColor(shop.status)}`}
                        >
                          <option value="pending">На модерации</option>
                          <option value="approved">Одобрить</option>
                          <option value="active">Активировать</option>
                          <option value="rejected">Отклонить</option>
                          <option value="suspended">Заблокировать</option>
                        </select>

                        {!shop.isVerified && shop.status === 'active' && (
                          <button
                            onClick={() => handleVerifyShop(shop.id)}
                            className="verify-btn"
                          >
                            ✓ Верифицировать
                          </button>
                        )}
                      </div>

                      <div className="action-buttons">
                        <Link 
                          to={`/admin/shops/${shop.id}`}
                          className="btn btn-sm btn-outline"
                        >
                          Подробнее
                        </Link>
                        <Link 
                          to={`/admin/shops/${shop.id}/products`}
                          className="btn btn-sm btn-primary"
                        >
                          Товары
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-section">
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="pagination-btn"
                  >
                    ← Предыдущая
                  </button>
                  
                  <div className="pagination-pages">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2)
                      if (page > totalPages) return null
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="pagination-btn"
                  >
                    Следующая →
                  </button>
                </div>
                
                <div className="pagination-info">
                  Показано {((currentPage - 1) * (filters.limit || 20)) + 1}-{Math.min(currentPage * (filters.limit || 20), totalCount)} из {totalCount} магазинов
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}