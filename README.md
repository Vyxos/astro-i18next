# @vyxos/astro-i18next

High-performance i18n integration for Astro with dynamic namespace loading and TanStack Router support.

## Key Features

- **Dynamic Loading**: Load only the translation namespaces your routes need
- **Zero Bundle Bloat**: No massive translation bundles in before-hydration scripts
- **TanStack Router Integration**: Built-in helpers for route-based namespace loading
- **SSG Compatible**: Full translations available for static site generation
- **Performance First**: Optimized for minimal client-side overhead

## Installation

```bash
npm install @vyxos/astro-i18next
```

## Quick Setup

### 1. Configure Astro Integration

```typescript
// astro.config.mjs
import { defineConfig } from "astro/config";
import { i18nIntegration } from "@vyxos/astro-i18next";

export default defineConfig({
  integrations: [
    i18nIntegration({
      locales: ["en", "sk", "cs"],
      defaultLocale: "en",
      namespaces: ["common", "auth", "dashboard", "forms"],
      defaultNamespace: "common",
      translationsDir: "src/translations",
      translationsPattern: "{{lng}}/{{ns}}.json",
    }),
  ],
});
```

### 2. Create Translation Files

```
src/translations/
├── en/
│   ├── common.json
│   ├── auth.json
│   └── dashboard.json
└── sk/
    ├── common.json
    ├── auth.json
    └── dashboard.json
```

```json
// src/translations/en/common.json
{
  "welcome": "Welcome",
  "loading": "Loading...",
  "error": "Something went wrong"
}
```

### 3. Dynamic Loading in TanStack Router

```typescript
// src/routes/dashboard.tsx
import { createFileRoute } from "@tanstack/react-router";
import { loadNamespacesForRoute } from "@vyxos/astro-i18next/client";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    // Load only namespaces this route needs
    await loadNamespacesForRoute(["common", "dashboard"]);
  },
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation("dashboard");
  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}
```

### 4. Nested Routes with Different Namespaces

```typescript
// src/routes/admin/users.tsx
export const Route = createFileRoute("/admin/users")({
  beforeLoad: async () => {
    await loadNamespacesForRoute(["common", "admin", "users", "tables"]);
  },
  component: UsersPage,
});

// src/routes/auth/login.tsx
export const Route = createFileRoute("/auth/login")({
  beforeLoad: async () => {
    await loadNamespacesForRoute(["common", "auth", "forms"]);
  },
  component: LoginPage,
});
```

## Advanced Usage

### Preloading for Better UX

```typescript
import {
  preloadNamespaces,
  loadNamespacesForRoute,
} from "@vyxos/astro-i18next/client";

export const Route = createFileRoute("/home")({
  beforeLoad: async () => {
    await loadNamespacesForRoute(["common", "home"]);

    // Preload likely next routes in background
    preloadNamespaces(["dashboard", "auth"]);
  },
  component: HomePage,
});
```

### Component-Level Loading

```typescript
import { useLoadNamespaces } from "@vyxos/astro-i18next/client";
import { useTranslation } from "react-i18next";

function DynamicComponent() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    useLoadNamespaces(["special-feature"]).then(() => {
      setLoaded(true);
    });
  }, []);

  if (!loaded) return <div>Loading translations...</div>;

  const { t } = useTranslation("special-feature");
  return <div>{t("content")}</div>;
}
```

## API Reference

### Integration Options

```typescript
interface IntegrationOptions {
  locales: string[]; // Available languages
  defaultLocale: string; // Fallback language
  namespaces: string[]; // Available namespaces
  defaultNamespace: string; // Default namespace
  translationsDir: string; // Path to translation files
  translationsPattern: string; // File naming pattern
}
```

### Client Functions

```typescript
// Load namespaces for current route (await in beforeLoad)
await loadNamespacesForRoute(["common", "dashboard"]);

// Load namespaces in components
const promise = useLoadNamespaces(["namespace"]);

// Fire-and-forget preloading
preloadNamespaces(["likely", "next", "routes"]);
```

## Performance Benefits

### Before (Traditional)

- ❌ All translations in before-hydration bundle
- ❌ Massive initial bundle size
- ❌ Slow hydration with unused translations

### After (Dynamic Loading)

- ✅ Only route-specific namespaces loaded
- ✅ Minimal before-hydration bundle
- ✅ Fast hydration + on-demand loading

## Development

### Setup Development Environment

```bash
git clone <repo>
cd astro-i18next
npm install
npm run dev        # Watch mode
npm run build      # Build package
npm run lint       # Lint code
npm run typecheck  # Type checking
```

### Project Structure

```
src/
├── integration.ts      # Astro integration
├── scripts.ts          # Generated client/server scripts
├── vite-plugin.ts      # Vite virtual module plugin
├── router-integration.ts # TanStack Router helpers
├── translation-loader.ts # File system translation loading
├── config.ts           # i18next configuration
├── types.ts            # TypeScript definitions
├── index.ts            # Server-side exports
└── client.ts           # Browser-safe exports
```

### Build System

- **tsup**: Fast TypeScript bundler
- **Dual exports**: Separate client/server bundles
- **Type generation**: Full TypeScript support
- **ESLint**: Code quality and consistency

### Testing Your Changes

```bash
# In this package
npm run build

# In your Astro project
pnpm update @vyxos/astro-i18next
rm -rf node_modules/.vite .astro
pnpm run dev
```

### Publishing

```bash
npm version patch|minor|major
npm publish
```

## Architecture

### Translation Loading Flow

1. **Build Time**: Integration discovers all translation files
2. **SSG**: Full translations embedded in server script (for static generation)
3. **Client**: Empty namespace list, dynamic backend for on-demand loading
4. **Route Navigation**: `beforeLoad` calls `loadNamespacesForRoute()`
5. **Dynamic Import**: Vite resolves virtual modules to actual translations
6. **Caching**: i18next caches loaded namespaces in memory

### Virtual Module System

- `virtual:i18n-loader` → Dynamic translation loader
- `virtual:i18n-translation:sk/common` → Specific translation file
- `./virtual-i18n-sk-common.js` → Vite-compatible relative imports

## Future Roadmap

- [ ] **Testing Suite**: Unit tests with Vitest
- [ ] **Integration Tests**: E2E testing with Playwright
- [ ] **Language Detection**: Enhanced browser language detection
- [ ] **Hot Reloading**: Dev server translation updates
- [ ] **Namespace Splitting**: Automatic route analysis
- [ ] **Bundle Analysis**: Translation usage reporting
- [ ] **CDN Support**: External translation loading
- [ ] **Caching Strategy**: Advanced client-side caching
- [ ] **SSR Optimization**: Server-side translation hydration
- [ ] **Astro DB Integration**: Database-driven translations
- [ ] **Translation Management**: UI for managing translations
- [ ] **Plural Rules**: Advanced pluralization support
- [ ] **Context Support**: Translation context handling
- [ ] **Performance Metrics**: Loading time analytics

## Troubleshooting

### Dynamic Import Errors

Ensure you're using the `/client` import for TanStack Router:

```typescript
import { loadNamespacesForRoute } from "@vyxos/astro-i18next/client";
```

### Cache Issues

Clear all caches when updating:

```bash
rm -rf node_modules/.vite .astro dist
```

### Build Failures

Check that translation files exist in the expected structure and contain valid JSON.

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run linting: `npm run lint`
5. Submit pull request

## License

MIT © [Marek Fodor](https://github.com/vyxos)
