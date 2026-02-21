# Tars Live Chat

Real-time 1:1 chat built with Next.js App Router, TypeScript, Convex, and Clerk.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Convex project and run the dev server:

```bash
npx convex dev
```

3. Create a Clerk application and set a JWT template (e.g. `convex`).

4. Create `.env.local` with:

```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_JWT_ISSUER_DOMAIN=your_clerk_jwt_issuer_domain
CLERK_JWT_TEMPLATE=convex
```

5. Start the app:

```bash
npm run dev
```

## Implemented Features

- Clerk authentication (sign up/in/out).
- User discovery with search.
- 1:1 conversations with real-time messaging.
- Online/offline presence.
- Typing indicator.
- Unread message badges.
- Responsive layout + mobile back navigation.
- Smart auto-scroll.
- Empty + loading states.
