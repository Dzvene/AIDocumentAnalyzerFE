import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  selectPremiumSlider, 
  fetchPremiumShops,
  trackAdImpression,
  trackAdClick 
} from '@store/slices/advertisingSlice'
import { selectUserLocation } from '@store/slices/locationSlice'
import { AppDispatch } from '@store/store'
import './PremiumShopsSlider.scss'

export const PremiumShopsSlider: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const premiumShops = useSelector(selectPremiumSlider)
  const userLocation = useSelector(selectUserLocation)
  
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Загружаем премиум магазины при наличии геолокации
  useEffect(() => {
    if (userLocation?.coordinates) {
      dispatch(fetchPremiumShops({
        lat: userLocation.coordinates.lat,
        lng: userLocation.coordinates.lng,
        radius: 10 // Базовый радиус 10км для рекламы
      }))
    }
  }, [userLocation, dispatch])
  
  // Трекинг показов
  useEffect(() => {
    if (premiumShops.length > 0 && premiumShops[currentSlide]) {
      dispatch(trackAdImpression(premiumShops[currentSlide].id))
    }
  }, [currentSlide, premiumShops, dispatch])
  
  // Автопереключение слайдов
  useEffect(() => {
    if (isAutoPlaying && premiumShops.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % premiumShops.length)
      }, 5000) // Переключение каждые 5 секунд
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [isAutoPlaying, premiumShops.length])
  
  const handleSlideClick = (shopId: string, index: number) => {
    dispatch(trackAdClick({ 
      shopId, 
      position: `premium_slider_${index}` 
    }))
  }
  
  const handleMouseEnter = () => {
    setIsAutoPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }
  
  const handleMouseLeave = () => {
    setIsAutoPlaying(true)
  }
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Возобновляем через 10 сек
  }
  
  if (!premiumShops.length || !userLocation) {
    return null
  }
  
  return (
    <div 
      className="premium-shops-slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={sliderRef}
    >
      <div className="premium-shops-slider__header">
        <h2 className="premium-shops-slider__title">
          🌟 Рекомендуемые магазины
        </h2>
        <span className="premium-shops-slider__badge">Реклама</span>
      </div>
      
      <div className="premium-shops-slider__container">
        <div 
          className="premium-shops-slider__track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {premiumShops.map((shop, index) => (
            <div key={shop.id} className="premium-shops-slider__slide">
              <Link
                to={`/shop/${shop.id}`}
                className="premium-shop-card"
                onClick={() => handleSlideClick(shop.id, index)}
              >
                <div className="premium-shop-card__image">
                  {shop.logo ? (
                    <img src={shop.logo} alt={shop.name} />
                  ) : (
                    <div className="premium-shop-card__placeholder">
                      {shop.name.charAt(0)}
                    </div>
                  )}
                  {shop.adType === 'new' && (
                    <span className="premium-shop-card__label premium-shop-card__label--new">
                      Новый
                    </span>
                  )}
                  {shop.adType === 'special' && (
                    <span className="premium-shop-card__label premium-shop-card__label--special">
                      Акция
                    </span>
                  )}
                </div>
                
                <div className="premium-shop-card__content">
                  <h3 className="premium-shop-card__name">{shop.name}</h3>
                  
                  <div className="premium-shop-card__info">
                    <div className="premium-shop-card__rating">
                      ⭐ {shop.rating} ({shop.reviewsCount})
                    </div>
                    <div className="premium-shop-card__distance">
                      📍 {shop.distance.toFixed(1)} км
                    </div>
                  </div>
                  
                  <p className="premium-shop-card__description">
                    {shop.description}
                  </p>
                  
                  <div className="premium-shop-card__features">
                    {shop.deliveryOptions.shopDelivery && (
                      <span className="premium-shop-card__feature">
                        🚚 Своя доставка
                      </span>
                    )}
                    {shop.deliveryOptions.selfPickup && (
                      <span className="premium-shop-card__feature">
                        🏪 Самовывоз
                      </span>
                    )}
                    {shop.minOrderAmount < 10 && (
                      <span className="premium-shop-card__feature">
                        💰 Без мин. суммы
                      </span>
                    )}
                  </div>
                  
                  <div className="premium-shop-card__footer">
                    <div className="premium-shop-card__delivery">
                      <span className="premium-shop-card__delivery-time">
                        ⏱️ {shop.estimatedDeliveryTime}
                      </span>
                      <span className="premium-shop-card__delivery-fee">
                        Доставка от €{shop.deliveryFee}
                      </span>
                    </div>
                    
                    {shop.isOpen ? (
                      <span className="premium-shop-card__status premium-shop-card__status--open">
                        Открыто
                      </span>
                    ) : (
                      <span className="premium-shop-card__status premium-shop-card__status--closed">
                        Закрыто до {shop.workingHours.open}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        {/* Навигационные кнопки */}
        {premiumShops.length > 1 && (
          <>
            <button
              className="premium-shops-slider__nav premium-shops-slider__nav--prev"
              onClick={() => goToSlide(
                currentSlide === 0 ? premiumShops.length - 1 : currentSlide - 1
              )}
              aria-label="Previous slide"
            >
              ‹
            </button>
            
            <button
              className="premium-shops-slider__nav premium-shops-slider__nav--next"
              onClick={() => goToSlide(
                (currentSlide + 1) % premiumShops.length
              )}
              aria-label="Next slide"
            >
              ›
            </button>
          </>
        )}
      </div>
      
      {/* Индикаторы */}
      {premiumShops.length > 1 && (
        <div className="premium-shops-slider__indicators">
          {premiumShops.map((_, index) => (
            <button
              key={index}
              className={`premium-shops-slider__indicator ${
                index === currentSlide ? 'premium-shops-slider__indicator--active' : ''
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PremiumShopsSlider