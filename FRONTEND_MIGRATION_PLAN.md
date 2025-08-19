# OnLimitShop Frontend Migration Plan
## От каталога товаров к геолокационному маркетплейсу

### 📊 Оценка масштаба изменений

#### Компоненты требующие полной переработки (🔴 Критично)
- **60%** всех компонентов затронуты
- **18 из 18** Redux слайсов требуют модификации
- **9 из 9** API модулей нуждаются в обновлении

### 🚀 Фазы миграции

## ФАЗА 1: Критическая инфраструктура (1-2 недели)

### 1.1 Геолокация и поиск магазинов

#### Новые Redux слайсы:
```typescript
// src/store/slices/locationSlice.ts
interface LocationState {
  userLocation: {
    lat: number
    lng: number
    address?: string
  } | null
  searchRadius: 2 | 5 | 10 | 15 | 20
  availableShops: Shop[]
  loadingShops: boolean
}

// src/store/slices/multiCartSlice.ts
interface MultiCartState {
  carts: {
    [shopId: string]: {
      items: CartItem[]
      total: number
      shopInfo: ShopBasicInfo
    }
  }
  activeCartId: string | null
}

// src/store/slices/shoppingListSlice.ts
interface ShoppingListState {
  items: ShoppingListItem[]
  matchedShops: {
    shopId: string
    matchPercentage: number
    availableItems: string[]
    missingItems: string[]
    totalPrice: number
  }[]
}

// src/store/slices/deliverySlice.ts
interface DeliveryState {
  deliveryOptions: {
    shopDelivery: boolean        // Доставка продавцом
    thirdPartyDelivery: boolean  // Сторонняя доставка
    courierDelivery: boolean     // Частный курьер
    selfPickup: boolean          // Самовывоз
    marketplaceDelivery: boolean // Собственная доставка маркетплейса
  }
  selectedOption: DeliveryType | null
  deliveryAddress: Address | null
  pickupPoint: PickupPoint | null
  deliveryTime: DeliveryTimeSlot | null
  deliveryCost: number
}
```

#### Новые компоненты:
1. **LocationPicker** (`src/components/Location/LocationPicker.tsx`)
   - Автоопределение геолокации
   - Ручной ввод адреса
   - Выбор на карте
   - Сохранение избранных адресов

2. **RadiusSelector** (`src/components/Location/RadiusSelector.tsx`)
   - Визуальный выбор радиуса поиска
   - Показ количества магазинов в каждом радиусе

3. **ShopsMap** (`src/components/Shops/ShopsMap.tsx`)
   - Интерактивная карта с магазинами
   - Кластеризация при большом количестве
   - Информация о магазине при клике

4. **DeliveryOptionsSelector** (`src/components/Delivery/DeliveryOptionsSelector.tsx`)
   - Выбор типа доставки (5 вариантов)
   - Расчет стоимости для каждого варианта
   - Выбор времени доставки/самовывоза

#### Изменения в существующих компонентах:

**Header.tsx** - Изменения:
- Добавить индикатор текущего местоположения
- Кнопка смены адреса доставки
- Убрать ссылку на "Все товары"

**Home.tsx** - Полная переработка:
```typescript
// Старая структура:
- Баннеры
- Категории товаров
- Популярные товары
- Акции

// Новая структура:
- Выбор местоположения (если не выбрано)
- Магазины в радиусе 2км (приоритет)
- Кнопка "Создать список покупок"
- Активные корзины (если есть)
- Рекомендованные магазины
```

### 1.2 Новые API endpoints

```typescript
// src/api/geolocationApi.ts
export const geolocationApi = {
  // Поиск магазинов по радиусу
  getNearbyShops: (lat: number, lng: number, radius: number) => 
    GET `/api/shops/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
  
  // Проверка доступности магазина для адреса
  checkShopAvailability: (shopId: string, lat: number, lng: number) =>
    GET `/api/shops/${shopId}/availability?lat=${lat}&lng=${lng}`,
  
  // Получение опций доставки для магазина
  getDeliveryOptions: (shopId: string, addressId: string) =>
    GET `/api/shops/${shopId}/delivery-options?addressId=${addressId}`
}

// src/api/shoppingListApi.ts
export const shoppingListApi = {
  // Поиск магазинов по списку покупок
  matchShoppingList: (items: string[], location: Coordinates) =>
    POST `/api/shopping-list/match`,
  
  // Оптимизация списка по цене
  optimizeByPrice: (items: string[], location: Coordinates) =>
    POST `/api/shopping-list/optimize`
}

// src/api/multiCartApi.ts
export const multiCartApi = {
  // Получить все корзины пользователя
  getAllCarts: () => GET `/api/carts/all`,
  
  // Создать/обновить корзину для магазина
  updateShopCart: (shopId: string, items: CartItem[]) =>
    POST `/api/carts/${shopId}`,
  
  // Оформить заказ из конкретной корзины
  checkoutCart: (shopId: string, deliveryInfo: DeliveryInfo) =>
    POST `/api/carts/${shopId}/checkout`
}

// src/api/deliveryApi.ts
export const deliveryApi = {
  // Получить доступных курьеров в районе
  getAvailableCouriers: (shopId: string, addressId: string) =>
    GET `/api/delivery/couriers?shopId=${shopId}&addressId=${addressId}`,
  
  // Расчет стоимости доставки
  calculateDeliveryCost: (shopId: string, addressId: string, type: DeliveryType) =>
    POST `/api/delivery/calculate`,
  
  // Получить пункты самовывоза магазина
  getPickupPoints: (shopId: string) =>
    GET `/api/shops/${shopId}/pickup-points`
}
```

### 1.3 Новые страницы и роуты

```typescript
// src/constants/routes.ts
export const ROUTES = {
  // Существующие...
  
  // Новые роуты
  LOCATION_SETUP: '/location',
  SHOPS_NEARBY: '/shops-nearby',
  SHOPPING_LIST: '/shopping-list',
  MY_CARTS: '/my-carts',
  SHOP_PRODUCTS: '/shop/:shopId/products',
  DELIVERY_OPTIONS: '/delivery-options',
  PICKUP_POINTS: '/pickup-points/:shopId',
}
```

## ФАЗА 2: Основной функционал (2-3 недели)

### 2.1 Умный список покупок

**SmartShoppingList** (`src/modules/ShoppingList/SmartShoppingList.tsx`)
```typescript
interface SmartShoppingListProps {
  onShopSelected: (shopId: string, items: CartItem[]) => void
}

// Функционал:
- Добавление товаров в список (текст/голос/фото)
- Категоризация товаров
- Поиск магазинов с полным/частичным совпадением
- Сравнение цен между магазинами
- Визуализация экономии
```

**ShopMatcher** (`src/components/ShoppingList/ShopMatcher.tsx`)
- Показ процента совпадения
- Список доступных/недоступных товаров
- Общая стоимость в каждом магазине
- Рейтинг и отзывы магазина
- Время доставки

### 2.2 Управление множественными корзинами

**MultiCartManager** (`src/modules/Carts/MultiCartManager.tsx`)
```typescript
// Структура страницы:
- Табы с корзинами разных магазинов
- Сравнение корзин (цена, время доставки)
- Быстрое оформление выбранной корзины
- Объединение похожих товаров
```

**CartComparison** (`src/components/Carts/CartComparison.tsx`)
- Сравнительная таблица корзин
- Визуализация разницы в цене
- Рекомендации по оптимизации

### 2.3 Переработка страницы магазина

**Shop.tsx** - Изменения:
```typescript
// Добавить:
- Проверка доступности для текущего адреса
- Варианты доставки с ценами
- Пункты самовывоза на карте
- Активная корзина этого магазина (если есть)
- Уведомление о минимальной сумме заказа
```

## ФАЗА 3: Оптимизация UX (1-2 недели)

### 3.1 Улучшения навигации

**BottomNavigation** (мобильная версия):
```typescript
- Главная (магазины рядом)
- Список покупок
- Мои корзины (с счетчиком)
- Заказы
- Профиль
```

**QuickActions** (быстрые действия):
- Повторить последний заказ
- Открыть список покупок
- Найти ближайший магазин
- Сменить адрес

### 3.2 Уведомления и статусы

**Новые типы уведомлений**:
- Магазин стал доступен в вашем районе
- Товар из списка появился в ближайшем магазине
- Напоминание о неоформленной корзине
- Курьер принял заказ
- Заказ готов к самовывозу

### 3.3 Персонализация

**RecommendationEngine**:
- Магазины на основе истории заказов
- Товары-заменители при отсутствии
- Оптимальное время для заказа
- Групповые закупки с соседями

## 📋 Чек-лист миграции по компонентам

### Компоненты для удаления:
- [ ] `ProductList.tsx` - заменяется на ShopProducts
- [ ] `AllProducts.tsx` - больше не нужен
- [ ] `ProductSearch.tsx` - заменяется на ShopSearch
- [ ] `SingleCart.tsx` - заменяется на MultiCart

### Компоненты для модификации:

#### Критические (🔴):
- [ ] `Home.tsx` - полная переработка
- [ ] `Header.tsx` - добавить геолокацию
- [ ] `Cart.tsx` → `MultiCart.tsx`
- [ ] `Checkout.tsx` - множественные опции доставки
- [ ] `Shop.tsx` - проверка доступности

#### Важные (🟡):
- [ ] `Categories.tsx` - фильтр по магазинам
- [ ] `Search.tsx` - поиск по магазинам
- [ ] `OrderHistory.tsx` - группировка по магазинам
- [ ] `UserProfile.tsx` - управление адресами

#### Второстепенные (🟢):
- [ ] `Footer.tsx` - обновить ссылки
- [ ] `Sidebar.tsx` - новая навигация
- [ ] `NotificationProvider.tsx` - новые типы

### Новые компоненты:

#### Фаза 1:
- [ ] `LocationPicker.tsx`
- [ ] `RadiusSelector.tsx`
- [ ] `ShopsMap.tsx`
- [ ] `NearbyShops.tsx`
- [ ] `DeliveryOptionsSelector.tsx`

#### Фаза 2:
- [ ] `SmartShoppingList.tsx`
- [ ] `ShopMatcher.tsx`
- [ ] `MultiCartManager.tsx`
- [ ] `CartComparison.tsx`
- [ ] `PickupPointSelector.tsx`

#### Фаза 3:
- [ ] `QuickActions.tsx`
- [ ] `LocationBadge.tsx`
- [ ] `ShopRecommendations.tsx`
- [ ] `GroupOrder.tsx`

## 🔄 Redux Store изменения

### Модифицировать слайсы:
```typescript
// cartSlice.ts → multiCartSlice.ts
- Поддержка множественных корзин
- Связь корзины с магазином
- Валидация минимальной суммы

// productsSlice.ts → shopProductsSlice.ts
- Продукты привязаны к магазину
- Проверка наличия в конкретном магазине

// vendorsSlice.ts → shopsSlice.ts
- Добавить геолокационные данные
- Статус доступности для адреса
- Опции доставки

// ordersSlice.ts
- Связь заказа с магазином
- Тип доставки
- Статус доставки/самовывоза
```

### Новые слайсы:
```typescript
- locationSlice.ts
- deliverySlice.ts
- shoppingListSlice.ts
- courierSlice.ts
- pickupSlice.ts
```

## 📊 Метрики успеха миграции

### Технические метрики:
- [ ] Все тесты проходят
- [ ] Нет критических ошибок в консоли
- [ ] Производительность не упала > 10%
- [ ] Покрытие тестами > 70%

### Бизнес-метрики:
- [ ] Пользователь может найти магазины в радиусе
- [ ] Создание списка покупок работает
- [ ] Множественные корзины функционируют
- [ ] Все 5 типов доставки доступны
- [ ] Самовывоз оформляется корректно

### UX метрики:
- [ ] Время до первого заказа < 5 минут
- [ ] Понятность интерфейса (тестирование)
- [ ] Мобильная адаптация работает

## 🚨 Риски и митигация

### Риск 1: Сложность миграции данных
**Митигация**: Поэтапная миграция с fallback на старую логику

### Риск 2: Производительность при большом количестве магазинов
**Митигация**: Кластеризация на карте, пагинация, кеширование

### Риск 3: Путаница пользователей с новым интерфейсом
**Митигация**: Онбординг, подсказки, видео-туториалы

### Риск 4: Интеграция с множеством служб доставки
**Митигация**: Единый API-gateway для унификации

## 📅 Timeline

### Неделя 1-2: Фаза 1 (Критическая инфраструктура)
- Геолокация
- Базовый поиск магазинов
- Множественные корзины

### Неделя 3-4: Фаза 2 (Основной функционал)
- Умный список покупок
- Опции доставки
- Самовывоз

### Неделя 5: Фаза 3 (UX оптимизация)
- Улучшения интерфейса
- Уведомления
- Персонализация

### Неделя 6: Тестирование и исправления
- E2E тестирование
- Исправление багов
- Оптимизация производительности

## 🎯 Приоритеты для MVP

### Must Have:
1. Геолокация и поиск магазинов ✅
2. Множественные корзины ✅
3. Базовая доставка (хотя бы 2 типа) ✅
4. Самовывоз ✅

### Should Have:
1. Умный список покупок
2. Все 5 типов доставки
3. Сравнение корзин

### Nice to Have:
1. Групповые заказы
2. Предиктивные рекомендации
3. Голосовой ввод списка

---

## Итоговая оценка

**Общий объем работы**: 5-6 недель для команды из 2-3 разработчиков

**Критический путь**: Геолокация → Множественные корзины → Доставка

**Зависимости от бэкенда**: Все новые API должны быть готовы к началу Фазы 1

**Рекомендация**: Начать с создания новых компонентов параллельно с доработкой бэкенда, используя моки для разработки.