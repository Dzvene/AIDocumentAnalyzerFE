import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@constants/routes'
import { productsApi, vendorsApi } from '@api'
import { Product, Category } from '@types/interfaces/product'
import { Shop } from '@types/interfaces/shop'
import { selectTotalItemsCount } from '@store/slices/multiCartSlice'
import { AppDispatch } from '@store/store'
import { useNotification } from '@hooks/useNotification'
import './Home.scss'

export const Home: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const cartItemCount = useSelector(selectTotalItemsCount)
  const notification = useNotification()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch data in parallel
        const [categoriesResponse, vendorsResponse, productsResponse] = await Promise.all([
          productsApi.getTopCategories(6),
          vendorsApi.getFeaturedVendors(4),
          productsApi.getFeaturedProducts(6)
        ])

        setCategories(categoriesResponse)
        setFeaturedShops(vendorsResponse)
        setFeaturedProducts(productsResponse)
      } catch (err) {
        console.error('Error fetching home data:', err)
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.')
        notification.error('Ошибка загрузки', 'Не удалось загрузить данные с сервера')
        
        // Fallback to mock data in case of API error
        const mockCategories: Category[] = [
          { id: 1, name: 'Продукты', slug: 'produkty', icon: '🍎', productCount: 234, level: 0, isActive: true, sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 2, name: 'Напитки', slug: 'napitki', icon: '🥤', productCount: 156, level: 0, isActive: true, sortOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 3, name: 'Молочное', slug: 'molochnoe', icon: '🥛', productCount: 89, level: 0, isActive: true, sortOrder: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 4, name: 'Выпечка', slug: 'vypechka', icon: '🍞', productCount: 67, level: 0, isActive: true, sortOrder: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 5, name: 'Мясо', slug: 'myaso', icon: '🥩', productCount: 112, level: 0, isActive: true, sortOrder: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 6, name: 'Овощи', slug: 'ovoshchi', icon: '🥦', productCount: 198, level: 0, isActive: true, sortOrder: 6, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ]

        const mockShops: Shop[] = [
          {
            id: 1,
            name: 'Фермерская лавка',
            slug: 'fermerskaya-lavka',
            description: 'Свежие продукты от местных фермеров',
            image: 'https://via.placeholder.com/400x250',
            rating: 4.8,
            reviewCount: 124,
            deliveryTime: '30-45 мин',
            deliveryFee: 150,
            minOrder: 500,
            maxDistance: 10,
            address: 'ул. Садовая, 12',
            categories: ['Овощи', 'Фрукты', 'Молочное'],
            isActive: true,
            isVerified: true,
            ownerId: 'owner1',
            workingHours: [],
            paymentMethods: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Пекарня "Хлебушек"',
            slug: 'pekarnya-hlebushek',
            description: 'Свежая выпечка каждый день',
            image: 'https://via.placeholder.com/400x250',
            rating: 4.9,
            reviewCount: 89,
            deliveryTime: '20-30 мин',
            deliveryFee: 100,
            minOrder: 300,
            maxDistance: 8,
            address: 'ул. Мира, 45',
            categories: ['Выпечка', 'Десерты'],
            isActive: true,
            isVerified: true,
            ownerId: 'owner2',
            workingHours: [],
            paymentMethods: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]

        const mockProducts: Product[] = [
          {
            id: 1,
            name: 'Молоко фермерское 3.2%',
            slug: 'moloko-fermerskoe',
            description: 'Натуральное фермерское молоко',
            price: 89,
            oldPrice: 120,
            discount: 25,
            images: ['https://via.placeholder.com/200x200'],
            mainImage: 'https://via.placeholder.com/200x200',
            categoryId: 3,
            categoryName: 'Молочное',
            shopId: 1,
            shopName: 'Фермерская лавка',
            shopSlug: 'fermerskaya-lavka',
            rating: 4.9,
            reviewCount: 45,
            isAvailable: true,
            stock: 50,
            unit: 'л',
            tags: [],
            viewCount: 123,
            saleCount: 89,
            isPromoted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]

        setCategories(mockCategories)
        setFeaturedShops(mockShops)
        setFeaturedProducts(mockProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search navigation
    console.log('Search for:', searchQuery)
  }

  const handleAddToCart = async (product: Product) => {
    // TODO: Update to use multiCartSlice with shop selection
    notification.info('Shopping cart functionality is being updated')
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero__content">
            <h1 className="hero__title">
              Покупайте в местных магазинах
              <span className="hero__title-accent"> с доставкой</span>
            </h1>
            <p className="hero__subtitle">
              Свежие продукты, быстрая доставка, поддержка местного бизнеса
            </p>

            <form className="hero__search" onSubmit={handleSearch}>
              <div className="search-box">
                <svg className="search-box__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="11.7659" cy="11.7666" r="8.98856" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M18.0176 18.4852L21.5416 22.0001" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <input
                  type="text"
                  className="search-box__input"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-box__button">
                  {t('common.search')}
                </button>
              </div>
            </form>

            <div className="hero__tags">
              <span className="hero__tags-label">Популярное:</span>
              <Link to={`${ROUTES.SEARCH}?q=молоко`} className="hero__tag">Молоко</Link>
              <Link to={`${ROUTES.SEARCH}?q=хлеб`} className="hero__tag">Хлеб</Link>
              <Link to={`${ROUTES.SEARCH}?q=овощи`} className="hero__tag">Овощи</Link>
              <Link to={`${ROUTES.SEARCH}?q=фрукты`} className="hero__tag">Фрукты</Link>
            </div>
          </div>

          <div className="hero__image">
            <img src="https://via.placeholder.com/600x400" alt="Доставка продуктов" />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="steps">
            <div className="step">
              <div className="step__icon">🏪</div>
              <h3 className="step__title">Выберите магазин</h3>
              <p className="step__description">Найдите магазин рядом с вами</p>
            </div>
            <div className="step">
              <div className="step__icon">🛒</div>
              <h3 className="step__title">Добавьте товары</h3>
              <p className="step__description">Выберите нужные продукты</p>
            </div>
            <div className="step">
              <div className="step__icon">💳</div>
              <h3 className="step__title">Оформите заказ</h3>
              <p className="step__description">Оплатите удобным способом</p>
            </div>
            <div className="step">
              <div className="step__icon">🚚</div>
              <h3 className="step__title">Получите доставку</h3>
              <p className="step__description">Курьер привезет заказ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="home-categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Популярные категории</h2>
            <Link to={ROUTES.CATEGORIES} className="section-link">
              Все категории
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : error ? (
            <div className="error">
              {error}
              <button onClick={() => window.location.reload()}>Попробовать снова</button>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`${ROUTES.SEARCH}?category=${category.id}`}
                  className="category-card"
                >
                  <div className="category-card__icon">{category.icon}</div>
                  <h4 className="category-card__name">{category.name}</h4>
                  <span className="category-card__count">{category.productCount} товаров</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Популярные товары</h2>
            <Link to={ROUTES.SEARCH} className="section-link">
              Все товары
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : error ? (
            <div className="error">
              {error}
              <button onClick={() => window.location.reload()}>Попробовать снова</button>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  {product.discount && (
                    <div className="product-card__badge">-{product.discount}%</div>
                  )}
                  <div className="product-card__image">
                    <img src={product.mainImage} alt={product.name} />
                  </div>
                  <div className="product-card__content">
                    <h4 className="product-card__name">{product.name}</h4>
                    <p className="product-card__shop">{product.shopName}</p>
                    <div className="product-card__rating">
                      <span className="star">⭐</span>
                      <span>{product.rating}</span>
                    </div>
                    <div className="product-card__price">
                      <span className="current">₽{product.price}</span>
                      {product.oldPrice && (
                        <span className="old">₽{product.oldPrice}</span>
                      )}
                    </div>
                    <button 
                      className="product-card__add"
                      onClick={() => handleAddToCart(product)}
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Shops */}
      <section className="featured-shops">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Популярные магазины</h2>
            <Link to={ROUTES.VENDORS} className="section-link">
              Все магазины
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : error ? (
            <div className="error">
              {error}
              <button onClick={() => window.location.reload()}>Попробовать снова</button>
            </div>
          ) : (
            <div className="shops-grid">
              {featuredShops.map((shop) => (
                <Link
                  key={shop.id}
                  to={`${ROUTES.VIEW_SHOP.replace(':slug', shop.slug)}`}
                  className="shop-card"
                >
                  <div className="shop-card__image">
                    <img src={shop.image} alt={shop.name} />
                  </div>
                  <div className="shop-card__content">
                    <h3 className="shop-card__name">{shop.name}</h3>
                    <p className="shop-card__description">{shop.description}</p>
                    <div className="shop-card__info">
                      <div className="shop-card__rating">
                        <span className="star">⭐</span>
                        <span>{shop.rating}</span>
                      </div>
                      <div className="shop-card__delivery">
                        🚚 {shop.deliveryTime}
                      </div>
                      {shop.minOrder > 0 && (
                        <div className="shop-card__min-order">
                          От ₽{shop.minOrder}
                        </div>
                      )}
                    </div>
                    <div className="shop-card__categories">
                      {shop.categories.map((cat, index) => (
                        <span key={index} className="shop-card__category">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta__content">
            <h2 className="cta__title">Станьте партнером</h2>
            <p className="cta__description">
              Увеличьте продажи вашего магазина, присоединившись к нашей платформе
            </p>
            <button className="cta__button">Подключить магазин</button>
          </div>
        </div>
      </section>
    </div>
  )
}