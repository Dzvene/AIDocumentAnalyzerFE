# Тестирование поддоменов локально

## Способ 1: Использование hosts файла (Рекомендуется)

### 1. Настройте hosts файл

#### Windows:
Откройте `C:\Windows\System32\drivers\etc\hosts` с правами администратора и добавьте:

```
127.0.0.1    clearcontract.local
127.0.0.1    en.clearcontract.local
127.0.0.1    de.clearcontract.local
127.0.0.1    ru.clearcontract.local
127.0.0.1    fr.clearcontract.local
127.0.0.1    es.clearcontract.local
127.0.0.1    it.clearcontract.local
127.0.0.1    pl.clearcontract.local
127.0.0.1    api.clearcontract.local
```

#### Linux/Mac:
Отредактируйте `/etc/hosts` с правами sudo:
```bash
sudo nano /etc/hosts
```

### 2. Запустите приложение

```bash
npm run dev
```

### 3. Откройте в браузере

- Английский: http://en.clearcontract.local:3098
- Немецкий: http://de.clearcontract.local:3098
- Русский: http://ru.clearcontract.local:3098
- Французский: http://fr.clearcontract.local:3098
- Испанский: http://es.clearcontract.local:3098
- Итальянский: http://it.clearcontract.local:3098
- Польский: http://pl.clearcontract.local:3098

## Способ 2: Использование ngrok

### 1. Установите ngrok
```bash
npm install -g ngrok
```

### 2. Запустите приложение
```bash
npm run dev
```

### 3. В другом терминале запустите ngrok
```bash
ngrok http 3098
```

### 4. Используйте предоставленный URL
ngrok даст вам URL вида `https://xxx.ngrok.io`, который будет поддерживать поддомены.

## Способ 3: Использование локального DNS сервера (dnsmasq)

### Linux/Mac:
```bash
# Установка
sudo apt-get install dnsmasq  # Ubuntu/Debian
brew install dnsmasq  # Mac

# Настройка
echo "address=/.clearcontract.local/127.0.0.1" | sudo tee /etc/dnsmasq.conf
sudo service dnsmasq restart
```

### Windows:
Используйте Acrylic DNS Proxy или подобные инструменты.

## Тестирование функциональности

### Проверьте:
1. **Автоматическое определение языка**: При открытии `de.clearcontract.local:3098` должен автоматически установиться немецкий язык
2. **Переключение языка**: При выборе другого языка в dropdown должен произойти редирект на соответствующий поддомен
3. **Сохранение настроек**: Язык должен сохраняться в localStorage
4. **Кросс-доменная авторизация**: Авторизация должна работать на всех поддоменах

### API для локального тестирования:
Если у вас локально запущен backend на порту 5055, обновите `.env`:
```
REACT_APP_API_URL=http://api.clearcontract.local:5055
```

И добавьте в hosts:
```
127.0.0.1    api.clearcontract.local
```

## Отладка

### Проверьте в консоли браузера:
```javascript
// Текущий язык
console.log(window.location.hostname)
console.log(localStorage.getItem('preferredLanguage'))

// Проверка i18n
console.log(i18n.language)
```

### Проблемы с CORS:
Если возникают проблемы с CORS при работе с API, убедитесь что backend настроен на принятие запросов с поддоменов:
- Добавьте все локальные домены в CORS whitelist
- Используйте `credentials: 'include'` в fetch запросах (уже настроено)