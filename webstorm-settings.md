# WebStorm настройки для локализации

## 🎯 Live Templates для быстрой работы

### Добавьте в Settings → Editor → Live Templates:

#### 1. Template: `tkey`
```javascript
{t('$KEY$')}
```
- Abbreviation: `tkey`
- Description: Insert t() with key
- Variables: KEY = complete()

#### 2. Template: `trans`
```javascript
const { t } = useTranslation()
```
- Abbreviation: `trans`
- Description: Add useTranslation hook

#### 3. Template: `timp`
```javascript
import { useTranslation } from 'react-i18next'
```
- Abbreviation: `timp`
- Description: Import useTranslation

## 🔍 Поиск и замена с регулярками

### Find and Replace (Ctrl+R):

1. **Заменить текст в JSX:**
   - Find: `>([А-Яа-я][^<>]+)<`
   - Replace: `>{t('$1')}<`

2. **Заменить placeholder:**
   - Find: `placeholder="([^"]+)"`
   - Replace: `placeholder={t('$1')}`

3. **Заменить button текст:**
   - Find: `<button([^>]*)>([^<]+)</button>`
   - Replace: `<button$1>{t('$2')}</button>`

## 📁 Scope для поиска

Создайте Custom Scope:
1. Settings → Appearance & Behavior → Scopes
2. Создайте scope "Components":
   ```
   file:src/modules//*.tsx||file:src/components//*.tsx
   ```
3. Исключите:
   ```
   !file:*/translations/*&&!file:*/localization/*&&!file:*.test.*
   ```

## 🚨 Inspection Profile

### Создайте профиль "Localization Check":

1. **Settings → Editor → Inspections**
2. **Duplicate Default profile → "Localization Check"**
3. **Включите:**
   - ✅ Hardcoded strings
   - ✅ Internationalization issues
   - ✅ Properties files issues

4. **Настройте Hardcoded strings:**
   - Severity: Warning
   - Exclude: console.*, /*.*, //.*, import .*, export .*

## 🔥 Горячие клавиши

| Действие | Windows/Linux | Mac |
|----------|--------------|-----|
| Глобальный поиск | Ctrl+Shift+F | Cmd+Shift+F |
| Замена в файлах | Ctrl+Shift+R | Cmd+Shift+R |
| Поиск по регулярке | Включите .* в поиске | |
| Structural Search | Ctrl+Shift+S | Cmd+Shift+S |

## 💡 Structural Search and Replace

### Настройте шаблоны для автозамены:

**Search template:**
```
<$tag$>$text$</$tag$>
```

**Replace template:**
```
<$tag$>{t('$text$')}</$tag$>
```

**Filters:**
- $text$: Type=JSXText, Text filter=[А-Яа-я]+

## 🎨 Color scheme для подсветки

Добавьте TODO паттерны:
1. Settings → Editor → TODO
2. Добавьте паттерн: `\bhardcoded\b.*`
3. Установите яркий цвет

## 📊 Анализ кода

### Запустите анализ:
1. Code → Inspect Code (Ctrl+Alt+Shift+I)
2. Выберите scope "Components"
3. Выберите profile "Localization Check"
4. Просмотрите результаты в окне Inspection Results

## 🔄 Автоматизация

### External Tools:
1. Settings → Tools → External Tools
2. Add:
   - Name: Check Hardcoded Texts
   - Program: $ProjectFileDir$/check-hardcoded-texts.sh
   - Working directory: $ProjectFileDir$

### File Watchers:
1. Settings → Tools → File Watchers
2. Add custom watcher для .tsx файлов
3. Запускать проверку при сохранении

## 📝 Чек-лист для WebStorm

- [ ] Настроены Live Templates
- [ ] Создан Custom Scope
- [ ] Настроен Inspection Profile
- [ ] Добавлены TODO patterns
- [ ] Настроены External Tools
- [ ] Изучены горячие клавиши

## 🚀 Быстрый старт

1. Откройте любой .tsx файл
2. Нажмите Ctrl+Shift+F
3. Включите регулярки (.*) 
4. Вставьте: `[А-Яа-яЁё]{3,}`
5. Scope: Components
6. Find All

Это покажет все файлы с русским текстом!