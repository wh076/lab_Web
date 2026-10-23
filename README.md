# Трофимов Михаил Олегович ФИТ-241

## Лабораторная работа №6. To-Do на Vue 3 + Vite

To-Do List из лабораторной №4, перенесённый на Vue 3 (Composition API, `<script setup>`) и Vite. Стили на Sass, две темы (светлая и тёмная).

Что умеет:
- добавление и редактирование задачи через модальное окно `<dialog>`;
- удаление задачи;
- отметка выполнения (выполненные задачи зачёркнуты и стоят внизу списка);
- поиск по названию;
- переключение темы.

Задачи и выбранная тема сохраняются в localStorage.

Компоненты лежат в `src/components`: `TodoItem`, `TodoList`, `AddTodoModal`, `SearchBar`, `ThemeToggle`. Список задач хранится в `App.vue`, в компоненты передаётся через props, действия возвращаются через emit.

## Команды

```bash
npm ci
npm run dev
npm run build
```

`npm run preview` открывает собранную версию из `dist`.

## watch и v-if

- `watch(tasks)` с `deep: true` в `App.vue` сохраняет задачи в localStorage при любом изменении: добавлении, редактировании, удалении, отметке.
- `watch(theme)` в `App.vue` ставит атрибут `data-theme` на `<html>` и сохраняет тему в localStorage.
- `v-if` / `v-else-if` / `v-else` в `App.vue`: если задач нет, показывается «Задач пока нет», если по поиску ничего не нашлось, то «Ничего не найдено», иначе выводится список.

## Публикация

Ссылка: https://wh076.github.io/lab_Web/

Сайт публикуется на GitHub Pages через GitHub Actions. При push в ветку `lab6` workflow `.github/workflows/ci.yaml` ставит зависимости (`npm ci`), собирает проект (`npm run build`) и выкладывает папку `dist`. В `vite.config.js` указан `base: '/lab_Web/'`, чтобы пути к файлам работали на Pages.

## Проверка A7 (Lighthouse)

1. Открыть сайт в Chrome, DevTools → Lighthouse.
2. Режим Snapshot, категория Accessibility, в настройках снять галочку Clear storage.
3. Добавить пару задач, отметить одну, запустить проверку для Desktop и Mobile.
4. Переключить тему и повторить. Результат должен быть не ниже 90.
