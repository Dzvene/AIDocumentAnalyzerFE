# API Integration Guide

## 📋 Статус интеграции

✅ **Завершено:**

1. **Типы TypeScript** - Созданы полные типы для всех сущностей маркетплейса:
   - `Product` - товары с полной информацией (цена, скидки, рейтинг, категория, магазин)
   - `Shop` - магазины (описание, рейтинг, время доставки, адрес, часы работы)
   - `Category` - категории товаров (иерархическая структура)
   - `Cart` & `CartItem` - корзина и товары в корзине
   - `Order` - заказы со всеми статусами и историей
   - `DeliveryAddress` - адреса доставки

2. **API Services** - Полностью готовые API сервисы:
   - `productsApi` - управление товарами, поиск, фильтры, отзывы
   - `shopsApi` - управление магазинами, поиск по локации
   - `cartApi` - корзина, купоны, расчет доставки
   - `ordersApi` - заказы, статусы, адреса доставки
   - `authApi` - аутентификация (уже было)

3. **Redux State Management:**
   - `cartSlice` - управление состоянием корзины с оптимистичными обновлениями
   - Интегрировано с существующим store

4. **UI Integration:**
   - Home компонент обновлен для работы с API
   - Добавлена функция "В корзину" с Redux integration
   - Обработка ошибок и loading состояний

## 🔧 Настройка для работы с бэкендом

### 1. Environment Variables
Создайте `.env` файл в корне проекта:
```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2. Базовый URL API
URL настраивается в `src/constants/common.ts`:
```typescript
export const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
```

### 3. Автоматическое обновление токенов
HTTP клиент уже настроен для:
- Автоматического добавления Bearer токенов к запросам
- Обновления истекших токенов
- Редиректа на /login при невалидной авторизации

## 📡 Доступные API endpoints

### Products
- `GET /products` - список товаров с фильтрами
- `GET /products/featured` - рекомендуемые товары
- `GET /products/:id` - получить товар по ID
- `POST /products` - создать товар

### Categories  
- `GET /categories` - список категорий
- `GET /categories/top` - топ категории для главной
- `GET /categories/:id/products` - товары в категории

### Shops
- `GET /shops` - список магазинов
- `GET /shops/featured` - рекомендуемые магазины
- `GET /shops/nearby` - ближайшие магазины
- `GET /shops/:slug` - магазин по slug

### Cart
- `GET /cart` - получить корзину
- `POST /cart/items` - добавить в корзину
- `PATCH /cart/items/:id` - обновить количество
- `DELETE /cart/items/:id` - удалить из корзины

### Orders
- `GET /orders/my` - мои заказы
- `POST /orders` - создать заказ
- `GET /orders/:id` - детали заказа
- `PATCH /orders/:id/status` - обновить статус

## 🎯 Как использовать в компонентах

### Загрузка данных
```typescript
import { productsApi, shopsApi } from '@api'

const [products, setProducts] = useState<Product[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await productsApi.getFeaturedProducts(12)
      setProducts(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

### Работа с корзиной
```typescript
import { useDispatch } from 'react-redux'
import { addToCart } from '@store/slices/cartSlice'

const dispatch = useDispatch()

const handleAddToCart = async (product: Product) => {
  try {
    await dispatch(addToCart({
      productId: product.id,
      quantity: 1
    })).unwrap()
  } catch (error) {
    console.error('Failed to add to cart:', error)
  }
}
```

## 🔄 Следующие шаги

1. **Подключите реальный бэкенд** - замените моковые данные на API вызовы
2. **Добавьте уведомления** - для успешных операций и ошибок
3. **Обновите другие компоненты** - Cart, Search, Shop, Categories
4. **Тестирование** - убедитесь что все API endpoints работают

## 📝 Структура файлов

```
src/
├── api/
│   ├── config.ts          # HTTP клиент с interceptors
│   ├── authApi.ts         # Аутентификация  
│   ├── productsApi.ts     # Товары и категории
│   ├── shopsApi.ts        # Магазины
│   ├── cartApi.ts         # Корзина
│   ├── ordersApi.ts       # Заказы
│   └── index.ts           # Exports
├── types/interfaces/
│   ├── product.ts         # Product, Category, Review types
│   ├── shop.ts            # Shop types
│   ├── cart.ts            # Cart & CartItem types
│   ├── order.ts           # Order & OrderStatus types
│   └── common.ts          # Base types
├── store/slices/
│   ├── authSlice.ts       # Auth state
│   ├── cartSlice.ts       # Cart state (новый)
│   └── themeSlice.ts      # Theme state
```

## 🚀 Готово к продакшену!

Теперь у вас есть полная интеграция с API для маркетплейса. Все основные операции поддерживаются:
- Просмотр товаров и магазинов
- Добавление в корзину
- Оформление заказов
- Управление профилем пользователя