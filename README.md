# AI Document Analyzer - Frontend

[![Build and Release](https://github.com/Dzvene/AIDocumentAnalyzerUI/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/Dzvene/AIDocumentAnalyzerUI/actions/workflows/build-and-release.yml)

Современный frontend для системы анализа документов с помощью AI, построенный на React + TypeScript с полной интеграцией API.

## Особенности

- 🛒 **Полноценный маркетплейс** - магазины, товары, корзина, заказы
- ⚡ **Vite** - быстрая сборка и разработка
- ⚛️ **React 18** - современная версия React с хуками
- 🟦 **TypeScript** - типизация для надежного кода
- 🎨 **SCSS** - мощные стили с переменными и миксинами
- 🔄 **Redux Toolkit** - современное управление состоянием
- 🗂️ **React Router** - роутинг для SPA
- 📱 **Адаптивный дизайн** - работает на всех устройствах
- 🌙 **Темная/светлая тема** - переключение тем
- 🔐 **JWT Аутентификация** - безопасная система авторизации
- 🔔 **Система уведомлений** - красивые toast-уведомления
- 🔍 **Поиск и фильтры** - продвинутый поиск товаров и магазинов
- 💳 **Интеграция платежей** - поддержка различных способов оплаты
- 📦 **Модульная архитектура** - легко расширяемая структура

## Технологический стек

### Основные технологии
- React 18.3.1
- TypeScript 5.6.3
- Redux Toolkit 2.8.2
- React Router DOM 6.4.1
- Axios 1.7.9

### Стили и UI
- SCSS
- CSS Custom Properties (переменные)
- Responsive Design
- CSS Grid и Flexbox

### Инструменты разработки
- ESLint
- Prettier
- Jest для тестирования
- Husky для pre-commit хуков

## Структура проекта

```
src/
├── api/                    # API клиенты и конфигурация
├── assets/                 # Статические ресурсы
│   ├── icons/
│   └── images/
├── components/             # Переиспользуемые компоненты
│   ├── Button/
│   ├── Layout/
│   ├── LoadingSpinner/
│   └── ProtectedRoute/
├── constants/              # Константы приложения
├── hooks/                  # Кастомные хуки
├── localization/           # Интернационализация
├── modules/                # Модули приложения (страницы)
│   ├── Dashboard/
│   └── Login/
├── providers/              # React контексты
├── services/               # Бизнес-логика
├── store/                  # Redux store
│   ├── slices/
│   └── thunks/
├── styles/                 # Глобальные стили
│   ├── base/
│   ├── mixins/
│   └── themes/
├── types/                  # TypeScript типы
│   ├── interfaces/
│   └── enums/
├── utils/                  # Утилиты
└── validators/             # Схемы валидации
```

## Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Настройка окружения

Скопируйте файл `.env.example` в `.env` и настройте переменные:

```bash
cp .env.example .env
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`

### Сборка для продакшена

```bash
npm run build
```

### Запуск тестов

```bash
npm run test
```

## Доступные скрипты

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка для продакшена
- `npm run preview` - предпросмотр продакшн сборки
- `npm run lint` - проверка и исправление кода с ESLint
- `npm run lint:check` - только проверка кода без исправлений
- `npm run format` - форматирование кода с Prettier
- `npm run format:check` - проверка форматирования без изменений
- `npm run test` - запуск тестов
- `npm run test:watch` - запуск тестов в режиме наблюдения

## Основные возможности

### Аутентификация

Система включает готовую аутентификацию с:
- Форма входа с валидацией
- JWT токены
- Автоматическое обновление токенов
- Защищенные роуты
- Управление состоянием пользователя

### Темы

Поддержка светлой и темной темы:
- Автоматическое определение системной темы
- Ручное переключение
- Сохранение выбора в localStorage
- CSS Custom Properties для легкой кастомизации

### Компоненты

Готовые компоненты с:
- TypeScript типизацией
- SCSS модулями
- Адаптивным дизайном
- Accessibility поддержкой

## API Интеграция

### Настройка Backend URL

Настройте базовый URL API в файле `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Доступные API endpoints

#### Продукты
- `GET /products` - список товаров с фильтрами
- `GET /products/featured` - рекомендуемые товары
- `GET /products/:id` - получить товар по ID
- `POST /products` - создать товар
- `GET /products/search` - поиск товаров

#### Категории  
- `GET /categories` - список категорий
- `GET /categories/top` - топ категории для главной
- `GET /categories/:id/products` - товары в категории

#### Магазины
- `GET /shops` - список магазинов
- `GET /shops/featured` - рекомендуемые магазины
- `GET /shops/nearby` - ближайшие магазины
- `GET /shops/:slug` - магазин по slug

#### Корзина
- `GET /cart` - получить корзину
- `POST /cart/items` - добавить в корзину
- `PATCH /cart/items/:id` - обновить количество
- `DELETE /cart/items/:id` - удалить из корзины
- `POST /cart/coupon` - применить промокод

#### Заказы
- `GET /orders/my` - мои заказы
- `POST /orders` - создать заказ
- `GET /orders/:id` - детали заказа
- `PATCH /orders/:id/status` - обновить статус

#### Аутентификация
- `POST /auth/login` - вход
- `POST /auth/register` - регистрация
- `POST /auth/refresh` - обновление токена
- `POST /auth/logout` - выход

### Автоматические возможности API клиента

- ✅ Добавляет JWT токен в заголовки
- ✅ Автоматически обновляет истекшие токены
- ✅ Обрабатывает ошибки аутентификации
- ✅ Перенаправляет на логин при 401 ошибке
- ✅ Показывает уведомления об ошибках
- ✅ Timeout защита (10 секунд)

## Система уведомлений

Приложение включает встроенную систему toast-уведомлений:

```typescript
import { useNotification } from '@hooks/useNotification'

const Component = () => {
  const notification = useNotification()

  const handleSuccess = () => {
    notification.success('Успех!', 'Операция выполнена успешно')
  }

  const handleError = () => {
    notification.error('Ошибка!', 'Что-то пошло не так')
  }

  const handleApiError = (error: any) => {
    notification.apiError(error) // Автоматически извлечет сообщение из ответа API
  }

  const handleCartAction = () => {
    notification.cartActionSuccess('added') // Специальные уведомления для корзины
  }
}
```

Доступные типы уведомлений:
- `success` - успешные операции (зеленый)
- `error` - ошибки (красный)  
- `warning` - предупреждения (оранжевый)
- `info` - информационные (серый)

## Добавление новых модулей

1. Создайте папку в `src/modules/`
2. Добавьте компонент, стили и типы
3. Экспортируйте из `index.ts`
4. Добавьте роут в `App.tsx`
5. При необходимости добавьте в Redux store

## Кастомизация стилей

Основные переменные находятся в `src/styles/themes/variables.scss`:

```scss
:root {
  --color-primary-500: #0ea5e9;
  --color-bg-primary: #ffffff;
  --spacing-md: 1rem;
  // ...
}
```

## Готовность к продакшену

✅ **API интеграция** - Полная интеграция с бекенд API  
✅ **Аутентификация** - JWT токены с автообновлением  
✅ **Корзина** - Redux управление состоянием корзины  
✅ **Уведомления** - Система toast-уведомлений  
✅ **Поиск** - Поиск товаров и магазинов с фильтрами  
✅ **Адаптивность** - Оптимизация для мобильных устройств  
✅ **TypeScript** - Полная типизация кода  
✅ **Error Handling** - Обработка ошибок API  

## Следующие шаги для завершения

1. **Подключите реальный бекенд** - замените `VITE_API_BASE_URL` на продакшн URL
2. **Добавьте платежную интеграцию** - Stripe, PayPal или другие
3. **Настройте OAuth** - Google, Facebook логин
4. **Оптимизируйте изображения** - добавьте CDN для картинок
5. **Настройте мониторинг** - Sentry для отслеживания ошибок

## Техническая поддержка

При возникновении вопросов по интеграции или настройке, создайте issue в репозитории.

## Лицензия

MIT