---
title: Getting Started
description: Install astro-docs and create your first page.
sidebar:
  order: 1
  badge: New
---

## Install

```sh
npm install astro-docs
```

## Add the integration

```js title="astro.config.mjs"
import { defineConfig } from "astro/config";
import astroDocs from "astro-docs";

export default defineConfig({
  integrations: [astroDocs({ title: "My Docs" })],
});
```

## Write content

Drop Markdown files into `src/content/docs/` and they become pages
automatically.

:::tip
Use the `sidebar.order` frontmatter field to control ordering.
:::
