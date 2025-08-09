# B4OS Landing Page Documentation

## 📋 Project Overview

This is the official landing page for **B4OS (Bitcoin 4 Open Source)**, a free technical training program for senior developers interested in the Bitcoin and Lightning Network ecosystem. The site is built with **Astro** for optimal performance and SEO.

## ⚡ About Astro

**Astro** is a modern web framework designed for building fast, content-focused websites. Key advantages for this project:

- **Zero JS by default**: Ships only the JavaScript you need
- **Island Architecture**: Interactive components load independently
- **Built-in optimizations**: Automatic image optimization, CSS bundling, and more
- **SEO-friendly**: Server-side rendering with excellent meta tag support
- **Framework agnostic**: Can use React, Vue, Svelte components when needed

Perfect for landing pages like B4OS where performance and SEO are critical.

## 🏗️ Project Structure

```text
/
├── public/                 # Static assets (images, favicons, etc.)
├── src/
│   ├── components/        # Reusable Astro components (FAQ, Benefits, etc.)
│   ├── data/             # Static data (cities, countries)
│   ├── layouts/          # Page layouts (Layout.astro)
│   ├── pages/            # Routes (index.astro, terminos.astro)
│   └── styles/           # CSS modules (global.css, nav.css, etc.)
├── netlify/               # Netlify functions (if any)
├── reports/               # Lighthouse audit reports (auto-generated)
├── netlify.toml           # Netlify configuration
└── package.json
```

## 🧞 Development Commands

| Command | Action | Usage |
|---------|--------|-------|
| `npm install` | Install dependencies | One-time setup |
| `npm run dev` | Start development server | Development at `localhost:4321` |
| `npm run build` | Build for production | Creates `./dist/` folder |
| `npm run preview` | Preview production build | Test build locally |
| `npm run astro add` | Add integrations | `npm run astro add tailwind` |
| `npm run astro check` | Check for errors | TypeScript and syntax validation |

## 📊 Lighthouse Performance Commands

### Local Development

| Command | Description |
|---------|-------------|
| `npm run lighthouse:mobile` | Mobile performance audit with HTML report |
| `npm run lighthouse:desktop` | Desktop performance audit |
| `npm run lighthouse:both` | Run both mobile & desktop audits |
| `npm run lighthouse:ci` | Full CI/CD pipeline (build + preview + audit) |
| `npm run check:server` | Verify server is running at `localhost:4321` |

### Netlify Integration
Lighthouse runs automatically on each deploy via Netlify's Lighthouse plugin (managed in UI).
- View scores directly in deploy details
- Reports embedded in Netlify UI 
- No additional configuration needed

### Performance Targets
- **Performance**: 95+ score target
- **Accessibility**: 100 score target  
- **Best Practices**: 95+ score target
- **SEO**: 100 score target

### Quick Usage Examples
```bash
# Check if dev server is running
npm run check:server

# Quick mobile audit while developing
npm run lighthouse:mobile

# Full audit for production
npm run lighthouse:ci
```

## 🎨 Key Features

- **Multi-section landing page** with hero, timeline, registration form
- **Responsive design** optimized for mobile and desktop
- **SEO optimized** with structured data and meta tags
- **Form handling** with country/city selection and validation
- **Performance optimized** with lazy loading and efficient assets
- **Astro Islands** for interactive components without JS bloat

## 🌐 Deployment

### Netlify (Recommended)
- **Auto-deploy**: Connected to main branch
- **Lighthouse integration**: Automatic performance audits
- **Headers optimization**: Security and caching configured
- **Forms handling**: Contact form processing

### Manual Deploy
```bash
npm run build              # Creates ./dist/ folder
# Upload ./dist/ folder to any static hosting
```

## 📈 Performance Monitoring Workflow

1. **Development**: Use `npm run lighthouse:mobile` for quick checks
2. **Pre-commit**: Run `npm run lighthouse:both` to test both devices
3. **CI/CD**: Use `npm run lighthouse:ci` in automated pipelines
4. **Reports**: Check `./reports/` folder for detailed HTML reports

---

**Tech Stack**: Astro, CSS Modules, Vanilla JavaScript  
**Performance**: Lighthouse optimized for 95+ scores across all metrics