import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '@api/adminApi'
import type { Product, ProductFilters } from '@types/interfaces/admin'
import './AdminProducts.scss'

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProducts()
  }, [filters])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await adminApi.getProducts(filters)
      setProducts(response.data)
      setTotalCount(response.total)
    } catch (error) {
      console.error('Error loading products:', error)
      // Fallback to mock data
      setProducts([
        {
          id: '1',
          name: 'Органические яблоки Голден',
          description: 'Свежие органические яблоки сорта Голден Делишес, выращенные без пестицидов',
          price: 150,
          discountPrice: 120,
          images: ['/images/products/apples.jpg'],
          category: 'Фрукты',
          categoryId: 'cat1',
          shopId: 'shop1',
          shopName: 'Фермерская лавка',
          stock: 500,
          sku: 'APPLE-GOLDEN-001',
          status: 'active',
          rating: 4.8,
          reviewsCount: 124,
          tags: ['органические', 'свежие', 'фрукты'],
          specifications: { weight: '1 кг', origin: 'Россия' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Молоко фермерское 3.2%',
          description: 'Натуральное фермерское молоко жирностью 3.2%',
          price: 90,
          images: ['/images/products/milk.jpg'],
          category: 'Молочные продукты',
          categoryId: 'cat2',
          shopId: 'shop1',
          shopName: 'Фермерская лавка',
          stock: 200,
          sku: 'MILK-FARM-001',
          status: 'active',
          rating: 4.9,
          reviewsCount: 89,
          tags: ['натуральное', 'фермерское', 'молоко'],
          specifications: { volume: '1 л', fat: '3.2%' },
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

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
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

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      await adminApi.updateProductStatus(productId, newStatus)
      loadProducts()
    } catch (error) {
      console.error('Error updating product status:', error)
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
      case 'inactive': return 'warning'
      case 'draft': return 'info'
      case 'out_of_stock': return 'danger'
      default: return 'secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен'
      case 'inactive': return 'Неактивен'
      case 'draft': return 'Черновик'
      case 'out_of_stock': return 'Нет в наличии'
      default: return status
    }
  }

  const totalPages = Math.ceil(totalCount / (filters.limit || 20))

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Загрузка товаров...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-products-page">
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="header-main">
              <h1>Управление товарами</h1>
              <p>Просмотр, редактирование и модерация товаров</p>
            </div>
            
            <div className="header-actions">
              <Link to="/admin/products/create" className="btn btn-primary">
                + Добавить товар
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="products-content">
          {/* Filters */}
          <div className="filters-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Поиск по названию, SKU или описанию..."
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
                <option value="active">Активен</option>
                <option value="inactive">Неактивен</option>
                <option value="draft">Черновик</option>
                <option value="out_of_stock">Нет в наличии</option>
              </select>

              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="filter-select"
              >
                <option value="">Все категории</option>
                <option value="Фрукты">Фрукты</option>
                <option value="Молочные продукты">Молочные продукты</option>
                <option value="Хлебобулочные">Хлебобулочные</option>
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
                <option value="price-asc">По цене (возрастание)</option>
                <option value="price-desc">По цене (убывание)</option>
                <option value="rating-desc">По рейтингу</option>
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

          {/* Products Table */}
          <div className="products-table-section">
            <div className="table-header">
              <h2>Товары ({totalCount})</h2>
            </div>

            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>SKU</th>
                    <th>Цена</th>
                    <th>Остаток</th>
                    <th>Магазин</th>
                    <th>Статус</th>
                    <th>Рейтинг</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-cell">
                          <div className="product-image">
                            <img src={product.images[0]} alt={product.name} />
                          </div>
                          <div className="product-info">
                            <h4>{product.name}</h4>
                            <p>{product.category}</p>
                            <div className="product-tags">
                              {product.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code className="sku">{product.sku}</code>
                      </td>
                      <td>
                        <div className="price-cell">
                          {product.discountPrice ? (
                            <>
                              <span className="current-price">{formatCurrency(product.discountPrice)}</span>
                              <span className="original-price">{formatCurrency(product.price)}</span>
                            </>
                          ) : (
                            <span className="current-price">{formatCurrency(product.price)}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`stock ${product.stock <= 10 ? 'low' : ''}`}>
                          {product.stock} шт.
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/shops/${product.shopId}`} className="shop-link">
                          {product.shopName}
                        </Link>
                      </td>
                      <td>
                        <select
                          value={product.status}
                          onChange={(e) => handleStatusChange(product.id, e.target.value)}
                          className={`status-select ${getStatusColor(product.status)}`}
                        >
                          <option value="active">Активен</option>
                          <option value="inactive">Неактивен</option>
                          <option value="draft">Черновик</option>
                          <option value="out_of_stock">Нет в наличии</option>
                        </select>
                      </td>
                      <td>
                        <div className="rating-cell">
                          <span className="rating">⭐ {product.rating}</span>
                          <span className="reviews">({product.reviewsCount})</span>
                        </div>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <Link 
                            to={`/admin/products/${product.id}`}
                            className="btn btn-sm btn-outline"
                          >
                            Просмотр
                          </Link>
                          <Link 
                            to={`/admin/products/${product.id}/edit`}
                            className="btn btn-sm btn-primary"
                          >
                            Редактировать
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  Показано {((currentPage - 1) * (filters.limit || 20)) + 1}-{Math.min(currentPage * (filters.limit || 20), totalCount)} из {totalCount} товаров
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}