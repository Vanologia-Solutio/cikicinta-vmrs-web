# Setigi Heni VMRS — Web

Dashboard for the **Setigi Heni Voucher Management & Redemption System (VMRS)**. It is a Next.js App Router application used to manage voucher categories and benefits, issue voucher batches, print barcode stickers, check and redeem vouchers, and administer tenants, users and access.

The companion projects are separate:
- `cikicinta-vmrs-api`: the NestJS API that holds all data and business rules. This app only calls it.
- `cikicinta-vmrs-printer`: a local agent on the printing workstation. The browser talks to it directly to print stickers.

---

## Tech stack

| Layer | Libraries |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS 4, shadcn/ui on Base UI primitives, `tw-animate-css` |
| Icons | Phosphor (`@phosphor-icons/react`); menu icons are stored by name in the database |
| Server state | TanStack Query v5 |
| Tables | TanStack Table |
| Forms | React Hook Form, Zod (`@hookform/resolvers`) |
| HTTP | Axios (one client with auth and token-refresh interceptors) |
| Client state | Zustand (`useAuthStore`) |
| Misc | `date-fns`, `react-day-picker`, `recharts`, `cmdk`, `nextjs-toploader` |

Path alias: `@/*` → project root.

> This repo pins a Next.js version with breaking changes from older releases. Before changing framework-level code, read the docs in `node_modules/next/dist/docs/`; `AGENTS.md` explains why.

---

## Prerequisites

- **Node.js** 20+
- A running `cikicinta-vmrs-api` whose `CORS_ORIGIN` includes this app's origin
- For printing: `cikicinta-vmrs-printer` running on the same workstation as the browser

---

## Getting started

```bash
npm install
# create .env (or .env.local) with the variables below
npm run dev          # http://localhost:3000
```

For production:

```bash
npm run build
npm run start
```

---

## Environment variables

All variables are public (`NEXT_PUBLIC_*`) and are baked into the bundle at build time.

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/v1` | API base URL, **including** the version segment |
| `NEXT_PUBLIC_PRINTER_AGENT_URL` | `http://127.0.0.1:17890` | Local printer agent |
| `NEXT_PUBLIC_ACCESS_TOKEN_NAME` | `vmrs_access_token` | Cookie name for the access token |
| `NEXT_PUBLIC_REFRESH_TOKEN_NAME` | `vmrs_refresh_token` | Cookie name for the refresh token |
| `NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES_IN` | `900` | Access cookie lifetime (seconds) |
| `NEXT_PUBLIC_REFRESH_TOKEN_EXPIRES_IN` | `604800` | Refresh cookie lifetime (seconds) |

Don't put secrets here: anything prefixed `NEXT_PUBLIC_` is visible to the browser.

---

## Project structure

```
cikicinta-vmrs-web/
├── app/
│   ├── (auth)/            # login, logout, onboarding, callback
│   ├── (main)/            # authenticated pages, sidebar layout
│   │   ├── dashboard/
│   │   ├── voucher-management/  # batches, categories & benefits, redemption, history
│   │   ├── operational/   # printer configuration
│   │   └── platform/      # access management, system configuration, playground
│   └── (redirection)/     # forbidden, unauthorized
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── form/              # DynamicForm and form inputs
│   ├── general/           # tables, dialogs, page header, printer-agent panel, icons
│   ├── voucher-management/  # voucher batches, categories & benefits, redemption, history
│   ├── operational/       # printer configuration
│   └── platform/          # users, roles, responsibilities, tenants, modules, menus, playground
├── hooks/                 # TanStack Query hooks per resource (use-voucher-batch.ts, …)
├── services/              # API calls per resource (voucher-batch-service.ts, …)
├── lib/                   # http-client, query-client, toast, table helpers
└── shared/
    ├── constants/         # endpoints, env, http, common
    ├── providers/         # AuthInitializer, RouteGuard, OnboardingGuard, AppGuard
    ├── stores/            # auth-store (Zustand)
    ├── helpers/           # tokens, menu access, printer-agent token
    ├── schemas/ dtos/ types/ enums/ utils/
```

---

## Pages

| Path | Page |
|------|------|
| `/dashboard` | Home (always allowed after login) |
| `/voucher-management/batches` | Voucher batches; `[id]` shows the vouchers, printing and print history |
| `/voucher-management/categories-and-benefits` | Voucher categories and their benefits |
| `/voucher-management/redemption` | Scan or type a code to check and redeem it, plus redemption history |
| `/voucher-management/history` | Redemption history; clicking a code shows when it was printed, its category, benefit, validity and redemption |
| `/operational/printer-configuration` | Pair with the printer agent, calibrate, test print |
| `/platform/access-management/{users,roles,responsibilities}` | Users, roles, and which menus each tenant + role can open |
| `/platform/system-configuration/{tenants,modules,menus}` | Tenants, sidebar modules and menus |
| `/platform/playground` | Developer tools (voucher check) |

---

## Authentication and access

1. **Login.** `/login` calls `POST /auth/login` and stores both tokens in cookies (`samesite=strict`, plus `secure` over HTTPS).
2. **Bootstrap.** `AuthInitializer` calls `GET /auth/me` and puts the user and their `accessibleMenus` in `useAuthStore`.
3. **Token refresh.** When a request gets a 401, `lib/http-client.ts` calls `POST /auth/refresh` once. Requests that fail during the refresh wait for it and then retry with the new token. If there is no refresh token, the user is sent to `/login`. If the refresh itself fails, the tokens are cleared and the user is sent to `/unauthorized`.
4. **Route guard.** `RouteGuard` sends:
   - logged-out users to `/login`;
   - users opening a page outside their menus to `/forbidden`.

   A page is allowed when its path equals a menu path or starts with one, so `batches/[id]` is covered by `batches`. `/` and `/dashboard` are always allowed.
5. **Onboarding.** `OnboardingGuard` keeps users on `/onboarding` until they finish it.

Menus and access are data, not code:
- The sidebar groups menus by **module** name.
- Which menus a user sees comes from `responsibilities` (tenant + role → menu) in the API.
- **A new page needs a `menus` row and responsibilities, or it redirects to `/forbidden`.**

---

## Data layer

- **Endpoints.** All API paths are listed in `shared/constants/endpoints.ts`. Paths with `{id}` are filled in by a helper.
- **Services.** One class per resource in `services/`, using the shared Axios client. Every service returns the API envelope `{ success, message, data, pagination?, timestamp }`.
- **Hooks.** `hooks/use-*.ts` wrap the services in TanStack Query and invalidate the relevant queries after a mutation. Example: `voucherBatchQueries.useList(query)`.
- **Types.** API shapes live in `shared/types`, request bodies in `shared/dtos`, and Zod schemas in `shared/schemas`. Counts such as `quantity` and `printCount` arrive as numbers.

---

## Forms

Most create/edit dialogs render a `DynamicForm` whose layout comes from the API. `GET /form-schemas?key=create-tenant` (and similar) returns a `fields` array of rows.

- **Supported `componentType`s:** `input`, `input-number`, `currency`, `textarea`, `code`, `datepicker`, `select`, `radio-group`, `combobox-search`, `multiselect`, `switch`, `checkbox` and `file`.
- **Options for selects.** A select field names its option source in `options` (for example `"tenants"`, `"roles"`). The dialog supplies that data, usually from `/master-data`.
- **Form keys.** These are listed in `shared/enums/form-schema-keys.ts` and must exist in the API's `form_schemas` table.

---

## Printing stickers

The browser talks to the local printer agent directly; the API never contacts the printer. The printing flow:

1. On `/operational/printer-configuration`, the operator pastes the agent's pairing token. It is saved in this browser's `localStorage` only and is never sent to the API.
2. On a batch's page, the dashboard asks the API which codes to print, then sends `{ id, code }` pairs to the agent.
3. Each job the agent accepts is logged to the API (`print-logs`). The page keeps those logs updated with the agent's job status.
4. Windows can only confirm that a job was *sent* to the printer, not that it printed. So the operator confirms each print run ("all printed", "none", or "stopped at code X"). Only then do the print counts increase.

Agent setup, pairing and calibration are described in the `cikicinta-vmrs-printer` README.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |

---

## Adding a new page

1. Add the API endpoints in `shared/constants/endpoints.ts`, and types/DTOs in `shared/types` and `shared/dtos`.
2. Add a service in `services/` and a query hook in `hooks/`.
3. Add the page under `app/(main)/...` and its components under `components/...`.
4. If the page has a create/edit dialog, add a `form_schemas` row in the API and its key to `form-schema-keys.ts`.
5. In the API database, add a `menus` row for the page's path, with a Phosphor icon name such as `"Ticket"`, and grant it to roles under **Platform → Responsibilities**.
