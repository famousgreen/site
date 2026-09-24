# Jeanna K — frontend MVP

Mobile-first демонстрационный сервис мастера ногтей и ресниц. В одном приложении собраны клиентская запись и кабинет мастера; данные хранятся локально в React state, внешние ключи и backend не требуются.

## Возможности

- обязательный выбор FR/EN/RU с сохранением языка локально;
- галерея с лайками и референсами;
- пятишаговая запись: услуга, необязательные фото, напиток, время/оплата, подтверждение;
- съёмка или загрузка фото ногтей, ресниц и желаемого результата;
- повторная запись и клиентский профиль;
- кабинет мастера со статистикой, календарём и блокировкой слотов;
- услуги, клиентская база, сток и процентный расход материалов;
- настройки оплаты, длительностей и email-напоминаний;
- адаптивная вёрстка для мобильных, планшетов и desktop.

## Запуск

Требуется Node.js 20+.

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 43127
```

Проверки:

```bash
npm run lint
npm run build
```

## Основа

Проект использует React, Vite, TypeScript и shadcn/ui-подход из шаблона [di-sukharev/vibe](https://github.com/di-sukharev/vibe). Атрибуция и Apache 2.0 сохранены в `NOTICE` и `LICENSE`.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
