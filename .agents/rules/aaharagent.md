---
trigger: always_on
---

Always use TypeScript — no .js files in frontend
Use app/ Router only — no Pages Router patterns
Server Components by default — add "use client" only when needed (forms, state, socket)
All API calls go through lib/api.ts — never fetch directly in components
Route groups in parentheses for each portal — (owner), (admin) etc.
Auth middleware in middleware.ts at root — redirects unauthenticated users
Only Tailwind classes for styling — no inline styles, no CSS modules
All forms use React Hook Form + Zod — never uncontrolled inputs
Every page must have a loading.tsx and error.tsx sibling
Images through next/image only — never <img> tags
Types in types/index.ts — shared between all components
Mock data in lib/mock/ — swap for API calls later in one place