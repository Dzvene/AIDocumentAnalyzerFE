# 🔍 Проверка локализации проекта

## Быстрые команды для проверки хардкод текстов

### 1. Найти все файлы с русским текстом (кириллица)
```bash
# В корне проекта выполните:
grep -r "а\|б\|в\|г\|д\|е\|ё\|ж\|з\|и\|й\|к\|л\|м\|н\|о\|п\|р\|с\|т\|у\|ф\|х\|ц\|ч\|ш\|щ\|ъ\|ы\|ь\|э\|ю\|я" ./src --include="*.tsx" --include="*.ts" --exclude-dir=translations -l | grep -v test
```

### 2. Найти конкретные русские слова
```bash
# Частые слова которые забывают локализовать:
grep -r "Загрузка\|Ошибка\|Успешно\|Отмена\|Сохранить\|Удалить\|Добавить\|Войти\|Выход\|Регистрация" ./src --include="*.tsx" --exclude-dir=translations
```

### 3. Найти тексты в JSX без t()
```bash
# Ищем текст между тегами без {t(
grep -E ">\s*[А-Яа-я][^<>]+</" ./src -r --include="*.tsx" | grep -v "{t("
```

### 4. Найти placeholder без локализации
```bash
grep -r 'placeholder="[^"]*"' ./src --include="*.tsx" | grep -v "placeholder={" 
```

### 5. Проверить использование useTranslation
```bash
# Файлы БЕЗ импорта useTranslation
for file in $(find ./src/modules -name "*.tsx"); do
  if ! grep -q "useTranslation" "$file"; then
    echo "❌ $file"
  fi
done
```

## 📋 Чек-лист проверки

### ✅ Должно быть локализовано:
- [ ] Все тексты в JSX элементах: `<p>Text</p>` → `<p>{t('key')}</p>`
- [ ] Все placeholder: `placeholder="Text"` → `placeholder={t('key')}`
- [ ] Все title атрибуты: `title="Text"` → `title={t('key')}`
- [ ] Все aria-label: `aria-label="Text"` → `aria-label={t('key')}`
- [ ] Все alt тексты: `alt="Text"` → `alt={t('key')}`
- [ ] Все кнопки: `<button>Save</button>` → `<button>{t('save')}</button>`
- [ ] Все ошибки: `setError('Error')` → `setError(t('error'))`
- [ ] Все уведомления: `toast('Success')` → `toast(t('success'))`

### ❌ НЕ нужно локализовать:
- console.log() сообщения
- Комментарии в коде
- Имена переменных и функций
- URL адреса
- Технические ключи (id, классы)
- Числа и даты (используйте форматтеры)

## 🔥 Файлы требующие внимания

По результатам проверки, эти файлы содержат хардкод тексты:

1. **modules/AllShops/AllShops.tsx** - геолокация, ошибки
2. **modules/Shop/Shop.tsx** - тексты магазина
3. **modules/UserDashboard/UserDashboard.tsx** - дашборд
4. **modules/Wishlist/Wishlist.tsx** - избранное
5. **modules/Checkout/Checkout.tsx** - оформление заказа
6. **modules/Cart/Cart.tsx** - корзина
7. **modules/OrderHistory/OrderHistory.tsx** - история заказов
8. **modules/Payment/Payment.tsx** - оплата
9. **modules/NotFound/NotFound.tsx** - страница 404
10. **modules/Home/Home.tsx** - главная страница

## 🛠 Как исправить

### 1. Добавить хук в компонент:
```tsx
import { useTranslation } from 'react-i18next'

const Component = () => {
  const { t } = useTranslation()
  // ...
}
```

### 2. Заменить тексты:
```tsx
// Было:
<h1>Добро пожаловать</h1>
<button>Сохранить</button>
<input placeholder="Введите имя" />

// Стало:
<h1>{t('welcome')}</h1>
<button>{t('common.save')}</button>
<input placeholder={t('placeholders.enterName')} />
```

### 3. Добавить ключи в translations/*.json:
```json
{
  "welcome": "Welcome",
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "placeholders": {
    "enterName": "Enter name"
  }
}
```

## 📊 Текущий статус

- ✅ **Настроены языки:** en, ru, de, fr, es, it, pl
- ✅ **Удален:** украинский язык (uk)
- ⚠️ **Требует доработки:** ~15 файлов с хардкод текстами
- 📝 **Рекомендация:** Пройти по каждому файлу из списка выше

## 🚀 Автоматизация

Для VSCode установите расширение i18n Ally - оно подсветит все нелокализованные строки.

## 💡 Полезные паттерны

```tsx
// Условные тексты
{isLoading ? t('loading') : t('loaded')}

// Тексты с переменными
{t('welcome', { name: userName })}

// Множественные формы
{t('items', { count: itemCount })}

// Вложенные ключи
{t('errors.network.timeout')}
```