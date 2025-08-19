import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './Shop.scss'

interface Product {
  id: number
  name: string
  description: string
  price: number
  oldPrice?: number
  image: string
  category: string
  inStock: boolean
  unit: string
}

interface ShopData {
  id: number
  name: string
  description: string
  fullDescription: string
  category: string
  rating: number
  reviewsCount: number
  image: string
  coverImage: string
  address: string
  phone: string
  email: string
  website: string
  workingHours: {
    weekdays: string
    saturday: string
    sunday: string
  }
  deliveryTime: string
  minOrder: number
  deliveryFee: number
  tags: string[]
  isNew: boolean
  isFeatured: boolean
  socialLinks: {
    vk?: string
    instagram?: string
    telegram?: string
  }
}

interface Review {
  id: number
  userName: string
  userAvatar: string
  rating: number
  date: string
  comment: string
  likes: number
}

export const Shop: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [shop, setShop] = useState<ShopData | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'info' | 'reviews'>('products')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItems, setCartItems] = useState<{[key: number]: number}>({})

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      const mockShop: ShopData = {
        id: Number(id),
        name: 'Фермерская лавка',
        description: 'Свежие продукты от местных фермеров',
        fullDescription: 'Мы сотрудничаем с лучшими фермерскими хозяйствами региона, чтобы доставлять вам самые свежие и качественные продукты. Все наши товары проходят строгий контроль качества и имеют необходимые сертификаты. Мы гордимся тем, что поддерживаем местных производителей и предлагаем вам натуральные продукты без химических добавок.',
        category: 'Продукты',
        rating: 4.8,
        reviewsCount: 234,
        image: 'https://via.placeholder.com/200x200',
        coverImage: 'https://via.placeholder.com/1200x300',
        address: 'ул. Садовая, 15',
        phone: '+7 (495) 123-45-67',
        email: 'info@ferma-lavka.ru',
        website: 'www.ferma-lavka.ru',
        workingHours: {
          weekdays: '08:00 - 22:00',
          saturday: '09:00 - 22:00',
          sunday: '10:00 - 20:00'
        },
        deliveryTime: '30-45 мин',
        minOrder: 500,
        deliveryFee: 0,
        tags: ['Овощи', 'Фрукты', 'Молочные продукты', 'Яйца', 'Мед'],
        isNew: false,
        isFeatured: true,
        socialLinks: {
          vk: 'https://vk.com/fermalavka',
          instagram: 'https://instagram.com/fermalavka',
          telegram: 'https://t.me/fermalavka'
        }
      }

      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'Помидоры розовые',
          description: 'Сладкие и сочные помидоры',
          price: 120,
          oldPrice: 150,
          image: 'https://via.placeholder.com/200x200',
          category: 'Овощи',
          inStock: true,
          unit: 'кг'
        },
        {
          id: 2,
          name: 'Огурцы тепличные',
          description: 'Свежие хрустящие огурцы',
          price: 90,
          image: 'https://via.placeholder.com/200x200',
          category: 'Овощи',
          inStock: true,
          unit: 'кг'
        },
        {
          id: 3,
          name: 'Яблоки Антоновка',
          description: 'Ароматные кисло-сладкие яблоки',
          price: 80,
          oldPrice: 100,
          image: 'https://via.placeholder.com/200x200',
          category: 'Фрукты',
          inStock: true,
          unit: 'кг'
        },
        {
          id: 4,
          name: 'Молоко фермерское',
          description: 'Натуральное цельное молоко 3.5%',
          price: 95,
          image: 'https://via.placeholder.com/200x200',
          category: 'Молочные продукты',
          inStock: true,
          unit: 'л'
        },
        {
          id: 5,
          name: 'Творог домашний',
          description: 'Нежный творог 9% жирности',
          price: 280,
          image: 'https://via.placeholder.com/200x200',
          category: 'Молочные продукты',
          inStock: true,
          unit: 'кг'
        },
        {
          id: 6,
          name: 'Яйца куриные С0',
          description: 'Отборные яйца от кур свободного выгула',
          price: 120,
          image: 'https://via.placeholder.com/200x200',
          category: 'Яйца',
          inStock: true,
          unit: '10 шт'
        },
        {
          id: 7,
          name: 'Мед цветочный',
          description: 'Натуральный мед с пасеки',
          price: 450,
          oldPrice: 500,
          image: 'https://via.placeholder.com/200x200',
          category: 'Мед',
          inStock: true,
          unit: 'кг'
        },
        {
          id: 8,
          name: 'Картофель молодой',
          description: 'Рассыпчатый картофель нового урожая',
          price: 45,
          image: 'https://via.placeholder.com/200x200',
          category: 'Овощи',
          inStock: false,
          unit: 'кг'
        }
      ]

      const mockReviews: Review[] = [
        {
          id: 1,
          userName: 'Анна П.',
          userAvatar: 'https://via.placeholder.com/50',
          rating: 5,
          date: '2024-01-10',
          comment: 'Отличный магазин! Всегда свежие продукты, быстрая доставка. Особенно нравятся овощи - как с грядки!',
          likes: 12
        },
        {
          id: 2,
          userName: 'Михаил С.',
          userAvatar: 'https://via.placeholder.com/50',
          rating: 4,
          date: '2024-01-08',
          comment: 'Хорошее качество продуктов, но иногда бывают задержки с доставкой. В целом доволен.',
          likes: 5
        },
        {
          id: 3,
          userName: 'Елена К.',
          userAvatar: 'https://via.placeholder.com/50',
          rating: 5,
          date: '2024-01-05',
          comment: 'Покупаю здесь уже полгода. Качество всегда на высоте, цены адекватные. Рекомендую!',
          likes: 18
        }
      ]

      setShop(mockShop)
      setProducts(mockProducts)
      setReviews(mockReviews)
      setLoading(false)
    }, 500)
  }, [id])

  const productCategories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddToCart = (productId: number) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      const newItems = { ...cartItems }
      delete newItems[productId]
      setCartItems(newItems)
    } else {
      setCartItems(prev => ({
        ...prev,
        [productId]: quantity
      }))
    }
  }

  const calculateDiscount = (price: number, oldPrice?: number) => {
    if (!oldPrice) return 0
    return Math.round(((oldPrice - price) / oldPrice) * 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="shop-loading">
        <div className="spinner"></div>
        <p>Загрузка магазина...</p>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="shop-error">
        <h2>Магазин не найден</h2>
        <Link to={ROUTES.VENDORS}>Вернуться к каталогу</Link>
      </div>
    )
  }

  return (
    <div className="shop-page">
      <div className="shop-header" style={{ backgroundImage: `url(${shop.coverImage})` }}>
        <div className="overlay"></div>
        <div className="container">
          <div className="shop-header__content">
            <div className="shop-info">
              <img src={shop.image} alt={shop.name} className="shop-logo" />
              <div className="shop-details">
                <div className="badges">
                  {shop.isFeatured && <span className="badge featured">Рекомендуем</span>}
                  {shop.isNew && <span className="badge new">Новый</span>}
                  {shop.deliveryFee === 0 && <span className="badge free">Бесплатная доставка</span>}
                </div>
                <h1>{shop.name}</h1>
                <p className="description">{shop.description}</p>
                <div className="meta">
                  <div className="rating">
                    <span className="star">⭐</span>
                    <span className="value">{shop.rating}</span>
                    <span className="count">({shop.reviewsCount} отзывов)</span>
                  </div>
                  <div className="delivery">
                    <span>🚚 {shop.deliveryTime}</span>
                    <span>•</span>
                    <span>Мин. заказ: {shop.minOrder}₽</span>
                    {shop.deliveryFee > 0 && (
                      <>
                        <span>•</span>
                        <span>Доставка: {shop.deliveryFee}₽</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="tags">
                  {shop.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shop-nav">
        <div className="container">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              🛒 Товары
            </button>
            <button
              className={`nav-tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              ℹ️ Информация
            </button>
            <button
              className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              ⭐ Отзывы ({shop.reviewsCount})
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="shop-content">
          {activeTab === 'products' && (
            <div className="products-section">
              <div className="products-header">
                <div className="filters">
                  <div className="category-filter">
                    {productCategories.map(category => (
                      <button
                        key={category}
                        className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category === 'all' ? 'Все товары' : category}
                      </button>
                    ))}
                  </div>
                  <div className="search-filter">
                    <input
                      type="text"
                      placeholder="Поиск товаров..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                </div>
              </div>

              <div className="products-grid">
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                      {product.oldPrice && (
                        <span className="discount">-{calculateDiscount(product.price, product.oldPrice)}%</span>
                      )}
                      {!product.inStock && (
                        <div className="out-of-stock">
                          <span>Нет в наличии</span>
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="description">{product.description}</p>
                      <div className="price-row">
                        <div className="price">
                          <span className="current">{product.price}₽</span>
                          {product.oldPrice && (
                            <span className="old">{product.oldPrice}₽</span>
                          )}
                          <span className="unit">/{product.unit}</span>
                        </div>
                      </div>
                      <div className="product-actions">
                        {cartItems[product.id] ? (
                          <div className="quantity-control">
                            <button 
                              onClick={() => handleUpdateQuantity(product.id, cartItems[product.id] - 1)}
                              className="qty-btn"
                            >
                              -
                            </button>
                            <span className="qty-value">{cartItems[product.id]}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(product.id, cartItems[product.id] + 1)}
                              className="qty-btn"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="add-to-cart"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={!product.inStock}
                          >
                            {product.inStock ? 'В корзину' : 'Нет в наличии'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="no-products">
                  <span className="icon">📦</span>
                  <h3>Товары не найдены</h3>
                  <p>Попробуйте изменить параметры поиска</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="info-section">
              <div className="info-grid">
                <div className="info-main">
                  <h2>О магазине</h2>
                  <p className="full-description">{shop.fullDescription}</p>
                  
                  <h3>Условия доставки</h3>
                  <div className="delivery-info">
                    <div className="info-item">
                      <span className="label">Время доставки:</span>
                      <span className="value">{shop.deliveryTime}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Минимальный заказ:</span>
                      <span className="value">{shop.minOrder}₽</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Стоимость доставки:</span>
                      <span className="value">{shop.deliveryFee === 0 ? 'Бесплатно' : `${shop.deliveryFee}₽`}</span>
                    </div>
                  </div>

                  <h3>Способы оплаты</h3>
                  <div className="payment-methods">
                    <span className="method">💳 Картой онлайн</span>
                    <span className="method">💵 Наличными курьеру</span>
                    <span className="method">📱 СБП</span>
                  </div>
                </div>

                <div className="info-sidebar">
                  <div className="contact-card">
                    <h3>Контактная информация</h3>
                    <div className="contact-item">
                      <span className="icon">📍</span>
                      <span>{shop.address}</span>
                    </div>
                    <div className="contact-item">
                      <span className="icon">📞</span>
                      <a href={`tel:${shop.phone}`}>{shop.phone}</a>
                    </div>
                    <div className="contact-item">
                      <span className="icon">✉️</span>
                      <a href={`mailto:${shop.email}`}>{shop.email}</a>
                    </div>
                    <div className="contact-item">
                      <span className="icon">🌐</span>
                      <a href={`https://${shop.website}`} target="_blank" rel="noopener noreferrer">
                        {shop.website}
                      </a>
                    </div>
                  </div>

                  <div className="hours-card">
                    <h3>Время работы</h3>
                    <div className="hours-item">
                      <span className="day">Пн-Пт:</span>
                      <span className="time">{shop.workingHours.weekdays}</span>
                    </div>
                    <div className="hours-item">
                      <span className="day">Суббота:</span>
                      <span className="time">{shop.workingHours.saturday}</span>
                    </div>
                    <div className="hours-item">
                      <span className="day">Воскресенье:</span>
                      <span className="time">{shop.workingHours.sunday}</span>
                    </div>
                  </div>

                  <div className="social-card">
                    <h3>Мы в соцсетях</h3>
                    <div className="social-links">
                      {shop.socialLinks.vk && (
                        <a href={shop.socialLinks.vk} target="_blank" rel="noopener noreferrer">
                          VKontakte
                        </a>
                      )}
                      {shop.socialLinks.instagram && (
                        <a href={shop.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                          Instagram
                        </a>
                      )}
                      {shop.socialLinks.telegram && (
                        <a href={shop.socialLinks.telegram} target="_blank" rel="noopener noreferrer">
                          Telegram
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <div className="reviews-header">
                <div className="rating-summary">
                  <div className="rating-value">
                    <span className="number">{shop.rating}</span>
                    <div className="stars">
                      {'⭐'.repeat(Math.round(shop.rating))}
                    </div>
                    <span className="count">{shop.reviewsCount} отзывов</span>
                  </div>
                </div>
                <button className="write-review-btn">
                  ✍️ Написать отзыв
                </button>
              </div>

              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <img src={review.userAvatar} alt={review.userName} />
                      <div className="review-meta">
                        <h4>{review.userName}</h4>
                        <div className="rating">
                          {'⭐'.repeat(review.rating)}
                        </div>
                        <span className="date">{formatDate(review.date)}</span>
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <div className="review-footer">
                      <button className="like-btn">
                        👍 Полезно ({review.likes})
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="load-more-btn">
                Показать еще отзывы
              </button>
            </div>
          )}
        </div>
      </div>

      {Object.keys(cartItems).length > 0 && (
        <div className="floating-cart">
          <div className="cart-info">
            <span className="items-count">
              Товаров: {Object.values(cartItems).reduce((a, b) => a + b, 0)}
            </span>
            <span className="total-price">
              {products
                .filter(p => cartItems[p.id])
                .reduce((total, p) => total + p.price * cartItems[p.id], 0)}₽
            </span>
          </div>
          <Link to={ROUTES.CART} className="checkout-btn">
            Оформить заказ
          </Link>
        </div>
      )}
    </div>
  )
}