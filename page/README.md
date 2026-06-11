# ShellForge documentation site

Vite + React app that powers the GitHub Pages site for ShellForge at [shellforge.app.br](https://shellforge.app.br/).

## Development

From repository root:

```powershell
npm run page:dev
```

Or from this folder:

```powershell
npm ci
npm run dev
```

## Build

```powershell
npm run page:build
```

Static output is generated in `page/dist`.

## Deployment

Docs are deployed manually via the **Deploy Docs** GitHub Actions workflow (`workflow_dispatch`).

### Custom domain (shellforge.app.br)

1. In GitHub repo **Settings → Pages**, set custom domain to `shellforge.app.br`.
2. In your DNS provider, add a `CNAME` record for `shellforge.app.br` pointing to `<username>.github.io`.
3. The build includes `public/CNAME` with the domain name.

## Screenshots

Add PNG files to `public/screenshots/` — see [public/screenshots/README.md](public/screenshots/README.md) for the checklist.

Until images exist, the site shows styled placeholders.

## Download button

The Windows download CTA links to the latest GitHub Release installer (`ShellForge-Setup.exe`). Configure `src/constants/siteMeta.ts` (`downloadAvailable`, `downloadUrl`) if the release location changes.

## i18n

English and Portuguese (PT-BR) via sidebar toggle. Locale persists in `localStorage`.

## Content sync

- Step definitions: `src/data/stepDefinitions/` — keep in sync with `ui/src/renderer/tabs/custom-actions/constants.ts`
- Pre-defined commands: `src/data/predefinedCommands.ts` — mirror `ui/src/shared/predefinedCommandsRegistry.ts`
