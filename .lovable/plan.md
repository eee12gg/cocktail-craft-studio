# План переработки редактора рецептов

Это крупная задача. Разбиваю на 5 этапов с поэтапной проверкой. Каждый этап — отдельный мердж в существующую `AdminDrinks.tsx`, без переписывания с нуля.

## Этап 1 — Схема БД (миграция)

Новые/изменённые таблицы:

- `recipes`: добавить `is_published` (уже есть) — переименование смысла на «глобальная видимость». Удалить использование общего `description` из формы (поле в БД оставить как fallback).
- `recipe_translations`: добавить колонки `is_visible boolean default true`, `seo_title text`, `seo_description text`, `seo_keywords text`, `seo_h1 text`. Поле `slug` уже есть → используется как SEO Slug.
- Новая `recipe_seo_phrases`: `id, recipe_id, language_code, phrase, sort_order, created_at`. Одна фраза — одна строка (без JSON). Уникальность `(recipe_id, language_code, phrase)`.
- `reviews`: добавить `language_code text` (default `'en'`, backfill существующих).

RLS: публичное чтение фраз/переводов где `is_visible=true`; запись — только админ. GRANT по стандарту.

## Этап 2 — Бэкенд-логика видимости

- `useRecipes`, `useRecipeBySlug`, поиск, sitemap (`supabase/functions/sitemap`) — фильтровать по `recipe_translations.is_visible` для текущего языка + глобальный `is_published`.
- `LanguageSwitcher` — скрывать языки, где для текущего рецепта `is_visible=false` (только на странице рецепта).
- `SeoHead` — добавлять `<meta name="robots" content="noindex">`, если язык скрыт; canonical/hreflang только для видимых языков.

## Этап 3 — Редактор: общая часть

В `AdminDrinks.tsx` форма рецепта реструктурируется:

1. **Изображение** — без изменений (текущий `ImageUpload`).
2. **Основная информация**: внутреннее название (admin-only label) + категория.
3. **Время приготовления + глобальная видимость** (Switch для `is_published`).
4. **Удалить** общее поле `description` из формы (БД-поле остаётся как legacy).
5. **Метаданные** — те же блоки: публикация, ингредиенты, оборудование, теги, хештеги, рекомендуемые. Без изменений.

## Этап 4 — Мультиязычный редактор (lazy)

Новый компонент `RecipeLanguageEditor.tsx` ниже общей формы:

- Переключатель языков (табы), грузит **только** активный язык по клику (React Query, ключ `["recipe-lang", recipeId, lang]`).
- Внутри активного языка — секции:
  1. **Видимость языка** (Switch → `recipe_translations.is_visible`).
  2. **Название** (`title`).
  3. **Описание** (`description`).
  4. **Ингредиенты** — автоподстановка: `ingredient_translations[lang] ?? ingredient_translations[en] ?? ingredients.name`. Поле `recipe_ingredient_translations.display_text` редактируется опционально (placeholder = автоподстановка).
  5. **Шаги приготовления** — редактор `recipe_step_translations` для языка.
  6. **Отзывы** (lazy, пагинация по 10) — список с фильтром `language_code=lang`, действия: редактировать/удалить/открыть на сайте. Счётчик сверху.
  7. **SEO** — `seo_title`, `seo_description`, `seo_keywords`, `seo_h1`, `seo_slug` (auto-generate из title если пусто).
  8. **SEO-фразы** — отдельный менеджер: добавить одну, массовый ввод (textarea, split по строкам), удалить, drag-sort, поиск. Каждая = отдельная строка в `recipe_seo_phrases`.
  9. **Ссылка** — `localePath` URL + кнопки «Открыть» и «Копировать».

Автосохранение через debounced mutation (800 мс) на изменённое поле. Optimistic updates. Кеш переводов ингредиентов — глобальный React Query, staleTime 10 мин.

Старый `RecipeTranslationTabs.tsx` удаляется (заменяется новым редактором).

## Этап 5 — SEO-интеграция и проверка

- `SeoHead` на `RecipePage` — использовать новые поля `seo_*` с fallback на `title/description`.
- Sitemap — фильтр по `is_visible` для каждого языка.
- Hreflang — только для видимых языков.
- Прогон: создать тест-рецепт, отредактировать на 2 языках, скрыть один, проверить главную, поиск, sitemap-функцию, переключатель.

## Технические детали

- Запросы: за раз грузится только активный язык + общая мета рецепта. Отзывы и SEO-фразы — отдельные lazy-запросы по клику на секцию (Accordion).
- React Query keys: `["recipe", id]`, `["recipe-lang", id, lang]`, `["recipe-reviews", id, lang, page]`, `["recipe-seo-phrases", id, lang]`.
- Мутации — точечные UPDATE по одному полю/одной строке, без отправки полного объекта.
- ИИ не используется в редакторе (переводы — отдельная функция `translate-recipes`, остаётся как есть).

## Риски

- Объём изменений большой → делаю поэтапно. После Этапа 1 (миграция) дождусь утверждения и продолжу.
- Существующие отзывы получат `language_code='en'` по умолчанию (backfill в миграции).

## Что НЕ меняется

- Архитектура изображений, бэкап, переводчик через ИИ, страницы публичной части (кроме `SeoHead` + фильтр видимости), инструменты, языки админка.

---

Подтвердите план — начну с Этапа 1 (миграция БД).