#!/bin/bash

echo "========================================="
echo "Проверка хардкод текстов в проекте"
echo "========================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Путь к директории src
SRC_DIR="./src"

echo -e "${YELLOW}1. Проверка русских текстов (кириллица):${NC}"
echo "----------------------------------------"
# Поиск кириллических символов в JSX/TSX файлах, исключая комментарии и консоль логи
rg -t tsx -t ts '[А-Яа-яЁё]{3,}' "$SRC_DIR" \
  --glob '!**/*.test.*' \
  --glob '!**/*.spec.*' \
  --glob '!**/localization/**' \
  --glob '!**/translations/**' \
  -C 1 | grep -v "console\." | grep -v "//" | grep -v "/\*" | head -20

echo ""
echo -e "${YELLOW}2. Проверка текстов в JSX элементах:${NC}"
echo "----------------------------------------"
# Поиск текста между JSX тегами
rg -t tsx '>\s*[A-Za-zА-Яа-я][^<>]{2,}</' "$SRC_DIR" \
  --glob '!**/*.test.*' \
  --glob '!**/localization/**' \
  -C 0 | grep -v "{t(" | grep -v "{.*}" | head -20

echo ""
echo -e "${YELLOW}3. Проверка строковых литералов в кавычках:${NC}"
echo "----------------------------------------"
# Поиск строк в одинарных и двойных кавычках (исключая импорты и ключи)
rg -t tsx -t ts "['\"](Загрузка|Ошибка|Успешно|Отмена|Сохранить|Удалить|Добавить|Войти|Выйти|Регистрация)['\"]" "$SRC_DIR" \
  --glob '!**/localization/**' \
  --glob '!**/translations/**' \
  -C 0 | head -20

echo ""
echo -e "${YELLOW}4. Проверка placeholder атрибутов:${NC}"
echo "----------------------------------------"
# Поиск placeholder с хардкод текстом
rg -t tsx 'placeholder=["\'"][^"\']*[А-Яа-яA-Za-z]{3,}[^"\']*["\']' "$SRC_DIR" \
  --glob '!**/localization/**' \
  -C 0 | grep -v "placeholder={" | head -10

echo ""
echo -e "${YELLOW}5. Проверка title/alt/aria-label атрибутов:${NC}"
echo "----------------------------------------"
# Поиск атрибутов с хардкод текстом
rg -t tsx '(title|alt|aria-label)=["\'"][^"\']+["\']' "$SRC_DIR" \
  --glob '!**/localization/**' \
  -C 0 | grep -v "={t(" | head -10

echo ""
echo -e "${YELLOW}6. Файлы с наибольшим количеством русского текста:${NC}"
echo "----------------------------------------"
# Подсчет кириллических символов по файлам
for file in $(find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | grep -v test | grep -v spec | grep -v localization); do
  count=$(grep -o '[А-Яа-яЁё]' "$file" 2>/dev/null | wc -l)
  if [ $count -gt 50 ]; then
    echo "$count - $file"
  fi
done | sort -rn | head -10

echo ""
echo -e "${YELLOW}7. Проверка использования t() функции:${NC}"
echo "----------------------------------------"
# Подсчет использования t() по файлам
echo "Файлы БЕЗ использования t():"
for file in $(find "$SRC_DIR/modules" -name "*.tsx" | grep -v test); do
  if ! grep -q "useTranslation\|t(" "$file"; then
    echo -e "${RED}✗${NC} $file"
  fi
done | head -10

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Рекомендации:${NC}"
echo "1. Все найденные тексты должны быть заменены на t('key')"
echo "2. Проверьте файлы из списка выше"
echo "3. Добавьте useTranslation hook где его нет"
echo "4. Убедитесь что все ключи добавлены в translation файлы"
echo ""
echo "Для детальной проверки конкретного файла:"
echo "rg '[А-Яа-яЁё]' path/to/file.tsx"
echo "========================================="