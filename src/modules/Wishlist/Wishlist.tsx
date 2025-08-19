import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './Wishlist.scss'

interface WishlistItem {
  id: string
  productId: string
  productName: string
  productImage: string
  price: number
  originalPrice?: number
  discount?: number
  shopId: string
  shopName: string
  rating: number
  reviewsCount: number
  inStock: boolean
  addedDate: string
  category: string
  tags: string[]
}

export const Wishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: '1',
      productId: 'prod-1',
      productName: 'Органические яблоки Голден',
      productImage: '/images/products/apples.jpg',
      price: 150,
      originalPrice: 180,
      discount: 17,
      shopId: 'shop-1',
      shopName: 'Фермерская лавка',
      rating: 4.8,
      reviewsCount: 124,
      inStock: true,
      addedDate: '2025-01-10T10:30:00',
      category: 'Фрукты',
      tags: ['органик', 'фермерское', 'свежее']
    },
    {
      id: '2',
      productId: 'prod-2',
      productName: 'Молоко фермерское 3.2%',
      productImage: '/images/products/milk.jpg',
      price: 90,
      shopId: 'shop-1',
      shopName: 'Фермерская лавка',
      rating: 4.9,
      reviewsCount: 89,
      inStock: true,
      addedDate: '2025-01-09T15:20:00',
      category: 'Молочные продукты',
      tags: ['фермерское', 'натуральное']
    },
    {
      id: '3',
      productId: 'prod-3',
      productName: 'Хлеб ремесленный на закваске',
      productImage: '/images/products/bread.jpg',
      price: 120,
      originalPrice: 150,
      discount: 20,
      shopId: 'shop-2',
      shopName: 'Пекарня "Традиция"',
      rating: 4.7,
      reviewsCount: 201,
      inStock: false,
      addedDate: '2025-01-08T09:15:00',
      category: 'Хлебобулочные',
      tags: ['ремесленный', 'на закваске']
    },
    {
      id: '4',
      productId: 'prod-4',
      productName: 'Мёд натуральный липовый',
      productImage: '/images/products/honey.jpg',
      price: 450,
      shopId: 'shop-3',
      shopName: 'Медовая лавка',
      rating: 5.0,
      reviewsCount: 67,
      inStock: true,
      addedDate: '2025-01-07T14:00:00',
      category: 'Мёд и джемы',
      tags: ['натуральный', 'липовый']
    },
    {
      id: '5',
      productId: 'prod-5',
      productName: 'Сыр домашний творожный',
      productImage: '/images/products/cheese.jpg',
      price: 320,
      originalPrice: 380,
      discount: 16,
      shopId: 'shop-4',
      shopName: 'Сырная лавка',
      rating: 4.6,
      reviewsCount: 156,
      inStock: true,
      addedDate: '2025-01-06T11:45:00',
      category: 'Сыры',
      tags: ['домашний', 'творожный']
    }
  ])

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleRemoveItem = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId))
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(itemId)
      return newSet
    })
  }

  const handleToggleSelect = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.size === wishlistItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(wishlistItems.map(item => item.id)))
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.inStock) {
      alert('Товар временно недоступен')
      return
    }
    // Simulate adding to cart
    console.log('Adding to cart:', item)
    alert(`${item.productName} добавлен в корзину`)
  }

  const handleAddSelectedToCart = () => {
    const itemsToAdd = wishlistItems.filter(item => 
      selectedItems.has(item.id) && item.inStock
    )
    
    if (itemsToAdd.length === 0) {
      alert('Выберите доступные товары для добавления в корзину')
      return
    }
    
    // Simulate adding to cart
    console.log('Adding to cart:', itemsToAdd)
    alert(`${itemsToAdd.length} товаров добавлено в корзину`)
    setSelectedItems(new Set())
  }

  const handleRemoveSelected = () => {
    setWishlistItems(prev => 
      prev.filter(item => !selectedItems.has(item.id))
    )
    setSelectedItems(new Set())
  }

  const handleShareWishlist = () => {
    // Generate share link
    const link = `${window.location.origin}/wishlist/shared/user123`
    setShareLink(link)
    setShowShareModal(true)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    alert('Ссылка скопирована!')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `${diffDays} дней назад`
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    })
  }

  const categories = ['all', ...new Set(wishlistItems.map(item => item.category))]

  const sortedAndFilteredItems = wishlistItems
    .filter(item => filterCategory === 'all' || item.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
        case 'price':
          return a.price - b.price
        case 'name':
          return a.productName.localeCompare(b.productName)
        default:
          return 0
      }
    })

  const totalPrice = sortedAndFilteredItems
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.price, 0)

  const totalSavings = sortedAndFilteredItems
    .filter(item => selectedItems.has(item.id) && item.originalPrice)
    .reduce((sum, item) => sum + (item.originalPrice! - item.price), 0)

  return (
    <div className="wishlist-page">
      <div className="page-header">
        <div className="container">
          <h1>Список желаний</h1>
          <nav className="breadcrumb">
            <Link to={ROUTES.HOME}>Главная</Link>
            <span>/</span>
            <Link to={ROUTES.USER_DASHBOARD}>Личный кабинет</Link>
            <span>/</span>
            <span>Список желаний</span>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="wishlist-content">
          <div className="wishlist-header">
            <div className="header-info">
              <h2>
                {wishlistItems.length} {wishlistItems.length === 1 ? 'товар' : 'товаров'} в списке
              </h2>
              {selectedItems.size > 0 && (
                <span className="selected-count">
                  Выбрано: {selectedItems.size}
                </span>
              )}
            </div>

            <div className="header-actions">
              <button 
                className="share-btn"
                onClick={handleShareWishlist}
              >
                🔗 Поделиться
              </button>
              {selectedItems.size > 0 && (
                <>
                  <button 
                    className="add-selected-btn"
                    onClick={handleAddSelectedToCart}
                  >
                    🛒 В корзину ({selectedItems.size})
                  </button>
                  <button 
                    className="remove-selected-btn"
                    onClick={handleRemoveSelected}
                  >
                    🗑️ Удалить выбранные
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="wishlist-controls">
            <div className="select-all">
              <label>
                <input
                  type="checkbox"
                  checked={selectedItems.size === wishlistItems.length && wishlistItems.length > 0}
                  onChange={handleSelectAll}
                />
                <span>Выбрать все</span>
              </label>
            </div>

            <div className="filters">
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="category-filter"
              >
                <option value="all">Все категории</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'name')}
                className="sort-select"
              >
                <option value="date">По дате добавления</option>
                <option value="price">По цене</option>
                <option value="name">По названию</option>
              </select>
            </div>
          </div>

          {sortedAndFilteredItems.length === 0 ? (
            <div className="empty-wishlist">
              <div className="empty-icon">💝</div>
              <h3>Список желаний пуст</h3>
              <p>Добавляйте понравившиеся товары, чтобы не потерять их</p>
              <Link to={ROUTES.VENDORS} className="browse-btn">
                Перейти к покупкам
              </Link>
            </div>
          ) : (
            <>
              <div className="wishlist-grid">
                {sortedAndFilteredItems.map(item => (
                  <div key={item.id} className={`wishlist-item ${!item.inStock ? 'out-of-stock' : ''}`}>
                    <div className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                      />
                    </div>

                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Удалить из списка"
                    >
                      ✕
                    </button>

                    {item.discount && (
                      <div className="discount-badge">-{item.discount}%</div>
                    )}

                    {!item.inStock && (
                      <div className="stock-badge">Нет в наличии</div>
                    )}

                    <Link to={`/product/${item.productId}`} className="item-image">
                      <img src={item.productImage} alt={item.productName} />
                    </Link>

                    <div className="item-details">
                      <Link to={`/shop/${item.shopId}`} className="shop-name">
                        {item.shopName}
                      </Link>

                      <Link to={`/product/${item.productId}`} className="product-name">
                        {item.productName}
                      </Link>

                      <div className="item-tags">
                        {item.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>

                      <div className="item-rating">
                        <span className="stars">⭐ {item.rating}</span>
                        <span className="reviews">({item.reviewsCount})</span>
                      </div>

                      <div className="item-price">
                        <span className="current-price">{item.price} ₽</span>
                        {item.originalPrice && (
                          <span className="original-price">{item.originalPrice} ₽</span>
                        )}
                      </div>

                      <div className="item-footer">
                        <span className="added-date">
                          Добавлено {formatDate(item.addedDate)}
                        </span>
                        <button 
                          className={`add-to-cart-btn ${!item.inStock ? 'disabled' : ''}`}
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.inStock}
                        >
                          {item.inStock ? '🛒 В корзину' : 'Недоступно'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedItems.size > 0 && (
                <div className="wishlist-summary">
                  <div className="summary-content">
                    <div className="summary-info">
                      <p>Выбрано товаров: <strong>{selectedItems.size}</strong></p>
                      <p>Общая стоимость: <strong>{totalPrice.toLocaleString()} ₽</strong></p>
                      {totalSavings > 0 && (
                        <p className="savings">Экономия: <strong>{totalSavings.toLocaleString()} ₽</strong></p>
                      )}
                    </div>
                    <button 
                      className="checkout-selected-btn"
                      onClick={handleAddSelectedToCart}
                    >
                      Добавить выбранное в корзину
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="wishlist-recommendations">
            <h3>Рекомендуем также</h3>
            <div className="recommendations-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="recommendation-card">
                  <img src={`/images/products/rec-${i}.jpg`} alt="Product" />
                  <h4>Рекомендованный товар {i}</h4>
                  <p className="shop">Название магазина</p>
                  <div className="price">
                    <span>250 ₽</span>
                    <button className="add-btn">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Поделиться списком желаний</h2>
              <button 
                className="close-btn"
                onClick={() => setShowShareModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>Поделитесь этой ссылкой с друзьями:</p>
              <div className="share-link-container">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="share-link-input"
                />
                <button 
                  className="copy-btn"
                  onClick={handleCopyLink}
                >
                  📋 Копировать
                </button>
              </div>

              <div className="share-options">
                <h4>Или поделитесь в соцсетях:</h4>
                <div className="social-buttons">
                  <button className="social-btn vk">VK</button>
                  <button className="social-btn telegram">Telegram</button>
                  <button className="social-btn whatsapp">WhatsApp</button>
                  <button className="social-btn email">Email</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}