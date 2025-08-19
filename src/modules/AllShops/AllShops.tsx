import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ROUTES } from '@constants/routes'
import { vendorsApi } from '@api/vendorsApi'
import { categoriesApi } from '@api/categoriesApi'
import { addressesApi } from '@api/addressesApi'
import { VendorDto, VendorSearchParams } from '@types/dto/vendor.dto'
import { CategoryDto } from '@types/dto/category.dto'
import { RootState } from '@store/store'
import { setUserLocation, setSearchRadius } from '@store/slices/locationSlice'
import { fetchUserAddresses, setSelectedAddress } from '@store/slices/addressesSlice'
import './AllShops.scss'

export const AllShops: React.FC = () => {
  const dispatch = useDispatch()
  const { userLocation, searchRadius } = useSelector((state: RootState) => state.location)
  const { addresses, defaultAddress, selectedAddress, loading: addressesLoading } = useSelector((state: RootState) => state.addresses)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  
  // Отладка
  console.log('AllShops Debug:', {
    isAuthenticated,
    user,
    addresses,
    selectedAddress,
    addressesLoading
  })
  
  const [shops, setShops] = useState<VendorDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSort, setSelectedSort] = useState<'rating' | 'distance' | 'deliveryTime' | 'popularity'>('rating')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [showAddressSelector, setShowAddressSelector] = useState(false)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: '',
    address1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Germany'
  })
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  
  const [filters, setFilters] = useState({
    freeDelivery: false,
    isPremium: false,
    isVerified: false,
    openNow: false,
    minRating: 0,
    deliveryType: '' as keyof VendorDto['deliveryOptions'] | ''
  })

  // Радиусы поиска из геолокационной модели
  const radiusOptions = [2, 5, 10, 15, 20] as const
  
  // Предустановленные города
  const cities = [
    // Германия
    { name: 'Берлин', lat: 52.5200, lng: 13.4050 },
    { name: 'Мюнхен', lat: 48.1351, lng: 11.5820 },
    { name: 'Франкфурт', lat: 50.1109, lng: 8.6821 },
    { name: 'Гамбург', lat: 53.5511, lng: 9.9937 },
    { name: 'Кёльн', lat: 50.9375, lng: 6.9603 },
    { name: 'Штутгарт', lat: 48.7758, lng: 9.1829 },
    { name: 'Дюссельдорф', lat: 51.2277, lng: 6.7735 },
    { name: 'Фрайбург', lat: 47.9990, lng: 7.8421 },
    // СНГ
    { name: 'Ташкент', lat: 41.2995, lng: 69.2401 },
    { name: 'Москва', lat: 55.7558, lng: 37.6173 },
    { name: 'Санкт-Петербург', lat: 59.9311, lng: 30.3609 },
    { name: 'Алматы', lat: 43.2220, lng: 76.8512 },
  ]
  
  // Получение геолокации пользователя
  const requestUserLocation = useCallback(() => {
    setLocationLoading(true)
    setLocationError(null)
    
    if (!navigator.geolocation) {
      setLocationError('Ваш браузер не поддерживает геолокацию')
      setLocationLoading(false)
      // Предлагаем выбрать город вручную
      setShowLocationSelector(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          dispatch(setUserLocation({
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }))
          
          // Пытаемся получить адрес по координатам
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&accept-language=ru&zoom=10`,
              { headers: { 'User-Agent': 'OnLimitShop' } }
            )
            if (response.ok) {
              const data = await response.json()
              
              // Извлекаем только город и страну
              const city = data.address?.city || 
                          data.address?.town || 
                          data.address?.village || 
                          data.address?.municipality ||
                          data.address?.state ||
                          'Неизвестный город'
              const country = data.address?.country || ''
              
              // Формируем короткий адрес
              const shortAddress = country && city !== country ? 
                `${city}, ${country}` : 
                city
              
              // Сохраняем короткий адрес
              dispatch(setUserLocation({
                coordinates: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                },
                address: shortAddress
              }))
            }
          } catch (err) {
            console.log('Не удалось получить адрес:', err)
          }
          
          setLocationLoading(false)
        } catch (err) {
          setLocationError('Ошибка при обработке геолокации')
          setLocationLoading(false)
        }
      },
      (error) => {
        setLocationLoading(false)
        
        let errorMessage = 'Не удалось определить местоположение'
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Доступ к геолокации заблокирован. Разрешите доступ в настройках браузера'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Информация о местоположении недоступна'
            break
          case error.TIMEOUT:
            errorMessage = 'Превышено время ожидания определения местоположения'
            break
        }
        
        setLocationError(errorMessage)
        
        // Используем дефолтные координаты Ташкента
        dispatch(setUserLocation({
          coordinates: {
            latitude: 41.2995,
            longitude: 69.2401
          },
          address: 'Ташкент (по умолчанию)'
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [dispatch])

  // Загрузка магазинов
  const loadShops = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Определяем координаты для поиска
      let searchCoordinates = null
      
      if (isAuthenticated && selectedAddress) {
        // Используем выбранный адрес
        searchCoordinates = {
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude
        }
      } else if (userLocation?.coordinates) {
        // Используем геолокацию для неавторизованных
        searchCoordinates = userLocation.coordinates
      }
      
      const params: VendorSearchParams = {
        latitude: searchCoordinates?.latitude,
        longitude: searchCoordinates?.longitude,
        radius: searchRadius,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        isVerified: filters.isVerified || undefined,
        isPremium: filters.isPremium || undefined,
        minRating: filters.minRating || undefined,
        deliveryType: filters.deliveryType || undefined,
        searchTerm: searchQuery || undefined,
        page: currentPage,
        pageSize: 12,
        sortBy: selectedSort,
        sortDirection: 'desc'
      }

      // Если есть координаты, используем поиск по радиусу
      let response
      if (searchCoordinates) {
        response = await vendorsApi.searchNearbyVendors({
          latitude: searchCoordinates.latitude,
          longitude: searchCoordinates.longitude,
          radius: searchRadius,
          category: params.category,
          deliveryType: params.deliveryType,
          minRating: params.minRating,
          isPremium: params.isPremium
        })
      } else {
        // Иначе загружаем все магазины
        response = await vendorsApi.getVendors(params)
      }

      if (response.success && response.data) {
        setShops(response.data.vendors || [])
        setTotalCount(response.data.totalCount || 0)
        setTotalPages(Math.ceil((response.data.totalCount || 0) / 12))
      }
    } catch (err: any) {
      console.error('Ошибка загрузки магазинов:', err)
      setShops([])
      setTotalCount(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, selectedAddress, userLocation, searchRadius, selectedCategory, filters, searchQuery, currentPage, selectedSort])


  // Загрузка категорий с бекенда
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true)
    try {
      const response = await categoriesApi.getPopularCategories(20, 'year')
      if (response && Array.isArray(response)) {
        setCategories(response)
      }
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err)
      // Используем fallback категории если не удалось загрузить с бекенда
      setCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  // Инициализация
  useEffect(() => {
    // Загружаем адреса пользователя если авторизован
    if (isAuthenticated && user) {
      dispatch(fetchUserAddresses())
    } else if (!userLocation) {
      // Для неавторизованных используем геолокацию
      requestUserLocation()
    }
    loadCategories()
  }, [isAuthenticated, user, dispatch, requestUserLocation, loadCategories])

  // Загрузка магазинов при изменении параметров
  useEffect(() => {
    if ((isAuthenticated && selectedAddress) || userLocation || !navigator.geolocation) {
      loadShops()
    }
  }, [isAuthenticated, selectedAddress, userLocation, loadShops])

  // Преобразуем категории из бекенда в формат для отображения
  const displayCategories = [
    { value: 'all', label: 'Все магазины', icon: '🏪' },
    ...categories.map(cat => ({
      value: cat.slug || cat.id,
      label: cat.name,
      icon: cat.icon || getCategoryIcon(cat.slug || cat.name)
    }))
  ]

  // Вспомогательная функция для получения иконки категории
  const getCategoryIcon = (categorySlug: string): string => {
    const iconMap: Record<string, string> = {
      'products': '🛒',
      'bakery': '🥖',
      'meat': '🥩',
      'fish': '🐟',
      'dairy': '🥛',
      'vegetables': '🥗',
      'fruits': '🍎',
      'sweets': '🍰',
      'beverages': '🥤',
      'healthy': '🥑',
      'frozen': '🧊',
      'household': '🧹',
      'baby': '👶',
      'pets': '🐾'
    }
    return iconMap[categorySlug.toLowerCase()] || '📦'
  }

  const deliveryTypes = [
    { value: 'ownDelivery', label: 'Собственная доставка' },
    { value: 'thirdPartyDelivery', label: 'Сторонняя доставка' },
    { value: 'courierDelivery', label: 'Курьерская доставка' },
    { value: 'selfPickup', label: 'Самовывоз' },
    { value: 'marketplaceDelivery', label: 'Доставка маркетплейса' }
  ]

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
    setCurrentPage(1) // Сброс на первую страницу при изменении фильтров
  }

  const handleRadiusChange = (radius: typeof radiusOptions[number]) => {
    dispatch(setSearchRadius(radius))
    setCurrentPage(1)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadShops()
  }
  
  const selectCity = (city: typeof cities[0]) => {
    dispatch(setUserLocation({
      coordinates: {
        latitude: city.lat,
        longitude: city.lng
      },
      address: city.name
    }))
    setShowLocationSelector(false)
    setLocationError(null)
  }

  // Проверка, открыт ли магазин сейчас
  const isShopOpen = (businessHours: VendorDto['businessHours']) => {
    if (!businessHours) return true // Если нет данных о часах работы, считаем открытым
    
    const now = new Date()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = dayNames[now.getDay()]
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const todayHours = businessHours[currentDay]
    if (!todayHours || todayHours.isClosed) return false
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close
  }

  // Фильтрация магазинов
  const filteredShops = shops.filter(shop => {
    const matchesFreeDelivery = !filters.freeDelivery || shop.deliveryFee === 0
    const matchesPremium = !filters.isPremium || shop.isPremium
    const matchesVerified = !filters.isVerified || shop.isVerified
    const matchesOpenNow = !filters.openNow || isShopOpen(shop.businessHours)
    const matchesDeliveryType = !filters.deliveryType || shop.deliveryOptions[filters.deliveryType]
    
    return matchesFreeDelivery && matchesPremium && matchesVerified && matchesOpenNow && matchesDeliveryType
  })

  // Расчет расстояния (простая формула для демонстрации)
  const calculateDistance = (shop: VendorDto): number => {
    if (!userLocation?.coordinates || !shop.address.latitude || !shop.address.longitude) {
      return 0
    }
    
    const R = 6371 // Радиус Земли в км
    const dLat = (shop.address.latitude - userLocation.coordinates.latitude) * Math.PI / 180
    const dLon = (shop.address.longitude - userLocation.coordinates.longitude) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.coordinates.latitude * Math.PI / 180) * 
              Math.cos(shop.address.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  return (
    <div className="all-shops-page">
      <div className="shops-hero">
        <div className="container">
          <h1 className="shops-hero__title">Магазины в вашем районе</h1>
          <div className="shops-hero__location">
            {/* Для авторизованных пользователей показываем выбор адреса */}
            {isAuthenticated ? (
              <div className="address-selector-container">
                {addressesLoading ? (
                  <p className="shops-hero__subtitle">
                    <span className="spinner-small"></span>
                    Загружаем ваши адреса...
                  </p>
                ) : addresses.length > 0 ? (
                  <div className="address-selector">
                    <p className="shops-hero__subtitle">
                      📍 Доставка на адрес:
                    </p>
                    <div className="address-selector__main">
                      <button 
                        className="current-address-btn"
                        onClick={() => setShowAddressSelector(!showAddressSelector)}
                      >
                        {selectedAddress ? (
                          <>
                            <span className="address-label">
                              {selectedAddress.label || selectedAddress.type}
                            </span>
                            <span className="address-text">
                              {selectedAddress.fullAddress || `${selectedAddress.address1}, ${selectedAddress.city}`}
                            </span>
                          </>
                        ) : (
                          <span>Выберите адрес доставки</span>
                        )}
                        <span className="dropdown-arrow">▼</span>
                      </button>
                      
                      {showAddressSelector && (
                        <div className="address-dropdown">
                          {addresses.map(addr => (
                            <button
                              key={addr.id}
                              className={`address-option ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                              onClick={() => {
                                dispatch(setSelectedAddress(addr))
                                setShowAddressSelector(false)
                              }}
                            >
                              <div className="address-option__label">
                                {addr.label || addr.type}
                                {addr.isDefault && <span className="default-badge">По умолчанию</span>}
                              </div>
                              <div className="address-option__text">
                                {addr.fullAddress || `${addr.address1}, ${addr.city}`}
                              </div>
                            </button>
                          ))}
                          
                          {addresses.length < addressesApi.MAX_ADDRESSES && (
                            <button
                              className="address-option address-option--add"
                              onClick={() => {
                                setShowAddressSelector(false)
                                setShowNewAddressForm(true)
                              }}
                            >
                              <span className="add-icon">+</span>
                              Добавить новый адрес
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="radius-info">
                      Радиус поиска: {searchRadius} км
                    </div>
                  </div>
                ) : (
                  <div className="no-addresses">
                    <p className="shops-hero__subtitle">
                      У вас пока нет сохраненных адресов
                    </p>
                    <button
                      className="add-first-address-btn"
                      onClick={() => setShowNewAddressForm(true)}
                    >
                      + Добавить адрес доставки
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Для неавторизованных используем геолокацию */
              <>
            {locationLoading ? (
              <p className="shops-hero__subtitle">
                <span className="spinner-small"></span>
                Определяем ваше местоположение...
              </p>
            ) : locationError ? (
              <div className="location-error">
                <p className="error-message">⚠️ {locationError}</p>
                <button 
                  className="retry-location-btn"
                  onClick={requestUserLocation}
                >
                  🔄 Попробовать снова
                </button>
              </div>
            ) : userLocation?.address ? (
              <div>
                <p className="shops-hero__subtitle">
                  📍 {userLocation.address} • Радиус поиска: {searchRadius} км
                  <button 
                    className="update-location-btn"
                    onClick={requestUserLocation}
                    title="Обновить местоположение"
                  >
                    🔄
                  </button>
                </p>
                <button 
                  className="change-city-btn"
                  onClick={() => setShowLocationSelector(!showLocationSelector)}
                >
                  Выбрать другой город
                </button>
              </div>
            ) : (
              <div className="location-request">
                <p className="shops-hero__subtitle">
                  Для показа ближайших магазинов нужен доступ к геолокации
                </p>
                <button 
                  className="enable-location-btn"
                  onClick={requestUserLocation}
                >
                  📍 Разрешить доступ к местоположению
                </button>
              </div>
            )}
              </>
            )}
          </div>
          
          {/* Форма добавления нового адреса */}
          {showNewAddressForm && (
            <div className="new-address-form">
              <div className="form-container">
                <h3>Добавить новый адрес</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowNewAddressForm(false)}
                >
                  ✕
                </button>
                
                <div className="form-group">
                  <label>Название адреса</label>
                  <input
                    type="text"
                    placeholder="Например: Дом, Офис, Родители"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Улица и номер дома</label>
                  <input
                    type="text"
                    placeholder="Например: Hauptstraße 123"
                    value={newAddress.address1}
                    onChange={(e) => setNewAddress({...newAddress, address1: e.target.value})}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Город</label>
                    <input
                      type="text"
                      placeholder="Например: Berlin"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Почтовый индекс</label>
                    <input
                      type="text"
                      placeholder="12345"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Регион</label>
                    <input
                      type="text"
                      placeholder="Например: Brandenburg"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Страна</label>
                    <select
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                    >
                      <option value="Germany">Германия</option>
                      <option value="Russia">Россия</option>
                      <option value="Uzbekistan">Узбекистан</option>
                      <option value="Kazakhstan">Казахстан</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setShowNewAddressForm(false)}
                  >
                    Отмена
                  </button>
                  <button
                    className="save-btn"
                    onClick={async () => {
                      try {
                        // Проверяем максимальное количество адресов
                        if (addresses.length >= addressesApi.MAX_ADDRESSES) {
                          alert(`Вы можете сохранить максимум ${addressesApi.MAX_ADDRESSES} адресов`)
                          return
                        }
                        
                        // Получаем координаты для адреса через геокодинг
                        let coordinates = { latitude: 0, longitude: 0 }
                        try {
                          const geocodeQuery = `${newAddress.address1}, ${newAddress.city}, ${newAddress.country}`
                          const response = await fetch(
                            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(geocodeQuery)}&format=json&limit=1`,
                            { headers: { 'User-Agent': 'OnLimitShop' } }
                          )
                          if (response.ok) {
                            const data = await response.json()
                            if (data[0]) {
                              coordinates = {
                                latitude: parseFloat(data[0].lat),
                                longitude: parseFloat(data[0].lon)
                              }
                            }
                          }
                        } catch (err) {
                          console.log('Не удалось получить координаты адреса')
                        }
                        
                        // Создаем новый адрес
                        const savedAddress = await addressesApi.createAddress({
                          type: 'other',
                          label: newAddress.label || 'Новый адрес',
                          firstName: user?.firstName || '',
                          lastName: user?.lastName || '',
                          address1: newAddress.address1,
                          city: newAddress.city,
                          state: newAddress.state || '',
                          postalCode: newAddress.postalCode,
                          country: newAddress.country,
                          isDefault: addresses.length === 0,
                          latitude: coordinates.latitude,
                          longitude: coordinates.longitude
                        })
                        
                        // Обновляем список адресов
                        dispatch(fetchUserAddresses())
                        
                        // Выбираем новый адрес как текущий
                        dispatch(setSelectedAddress(savedAddress))
                        
                        // Закрываем форму и сбрасываем поля
                        setShowNewAddressForm(false)
                        setNewAddress({
                          label: '',
                          address1: '',
                          city: '',
                          state: '',
                          postalCode: '',
                          country: 'Germany'
                        })
                      } catch (error) {
                        console.error('Ошибка при сохранении адреса:', error)
                        alert('Не удалось сохранить адрес. Попробуйте еще раз.')
                      }
                    }}
                  >
                    Сохранить адрес
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Селектор городов */}
          {showLocationSelector && (
            <div className="city-selector">
              <h3>Выберите ваш город:</h3>
              <div className="city-grid">
                {cities.map(city => (
                  <button
                    key={city.name}
                    className="city-btn"
                    onClick={() => selectCity(city)}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
              <button 
                className="city-btn city-btn--auto"
                onClick={() => {
                  requestUserLocation()
                  setShowLocationSelector(false)
                }}
              >
                🎯 Определить автоматически
              </button>
            </div>
          )}
          
          {/* Выбор радиуса поиска */}
          <div className="radius-selector">
            {radiusOptions.map(radius => (
              <button
                key={radius}
                className={`radius-btn ${searchRadius === radius ? 'active' : ''}`}
                onClick={() => handleRadiusChange(radius)}
              >
                {radius} км
              </button>
            ))}
          </div>

          <div className="shops-hero__search">
            <input
              type="text"
              placeholder="Поиск магазинов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>
              <span>🔍</span>
              Найти
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="shops-categories">
          {categoriesLoading ? (
            <div className="categories-loading">
              <span className="spinner-small"></span>
              <span>Загрузка категорий...</span>
            </div>
          ) : (
            displayCategories.map(category => (
              <button
                key={category.value}
                className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(category.value)
                  setCurrentPage(1)
                }}
              >
                <span className="icon">{category.icon}</span>
                <span className="label">{category.label}</span>
              </button>
            ))
          )}
        </div>

        <div className="shops-content">
          <aside className="shops-sidebar">
            <div className="sidebar-section">
              <h3>Сортировка</h3>
              <select 
                value={selectedSort} 
                onChange={(e) => setSelectedSort(e.target.value as typeof selectedSort)}
                className="sort-select"
              >
                <option value="rating">По рейтингу</option>
                <option value="distance">По расстоянию</option>
                <option value="deliveryTime">По времени доставки</option>
                <option value="popularity">По популярности</option>
              </select>
            </div>

            <div className="sidebar-section">
              <h3>Тип доставки</h3>
              <select 
                value={filters.deliveryType} 
                onChange={(e) => handleFilterChange('deliveryType', e.target.value)}
                className="sort-select"
              >
                <option value="">Все типы</option>
                {deliveryTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sidebar-section">
              <h3>Фильтры</h3>
              <div className="filter-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.freeDelivery}
                    onChange={(e) => handleFilterChange('freeDelivery', e.target.checked)}
                  />
                  <span>Бесплатная доставка</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.isPremium}
                    onChange={(e) => handleFilterChange('isPremium', e.target.checked)}
                  />
                  <span>Премиум магазины</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.isVerified}
                    onChange={(e) => handleFilterChange('isVerified', e.target.checked)}
                  />
                  <span>Проверенные</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.openNow}
                    onChange={(e) => handleFilterChange('openNow', e.target.checked)}
                  />
                  <span>Открыто сейчас</span>
                </label>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Минимальный рейтинг</h3>
              <div className="rating-filter">
                {[0, 3, 3.5, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    className={`rating-btn ${filters.minRating === rating ? 'active' : ''}`}
                    onClick={() => handleFilterChange('minRating', rating)}
                  >
                    {rating === 0 ? 'Все' : `${rating}+`} ⭐
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="shops-main">
            <div className="shops-header">
              <p className="results-count">
                Найдено магазинов: <strong>{filteredShops.length}</strong> из {totalCount}
                {userLocation && <span> в радиусе {searchRadius} км</span>}
              </p>
            </div>


            {loading ? (
              <div className="shops-loading">
                <div className="spinner"></div>
                <p>Загрузка магазинов...</p>
              </div>
            ) : (
              <div className="shops-grid">
                {filteredShops.map(shop => {
                  const distance = calculateDistance(shop)
                  return (
                    <div key={shop.id} className="shop-card">
                      <Link to={`/shop/${shop.id}`} className="shop-card__image">
                        <img src={shop.bannerUrl || 'https://via.placeholder.com/400x250'} alt={shop.businessName} />
                        {shop.isPremium && <span className="badge premium">Премиум</span>}
                        {shop.isVerified && <span className="badge verified">✓ Проверено</span>}
                        {shop.deliveryFee === 0 && <span className="badge free-delivery">Бесплатная доставка</span>}
                      </Link>
                      <div className="shop-card__content">
                        <div className="shop-header">
                          <h3>
                            <Link to={`/shop/${shop.id}`}>{shop.businessName}</Link>
                          </h3>
                          <div className="rating">
                            <span className="star">⭐</span>
                            <span className="value">{shop.rating || 0}</span>
                            <span className="count">({shop.totalReviews || 0})</span>
                          </div>
                        </div>
                        <p className="description">{shop.description}</p>
                        
                        {/* Типы доставки */}
                        <div className="delivery-types">
                          {shop.deliveryOptions.ownDelivery && <span className="delivery-badge">🚚 Своя доставка</span>}
                          {shop.deliveryOptions.selfPickup && <span className="delivery-badge">🏪 Самовывоз</span>}
                          {shop.deliveryOptions.courierDelivery && <span className="delivery-badge">🏃 Курьер</span>}
                        </div>

                        <div className="shop-info">
                          <div className="info-item">
                            <span className="icon">📍</span>
                            <span className="text">{shop.address.street}, {shop.address.city}</span>
                          </div>
                          {distance > 0 && (
                            <div className="info-item">
                              <span className="icon">📏</span>
                              <span className="text">{distance.toFixed(1)} км от вас</span>
                            </div>
                          )}
                          <div className="info-item">
                            <span className="icon">⚡</span>
                            <span className="text">Радиус доставки: {shop.deliveryRadius} км</span>
                          </div>
                        </div>
                        
                        <div className="shop-footer">
                          <div className="delivery-info">
                            <span className="delivery-time">🚚 {shop.averageDeliveryTime}</span>
                            <span className="min-order">от {(shop.minOrderAmount / 100).toFixed(0)} сум</span>
                            {shop.deliveryFee > 0 && (
                              <span className="delivery-fee">доставка {(shop.deliveryFee / 100).toFixed(0)} сум</span>
                            )}
                          </div>
                          <Link to={`/shop/${shop.id}`} className="shop-btn">
                            Перейти →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {filteredShops.length === 0 && !loading && (
              <div className="shops-empty">
                <span className="icon">🔍</span>
                <h3>Магазины не найдены</h3>
                <p>
                  {userLocation ? 
                    'Попробуйте увеличить радиус поиска или изменить фильтры' :
                    'Разрешите доступ к геолокации для поиска ближайших магазинов'
                  }
                </p>
                {!userLocation && (
                  <button 
                    className="enable-location-btn"
                    onClick={requestUserLocation}
                  >
                    📍 Разрешить доступ к местоположению
                  </button>
                )}
              </div>
            )}

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Назад
                </button>
                <span className="pagination-info">
                  Страница {currentPage} из {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Вперед →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}