import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ROUTES } from '@constants/routes'
import { productsApi, shopsApi } from '@api'
import { Product } from '@types/interfaces/product'
import { Shop } from '@types/interfaces/shop'
import { AppDispatch } from '@store/store'
// import { addToCart } from '@store/slices/cartSlice' // TODO: Update to use multiCartSlice
import { useNotification } from '@hooks/useNotification'
import './Search.scss'

export const Search: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const notification = useNotification()
  
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState<'products' | 'shops'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    inStockOnly: false,
    sortBy: 'relevance'
  })

  useEffect(() => {
    // Load categories on mount
    const loadCategories = async () => {
      try {
        const categoriesData = await productsApi.getCategories()
        setCategories([
          { value: 'all', label: 'Все категории' },
          ...categoriesData.map(cat => ({ value: cat.id.toString(), label: cat.name }))
        ])
      } catch (error) {
        // Fallback categories
        setCategories([
          { value: 'all', label: 'Все категории' },
          { value: '1', label: 'Овощи' },
          { value: '2', label: 'Фрукты' },
          { value: '3', label: 'Молочные' },
          { value: '4', label: 'Мясо' },
          { value: '5', label: 'Выпечка' },
          { value: '6', label: 'Напитки' }
        ])
      }
    }
    loadCategories()
  }, [])

  const priceRanges = [
    { value: 'all', label: 'Любая цена' },
    { value: '0-100', label: 'До 100₽' },
    { value: '100-500', label: '100-500₽' },
    { value: '500-1000', label: '500-1000₽' },
    { value: '1000+', label: 'От 1000₽' }
  ]

  const sortOptions = [
    { value: 'relevance', label: 'По релевантности' },
    { value: 'price_asc', label: 'Цена: по возрастанию' },
    { value: 'price_desc', label: 'Цена: по убыванию' },
    { value: 'name', label: 'По названию' },
    { value: 'rating', label: 'По рейтингу' }
  ]

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [searchParams])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)

    try {
      // Parallel search for products and shops
      const [productsResponse, shopsResponse] = await Promise.all([
        productsApi.searchProducts(query, { page: 1, limit: 20 }),
        shopsApi.searchShops(query)
      ])

      setProducts(productsResponse.data || [])
      setShops(shopsResponse || [])
    } catch (error) {
      notification.apiError(error)
      
      // Use fallback empty arrays if API fails
      setProducts([])
      setShops([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() })
    }
  }

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = filters.category === 'all' || product.categoryId?.toString() === filters.category
    const matchesStock = !filters.inStockOnly || product.isAvailable
    
    let matchesPrice = true
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(p => parseInt(p.replace('+', '')))
      if (max) {
        matchesPrice = product.price >= min && product.price <= max
      } else {
        matchesPrice = product.price >= min
      }
    }
    
    return matchesCategory && matchesStock && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      default:
        return 0
    }
  })

  const calculateDiscount = (price: number, oldPrice?: number) => {
    if (!oldPrice) return 0
    return Math.round(((oldPrice - price) / oldPrice) * 100)
  }

  const handleAddToCart = async (product: Product) => {
    // TODO: Update to use multiCartSlice with shop selection
    notification.info('Shopping cart functionality is being updated')
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="container">
          <h1>Поиск товаров и магазинов</h1>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Что ищете?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <span>🔍</span>
                Найти
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container">
        {searchParams.get('q') && (
          <>
            <div className="search-info">
              <p>Результаты поиска для: <strong>"{searchParams.get('q')}"</strong></p>
            </div>

            <div className="search-tabs">
              <button
                className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                🛒 Товары ({products.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'shops' ? 'active' : ''}`}
                onClick={() => setActiveTab('shops')}
              >
                🏪 Магазины ({shops.length})
              </button>
            </div>

            <div className="search-content">
              {activeTab === 'products' && (
                <>
                  <div className="search-filters">
                    <div className="filter-group">
                      <label>Категория:</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>Цена:</label>
                      <select
                        value={filters.priceRange}
                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                      >
                        {priceRanges.map(range => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>Сортировка:</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={filters.inStockOnly}
                          onChange={(e) => handleFilterChange('inStockOnly', e.target.checked)}
                        />
                        Только в наличии
                      </label>
                    </div>
                  </div>

                  {loading ? (
                    <div className="search-loading">
                      <div className="spinner"></div>
                      <p>Ищем товары...</p>
                    </div>
                  ) : (
                    <>
                      <div className="results-info">
                        <p>Найдено товаров: <strong>{sortedProducts.length}</strong></p>
                      </div>

                      {sortedProducts.length > 0 ? (
                        <div className="products-grid">
                          {sortedProducts.map(product => (
                            <div key={product.id} className="product-card">
                              <div className="product-image">
                                <img src={product.mainImage} alt={product.name} />
                                {product.oldPrice && (
                                  <span className="discount">-{calculateDiscount(product.price, product.oldPrice)}%</span>
                                )}
                                {!product.isAvailable && (
                                  <div className="out-of-stock">
                                    <span>Нет в наличии</span>
                                  </div>
                                )}
                              </div>
                              <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="description">{product.description}</p>
                                <div className="shop-info">
                                  <Link to={`/shop/${product.shopId}`} className="shop-link">
                                    🏪 {product.shopName}
                                  </Link>
                                </div>
                                {product.rating && (
                                  <div className="rating">
                                    <span className="star">⭐</span>
                                    <span className="value">{product.rating}</span>
                                    <span className="count">({product.reviewCount})</span>
                                  </div>
                                )}
                                <div className="price-row">
                                  <div className="price">
                                    <span className="current">{product.price}₽</span>
                                    {product.oldPrice && (
                                      <span className="old">{product.oldPrice}₽</span>
                                    )}
                                    <span className="unit">/{product.unit}</span>
                                  </div>
                                </div>
                                <button 
                                  className="add-to-cart"
                                  disabled={!product.isAvailable}
                                  onClick={() => handleAddToCart(product)}
                                >
                                  {product.isAvailable ? 'В корзину' : 'Нет в наличии'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-results">
                          <span className="icon">🔍</span>
                          <h3>Товары не найдены</h3>
                          <p>Попробуйте изменить параметры поиска или используйте другие ключевые слова</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {activeTab === 'shops' && (
                <>
                  {loading ? (
                    <div className="search-loading">
                      <div className="spinner"></div>
                      <p>Ищем магазины...</p>
                    </div>
                  ) : (
                    <>
                      <div className="results-info">
                        <p>Найдено магазинов: <strong>{shops.length}</strong></p>
                      </div>

                      {shops.length > 0 ? (
                        <div className="shops-grid">
                          {shops.map(shop => (
                            <div key={shop.id} className="shop-card">
                              <Link to={`/shop/${shop.slug}`} className="shop-card__image">
                                <img src={shop.image} alt={shop.name} />
                                {shop.deliveryFee === 0 && (
                                  <span className="badge free-delivery">Бесплатная доставка</span>
                                )}
                              </Link>
                              <div className="shop-card__content">
                                <div className="shop-header">
                                  <h3>
                                    <Link to={`/shop/${shop.slug}`}>{shop.name}</Link>
                                  </h3>
                                  <div className="rating">
                                    <span className="star">⭐</span>
                                    <span className="value">{shop.rating}</span>
                                    <span className="count">({shop.reviewCount})</span>
                                  </div>
                                </div>
                                <p className="description">{shop.description}</p>
                                <div className="tags">
                                  {shop.categories.slice(0, 3).map(cat => (
                                    <span key={cat} className="tag">{cat}</span>
                                  ))}
                                </div>
                                <div className="shop-info">
                                  <div className="info-item">
                                    <span className="icon">📍</span>
                                    <span className="text">{shop.address}</span>
                                  </div>
                                </div>
                                <div className="shop-footer">
                                  <div className="delivery-info">
                                    <span className="delivery-time">🚚 {shop.deliveryTime}</span>
                                    <span className="min-order">от {shop.minOrder}₽</span>
                                  </div>
                                  <Link to={`/shop/${shop.slug}`} className="shop-btn">
                                    Перейти →
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-results">
                          <span className="icon">🏪</span>
                          <h3>Магазины не найдены</h3>
                          <p>Попробуйте использовать другие ключевые слова для поиска</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {!searchParams.get('q') && (
          <div className="search-suggestions">
            <div className="suggestions-grid">
              <div className="suggestion-section">
                <h3>🔥 Популярные запросы</h3>
                <div className="suggestion-tags">
                  <button onClick={() => setSearchQuery('молоко')}>молоко</button>
                  <button onClick={() => setSearchQuery('хлеб')}>хлеб</button>
                  <button onClick={() => setSearchQuery('мясо')}>мясо</button>
                  <button onClick={() => setSearchQuery('овощи')}>овощи</button>
                  <button onClick={() => setSearchQuery('фрукты')}>фрукты</button>
                </div>
              </div>

              <div className="suggestion-section">
                <h3>🍎 Категории</h3>
                <div className="suggestion-tags">
                  <button onClick={() => setSearchQuery('Молочные продукты')}>Молочные продукты</button>
                  <button onClick={() => setSearchQuery('Хлеб и выпечка')}>Хлеб и выпечка</button>
                  <button onClick={() => setSearchQuery('Мясо и птица')}>Мясо и птица</button>
                  <button onClick={() => setSearchQuery('Овощи')}>Овощи</button>
                </div>
              </div>

              <div className="suggestion-section">
                <h3>🏪 Популярные магазины</h3>
                <div className="suggestion-tags">
                  <button onClick={() => setSearchQuery('Фермерская лавка')}>Фермерская лавка</button>
                  <button onClick={() => setSearchQuery('Молочная ферма')}>Молочная ферма</button>
                  <button onClick={() => setSearchQuery('Пекарня')}>Пекарня</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}