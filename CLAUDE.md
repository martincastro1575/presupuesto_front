# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Planificador de Gastos - A personal finance management app built with Vue 3. Spanish-language UI for tracking income, expenses, budgets, and category limits.

## Commands

```bash
npm run dev       # Dev server on port 3000 (proxies /api → localhost:5000)
npm run build     # Production build
npm run preview   # Preview production build
```

No test runner or linter is configured.

## Architecture

**Stack:** Vue 3 (Composition API) + Vite + PrimeVue 4 (Aura theme) + Tailwind CSS 4 + Pinia + TanStack Query + Axios

### Data Flow

```
Pages (useQuery/useMutation) → Services (Axios) → Backend API (.NET)
                                    ↑
                              api.js interceptors (JWT auth, response unwrapping, token refresh)
```

### Key Patterns

**API Response Unwrapping:** The response interceptor in `src/services/api.js` automatically extracts `response.data.data` when the backend returns `{ success, data, ... }`. Services then apply additional extraction (`extractArray` / `extractData`) to normalize results.

**TanStack Query Configuration (main.js):** staleTime 5min, retry 1, no refetchOnWindowFocus. All data fetching goes through `useQuery`/`useMutation` — no direct service calls in components.

**CRUD Page Pattern:** Every CRUD page follows the same structure:
- `useQuery` for data + `useMutation` for create/update/delete
- `showDialog` ref + `editingItem` ref for dialog-based forms
- `handleSubmit()` branches on `editingItem` (create vs update)
- `confirmDelete()` uses PrimeVue `useConfirm()` + `ConfirmDialog`
- Mutations invalidate related query keys on success, show toast on success/error

**Period-based Queries:** Presupuestos, LimitesCategorias, and Reportes use `selectedYear`/`selectedMonth` refs as reactive query keys: `['key', selectedYear, selectedMonth]`.

**Mutation Invalidation:** Mutations invalidate not just their own queries but cross-dependent ones (e.g., gastos mutations also invalidate `['presupuestos']`, `['resumen-mensual']`, `['limites-categorias']`).

### Auth Flow

JWT stored in localStorage. `src/stores/auth.js` (Pinia, Composition API style) manages auth state. Router guard in `src/router/index.js` redirects unauthenticated users to `/auth/login`. The Axios request interceptor attaches the Bearer token; the response interceptor handles 401s with automatic token refresh via `/Auth/refresh-token`.

### Layout System

`src/layout/AppLayout.vue` wraps all protected routes. Contains `AppTopbar`, `AppSidebar`, `Toast`, and `ConfirmDialog`. Layout state (menu mode, dark theme) managed by `src/layout/composables/layout.js`.

### Styling

Three layers: Tailwind CSS utilities, PrimeVue component styles (with `tailwindcss-primeui` plugin), and SCSS for layout-specific styles (`src/assets/layout/`). Dark mode toggled via `.app-dark` class on `<html>`.

## Backend API

- Base URL: `VITE_API_URL` env var, defaults to `/api` (proxied in dev)
- Endpoints follow RESTful conventions under `/api/{Resource}`
- Backend is .NET with camelCase JSON serialization
- Some resources (Presupuestos) use POST for both create and update (upsert pattern with optional `id` field)
- Backend source at `C:\Users\castrom\Documents\PlanificadorGastos-Backend`

## Conventions

- All pages use `<script setup>` with Composition API
- Spanish naming for domain concepts: gastos, ingresos, categorias, presupuestos, monto, fecha, anio, mes
- Services in `src/services/` each export a single object with async methods
- Currency formatted as ARS (Argentine Peso) using `Intl.NumberFormat('es-AR')`
- PrimeVue components are imported per-file (no global registration)
- Dates sent to API as ISO string date portion: `date.toISOString().split('T')[0]`
