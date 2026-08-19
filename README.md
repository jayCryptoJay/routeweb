# Route Optimizer Elite — Delivery App Source

This package contains only the delivery web application source for the Belleair Bluffs / Largo newspaper route. The CarPlay scaffold, generated build output, dependencies, logs, repository metadata, and temporary files are intentionally excluded.

## Included

The package includes the React mobile-first frontend, Express/tRPC backend, Drizzle schema and migration files, 190-stop route data, server-side geocoding and directions procedures, speech/haptic/wake-lock utilities, and the iPhone Drive Mode workflow.

## Run locally

Install Node.js and pnpm, then run:

```bash
pnpm install
pnpm seed:route
pnpm dev
```

The app expects the platform environment variables used by the Manus full-stack template, including `DATABASE_URL`, OAuth values, and the built-in Maps proxy values. Do not commit secrets into the project.

## Google AI Studio integration

Google AI Studio can help adapt the map layer or generate a Google Maps integration, but the backend should continue to keep geocoding and directions credentials server-side. Preserve the `delivery` and `mobile` tRPC procedures so status changes continue to update the same database route.

## Route integrity

The delivery sequence is locked at 190 stops. The database seed and UI always order stops by `sequenceNumber`; status updates change delivery state without reordering the route.
