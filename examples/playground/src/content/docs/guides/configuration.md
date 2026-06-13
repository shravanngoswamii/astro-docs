---
title: Configuration
description: Configure title, sidebar, theme, and search.
sidebar:
  order: 2
---

## Options

The integration accepts a configuration object:

```js
astroDocs({
  title: "My Docs",
  colorScheme: "both",
  customCss: ["./src/styles/brand.css"],
});
```

:::warning
`customCss` is imported unlayered, so it always wins over framework defaults.
:::

## Theming

Set `theme: "paper"` for the built-in serif look, `theme: "none"` for an
unstyled base, or point it at your own CSS file.
