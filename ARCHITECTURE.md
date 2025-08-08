# Architecture & Contribution Guide

This document provides an overview of the project structure, technology stack, and implementation details to help new contributors (or automated assistants) understand the architecture and confidently add new features such as pages, API routes, and background services.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Layout](#repository-layout)
   - backend/
   - frontend/
3. [Backend Details](#backend-details)
   - Stack
   - Configuration
   - Database
   - Folder Structure
   - Initialization & Entry Point
   - Adding a New API Route
   - Background Services (Scheduler & Cleanup)
4. [Frontend Details](#frontend-details)
   - Stack
   - Configuration
   - Folder Structure
   - Next.js App Router (src/app)
   - Adding a New Page
   - Internationalization (i18n)
   - Styling (Tailwind CSS)
5. [Environment Variables](#environment-variables)
6. [Scripts & Deployment](#scripts--deployment)
7. [Testing & Linting](#testing--linting)
8. [Useful Tips](#useful-tips)

---

## Project Overview

This is a monorepo containing two main parts:

- **backend/**: Express.js REST API server with Next.js integration, MongoDB connection, scheduled tasks, and cleanup services.
- **frontend/**: Next.js (App Router) React application using TypeScript and Tailwind CSS for UI, internationalization (Japanese support), and client-side data fetching.

---

## Repository Layout

```
/ (root)
├── ARCHITECTURE.md         # This file
├── README.md
├── DEPLOYMENT.md
├── startup.sh              # Shell script to start both backend and frontend
├── backend/                # Express.js + Next.js integration
└── frontend/               # Next.js application (App Router)
```

### backend/

```
backend/
├── package.json           # Backend dependencies & scripts
├── src/
│   ├── server.js          # Entry point (Express + Next.js)
│   ├── config/db.js       # MongoDB connection logic
│   ├── routes/            # Express route definitions
│   ├── controllers/       # Route handlers / business logic
│   ├── services/          # Background tasks, scraper services, OpenAI integration
│   ├── models/            # Mongoose schemas and models
│   ├── middlewares/       # Express middleware (auth, logging)
│   └── utils/             # Helper functions
└── .env                   # Environment variables for backend
```

### frontend/

```
frontend/
├── package.json           # Frontend dependencies & scripts
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind CSS config
├── next.config.js         # Next.js config (custom domains, redirects)
├── public/                # Static assets and icons
└── src/
    ├── app/               # Next.js App Router (layouts & pages)
    ├── components/        # Reusable React UI components
    ├── hooks/             # Custom React hooks
    ├── lib/               # Utilities, API wrappers, i18n
    ├── styles/            # Global CSS
    └── types/             # TypeScript type definitions
```

---

## Backend Details

### Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Task Scheduler**: node-cron (custom wrapper in `services/schedulerService.js`)
- **Cleanup**: Periodic cleanup service in `services/cleanupService.js`
- **Next.js Integration**: Serves frontend pages via Next.js handler in `server.js`.

### Configuration

- `.env` at backend root defines `MONGODB_URI`, `PORT`, `BACKEND_PORT`, and optional `FRONTEND_URL`.
- `src/config/db.js` reads `MONGODB_URI` and connects to MongoDB.

### Initialization & Entry Point (`server.js`)

1. Load environment variables
2. Connect to database
3. Initialize Express and logging middleware
4. Prepare Next.js app from `frontend` directory
5. Configure CORS and JSON parsing
6. Mount API routes under `/api/...`
7. Fallback to Next.js for all other routes
8. Start Express server and background tasks (scheduler & cleanup)

### Adding a New API Route

1. **Route Definition**: Create a new file in `src/routes`, e.g. `newFeatureRoutes.js`, and export an Express router.
2. **Controller**: Implement handler functions in `src/controllers/newFeatureController.js`.
3. **Model (Optional)**: Add a Mongoose schema in `src/models` if you need database persistence.
4. **Service (Optional)**: Encapsulate business logic or third-party integrations in `src/services`.
5. **Register Route**: In `server.js`, add:
   ```js
   const newFeatureRoutes = require('./routes/newFeatureRoutes');
   app.use('/api/new-feature', newFeatureRoutes);
   ```
6. **Test**: Write automated tests or use Postman to verify the endpoint.

### Background Services

- **Scheduler**: Jobs configured in `services/schedulerService.js` using `node-cron`. Called once at server start.
- **Cleanup**: Periodic cleanup tasks in `services/cleanupService.js` for temp files or logs.

---

## Frontend Details

### Stack

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: Basic setup in `lib/i18n.ts`, routes under `ja/` for Japanese localization.

### Next.js App Router (`src/app`)

- **Root Layout**: `src/app/layout.tsx`
- **Pages**: Each folder in `src/app` corresponds to a route. E.g., `src/app/products/[slug]/page.tsx` → `/products/:slug`.
- **Nested Layouts**: Use `layout.tsx` files in subfolders for nested UI (e.g., admin area under `src/app/admin/layout.tsx`).

### Adding a New Page

1. **Directory**: Create a new folder under `src/app`, e.g. `my-feature`.
2. **Page Component**: Add `page.tsx` exporting a React component.
3. **Layout (Optional)**: Add `layout.tsx` for custom layout.
4. **Styling**: Use Tailwind classes or add CSS in `styles/`.
5. **Data Fetching**: Use `fetch()` or Next.js `getServerSideProps` (if not in App Router) or React hooks for client-side fetching.

### Internationalization

- Routes under `src/app/ja/` mirror the English routes under `src/app/`.
- Language switcher component in `components/LanguageSwitcher.tsx` updates the locale in the URL.

### Styling

- Global styles in `src/app/globals.css`.
- Tailwind utilities in `tailwind.config.ts`.

---

## Environment Variables

| Key             | Description                     | Required? |
|-----------------|---------------------------------|-----------|
| MONGODB_URI     | MongoDB connection string       | Yes       |
| BACKEND_PORT    | Port on which backend listens   | No (default: 5000)
| FRONTEND_URL    | Frontend origin for CORS allow  | No
| NODE_ENV        | `development` or `production`   | No (`development` default)

---

## Scripts & Deployment

- **backend/package.json**
  - `npm start`: Runs `node src/server.js` in production
  - `npm run dev`: Runs `nodemon src/server.js` in development
- **frontend/package.json**
  - `npm run dev`: Runs Next.js dev server
  - `npm run build`: Builds for production
  - `npm start`: Runs Next.js production server

Deployment can be orchestrated with `startup.sh` or via `Procfile` for Heroku.

---

## Testing & Linting

- **ESLint**: Configured in `frontend/eslint.config.mjs`.
- **Backend Tests**: Add tests using Jest or Mocha under `backend/tests`.

---

## Useful Tips

- **AI Assistant Integration**: Refer to this guide when instructing AI to add routes, controllers, pages, or services.
- **Consistency**: Follow existing folder naming and coding conventions.
- **Error Handling**: Use the `errorService` in backend to standardize error responses.
- **Version Control**: Branch from `main`, create PRs for features, include updates to this guide if new patterns emerge.

---

*End of Guide*
