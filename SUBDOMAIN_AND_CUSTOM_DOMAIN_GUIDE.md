# Subdomain & Custom Domain Architecture & Migration Guide

## 1. Overview & Current Implementation

The system supports multi-tenant storefront URLs using two primary mechanisms:
1. **User Subdomain (Default for users without custom domain)**:
   - Format: `https://<user_subdomain>.zoyee.in` (e.g. `https://my_muscles_factory.zoyee.in`)
2. **Custom Domain (For users with their own domain)**:
   - Format: `https://<custom_domain>` (e.g. `https://my_muscles_factory.in` or `https://www.my_muscles_factory.in`)

---

## 2. Architecture & How Subdomains are Handled

```
                              [Incoming Request]
                                      │
                                      ▼
                        Next.js Middleware (middleware.ts)
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
   Main Platform Request                          Tenant Subdomain / Custom Domain
(zoyee.in / localhost:3000)                  (my_muscles_factory.zoyee.in OR my_muscles_factory.in)
              │                                               │
              ▼                                               ▼
Normal App Route (/dashboard)                      Internal Rewrite to /[username]
                                                              │
                                                              ▼
                                                   Public Storefront Page
                                                  Calls /accounts/public/store/<identifier>/
                                                              │
                                                              ▼
                                                    Backend Account Resolution
                                           (Lookup by username, store_slug, or custom_domain)
```

---

## 3. Configuration & Routing Requirements

### Frontend Configuration (`.env.local` / Environment Variables)
- `NEXT_PUBLIC_ROOT_DOMAIN`: Root domain for subdomains. Default is `zoyee.in`.
- Set `NEXT_PUBLIC_ROOT_DOMAIN=zoyee.in` in production.

### Next.js Middleware (`frontend 2.0/src/middleware.ts`)
- Intercepts incoming requests.
- If request hostname matches `app.<rootHost>` or `<rootHost>` (or `localhost`), request routes normally to system pages (`/dashboard`, `/login`, etc.).
- If request hostname matches `<subdomain>.<rootHost>` (e.g. `my_muscles_factory.zoyee.in`), middleware extracts `<subdomain>` and internally rewrites request to `/[username]` where `username = subdomain`.
- If request hostname is a custom domain (e.g. `my_muscles_factory.in`), middleware cleans `www.` and rewrites internally to `/[username]` where `username = custom_domain`.

---

## 4. Backend Dependencies & API Contracts

### Database Fields (`WebsiteSettings` in `backend/apps/accounts/models.py`)
- `store_slug`: `models.CharField(max_length=255, unique=True, null=True, blank=True)`
- `custom_domain`: `models.CharField(max_length=255, unique=True, null=True, blank=True)`

### API Endpoints
1. `GET /accounts/website-settings/`: Returns `store_slug` and `custom_domain`.
2. `PUT /accounts/website-settings/`: Accepts and validates `store_slug` and `custom_domain`.
3. Public Storefront APIs:
   - `GET /accounts/public/store/<username>/`
   - `GET /accounts/public/store/<username>/products/<product_id>/`
   - `POST /crm/orders/public/create/`
   All public endpoints resolve the supplier account matching `username` OR `store_slug` OR `custom_domain`.

---

## 5. User Custom Domain Integration

When a user links their own domain (e.g., `my_muscles_factory.in`):
1. The user updates the **Custom Domain** field on `/dashboard/products/website`.
2. In their DNS provider (GoDaddy, Cloudflare, Namecheap, etc.), the user adds a **CNAME record**:
   - `Type`: `CNAME`
   - `Host / Name`: `@` (or `www`)
   - `Value / Target`: `cname.zoyee.in` (or server CNAME/A IP).

---

## 6. Steps to Switch from `zoyee.in` to `anydm.in` in the Future

Switching the primary platform domain from `zoyee.in` to `anydm.in` requires **zero code changes**:

1. **Update Frontend Environment Variable**:
   In production environment configuration (`.env.production` / Vercel / server env):
   ```env
   NEXT_PUBLIC_ROOT_DOMAIN=anydm.in
   ```
2. **DNS Configuration**:
   - Point Wildcard A / CNAME records (`*.anydm.in` and `app.anydm.in`) to the Next.js server IP / Vercel / Cloudflare ingress.
3. **Re-deploy Frontend**:
   - Deploy `frontend 2.0`. The Next.js middleware and domain helper utilities will automatically construct all subdomains using `https://<subdomain>.anydm.in` instantly.
