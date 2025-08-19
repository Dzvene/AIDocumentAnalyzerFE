import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './Offers.scss'

interface Offer {
  id: number
  title: string
  description: string
  discount: string
  validUntil: string
  image: string
  shopName: string
  shopLogo: string
  code?: string
  type: 'percentage' | 'fixed' | 'freeDelivery' | 'buyOneGetOne'
  minOrder?: number
  products?: Array<{
    id: number
    name: string
    oldPrice: number
    newPrice: number
  }>
}

export const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    // TODO: Replace with API call
    const mockOffers: Offer[] = [
      {
        id: 1,
        title: 'Скидка 30% на все молочные продукты',
        description: 'Только в эти выходные! Скидка на весь ассортимент молочной продукции',
        discount: '30%',
        validUntil: '2024-01-31',
        image: 'https://via.placeholder.com/600x300',
        shopName: 'Фермерская лавка',
        shopLogo: 'https://via.placeholder.com/60x60',
        code: 'MILK30',
        type: 'percentage',
        minOrder: 500
      },
      {
        id: 2,
        title: 'Бесплатная доставка',
        description: 'При заказе от 1500 рублей доставка бесплатно',
        discount: 'Бесплатная доставка',
        validUntil: '2024-02-15',
        image: 'https://via.placeholder.com/600x300',
        shopName: 'Супермаркет 24/7',
        shopLogo: 'https://via.placeholder.com/60x60',
        type: 'freeDelivery',
        minOrder: 1500
      },
      {
        id: 3,
        title: '2 по цене 1',
        description: 'Купи один круассан - второй в подарок!',
        discount: '2 по цене 1',
        validUntil: '2024-01-25',
        image: 'https://via.placeholder.com/600x300',
        shopName: 'Пекарня "Хлебушек"',
        shopLogo: 'https://via.placeholder.com/60x60',
        type: 'buyOneGetOne'
      },
      {
        id: 4,
        title: 'Скидка 200₽ на первый заказ',
        description: 'Специальное предложение для новых клиентов',
        discount: '200₽',
        validUntil: '2024-02-28',
        image: 'https://via.placeholder.com/600x300',
        shopName: 'Мясной мир',
        shopLogo: 'https://via.placeholder.com/60x60',
        code: 'NEW200',
        type: 'fixed',
        minOrder: 1000
      },
      {
        id: 5,
        title: 'Скидка 15% на фрукты и овощи',
        description: 'Свежие фрукты и овощи со скидкой каждую среду',
        discount: '15%',
        validUntil: '2024-01-31',
        image: 'https://via.placeholder.com/600x300',
        shopName: 'Фермерская лавка',
        shopLogo: 'https://via.placeholder.com/60x60',
        code: 'FRESH15',
        type: 'percentage'
      },
      {
        id: 6,
        title: 'Комбо-набор со скидкой',
        description: 'Купи комбо-набор и сэкономь 25%',
        discount: '25%',
        validUntil: '2024-02-10',
        image: 'https://via.placeholder.com/600x300',
        shopName: 'Супермаркет 24/7',
        shopLogo: 'https://via.placeholder.com/60x60',
        type: 'percentage',
        products: [
          { id: 1, name: 'Хлеб', oldPrice: 45, newPrice: 35 },
          { id: 2, name: 'Молоко', oldPrice: 89, newPrice: 70 },
          { id: 3, name: 'Яйца', oldPrice: 120, newPrice: 90 }
        ]
      }
    ]

    setTimeout(() => {
      setOffers(mockOffers)
      setLoading(false)
    }, 500)
  }, [])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    // TODO: Show toast notification
    alert(`Код ${code} скопирован!`)
  }

  const filteredOffers = filterType === 'all' 
    ? offers 
    : offers.filter(offer => offer.type === filterType)

  const getOfferTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return 'Процентная скидка'
      case 'fixed': return 'Фиксированная скидка'
      case 'freeDelivery': return 'Бесплатная доставка'
      case 'buyOneGetOne': return 'Акция 2=1'
      default: return 'Специальное предложение'
    }
  }

  return (
    <div className="offers-page">
      <div className="offers-hero">
        <div className="container">
          <h1 className="offers-hero__title">Акции и скидки</h1>
          <p className="offers-hero__subtitle">
            Экономьте на покупках с нашими специальными предложениями
          </p>
        </div>
      </div>

      <div className="container">
        <div className="offers-filters">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Все акции
          </button>
          <button
            className={`filter-btn ${filterType === 'percentage' ? 'active' : ''}`}
            onClick={() => setFilterType('percentage')}
          >
            Скидки
          </button>
          <button
            className={`filter-btn ${filterType === 'freeDelivery' ? 'active' : ''}`}
            onClick={() => setFilterType('freeDelivery')}
          >
            Бесплатная доставка
          </button>
          <button
            className={`filter-btn ${filterType === 'buyOneGetOne' ? 'active' : ''}`}
            onClick={() => setFilterType('buyOneGetOne')}
          >
            2=1
          </button>
          <button
            className={`filter-btn ${filterType === 'fixed' ? 'active' : ''}`}
            onClick={() => setFilterType('fixed')}
          >
            Купоны
          </button>
        </div>

        {loading ? (
          <div className="loading">Загрузка акций...</div>
        ) : (
          <div className="offers-grid">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-card__image">
                  <img src={offer.image} alt={offer.title} />
                  <div className="offer-card__badge">
                    {offer.discount}
                  </div>
                </div>
                
                <div className="offer-card__content">
                  <div className="offer-card__shop">
                    <img src={offer.shopLogo} alt={offer.shopName} className="shop-logo" />
                    <span className="shop-name">{offer.shopName}</span>
                  </div>

                  <h3 className="offer-card__title">{offer.title}</h3>
                  <p className="offer-card__description">{offer.description}</p>

                  <div className="offer-card__meta">
                    <span className="offer-type">{getOfferTypeLabel(offer.type)}</span>
                    <span className="valid-until">До {new Date(offer.validUntil).toLocaleDateString('ru-RU')}</span>
                  </div>

                  {offer.minOrder && (
                    <div className="offer-card__condition">
                      Минимальный заказ: ₽{offer.minOrder}
                    </div>
                  )}

                  {offer.products && (
                    <div className="offer-card__products">
                      <h4>Товары в акции:</h4>
                      <ul>
                        {offer.products.map(product => (
                          <li key={product.id}>
                            {product.name}: 
                            <span className="old-price">₽{product.oldPrice}</span>
                            <span className="new-price">₽{product.newPrice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="offer-card__actions">
                    {offer.code ? (
                      <div className="promo-code">
                        <input 
                          type="text" 
                          value={offer.code} 
                          readOnly 
                          className="promo-code__input"
                        />
                        <button 
                          className="promo-code__copy"
                          onClick={() => handleCopyCode(offer.code!)}
                        >
                          Копировать
                        </button>
                      </div>
                    ) : (
                      <Link 
                        to={`${ROUTES.VIEW_SHOP.replace(':slug', offer.shopName)}`}
                        className="offer-card__link"
                      >
                        Перейти в магазин
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredOffers.length === 0 && !loading && (
          <div className="no-offers">
            <p>Нет доступных акций в выбранной категории</p>
          </div>
        )}
      </div>

      <section className="offers-subscribe">
        <div className="container">
          <div className="subscribe-content">
            <h2>Не пропустите выгодные предложения!</h2>
            <p>Подпишитесь на рассылку и получайте уведомления о новых акциях</p>
            <form className="subscribe-form">
              <input 
                type="email" 
                placeholder="Введите ваш email" 
                className="subscribe-form__input"
              />
              <button type="submit" className="subscribe-form__button">
                Подписаться
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}