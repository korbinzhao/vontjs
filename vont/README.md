# @vont/core

> 🚀 A modern full-stack TypeScript framework combining Koa and React with file-based routing and hot module replacement

## Features

- 📁 **File-based Routing** - Automatic API and page routes based on file structure
- 🔥 **Hot Module Replacement** - Instant feedback during development
- ⚙️ **Zero Configuration** - Convention over configuration
- 🔤 **TypeScript First** - Full type safety across your entire stack
- 📡 **REST API Routes** - Simple function exports become API endpoints
- ⚛️ **React Pages** - File structure becomes page routes
- 🎯 **Type Safety** - Share types between frontend and backend
- 🏗️ **Production Ready** - Single unified deployment

## Installation

### In an existing project

```bash
npm install @vont/core --save-dev
```

### Using file protocol (for local development)

```bash
# In your package.json
{
  "devDependencies": {
    "@vont/core": "file:./vont"
  }
}
```

## Quick Start

### 1. Update your `package.json`

```json
{
  "scripts": {
    "dev": "vont dev",
    "build": "vont build",
    "start": "vont start"
  }
}
```

### 2. Project Structure

```
your-project/
├── src/
│   ├── api/              # Backend API routes
│   │   ├── users.ts      # GET/POST /api/users
│   │   └── users/
│   │       └── [id].ts   # GET/PUT /api/users/:id
│   ├── pages/            # Frontend pages
│   │   ├── index.tsx     # GET /
│   │   ├── about.tsx     # GET /about
│   │   └── users.tsx     # GET /users
│   └── types/            # Shared types
│       └── api.ts
└── vite.config.ts        # Vite configuration
```

### 3. Create an API Route

```typescript
// src/api/users.ts
import type { Context } from 'koa';

export const get = async (ctx: Context) => {
  ctx.body = { users: [] };
};

export const post = async (ctx: Context) => {
  const { name } = ctx.request.body;
  ctx.body = { id: 1, name };
  ctx.status = 201;
};
```

### 4. Create a Page

```typescript
// src/pages/users.tsx
import React from 'react';

const UsersPage = () => {
  return <div>Users Page</div>;
};

export default UsersPage;
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## CLI Commands

### `vont dev`

Start development server with hot module replacement

```bash
vont dev
vont dev --port 4000
vont dev --host 0.0.0.0
```

Options:
- `--port <port>` - Server port (default: 3000)
- `--host <host>` - Server host (default: 0.0.0.0)
- `--open` - Open browser automatically

### `vont build`

Build project for production

```bash
vont build
vont build --outDir dist
```

Options:
- `--outDir <dir>` - Output directory (default: dist)
- `--mode <mode>` - Build mode (default: production)

### `vont start`

Start production server

```bash
vont start
vont start --port 4000
```

Options:
- `--port <port>` - Server port (default: 3000)
- `--host <host>` - Server host (default: 0.0.0.0)

## API Documentation

### File-based Routing

#### API Routes

Files in `src/api/` automatically become API endpoints:

| File | Route |
|------|-------|
| `users.ts` | `/api/users` |
| `users/[id].ts` | `/api/users/:id` |
| `posts/[id]/comments.ts` | `/api/posts/:id/comments` |

#### HTTP Methods

Export functions named after HTTP methods:

```typescript
export const get = async (ctx) => { /* GET handler */ };
export const post = async (ctx) => { /* POST handler */ };
export const put = async (ctx) => { /* PUT handler */ };
export const delete = async (ctx) => { /* DELETE handler */ };
export const patch = async (ctx) => { /* PATCH handler */ };
```

#### Middleware

Export a `middleware` array to apply middleware to all routes in the file:

```typescript
import type { Context, Next } from 'koa';

export const middleware = [
  async (ctx: Context, next: Next) => {
    // Authentication middleware
    await next();
  }
];

export const get = async (ctx: Context) => {
  // This route is protected by the middleware
  ctx.body = { protected: true };
};
```

### Configuration

#### `vite.config.ts`

```typescript
import { defineVontConfig } from '@vont/core/config';

export default defineVontConfig({
  port: 3000,
  host: '0.0.0.0',
  apiPrefix: '/api',
  vite: {
    // Custom Vite configuration
    plugins: [],
  },
});
```

### Type Safety

Share types between frontend and backend:

```typescript
// src/types/api.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

// src/api/users.ts
import type { User } from '../types/api';

export const get = async (ctx: Context) => {
  const users: User[] = [];
  ctx.body = { data: users };
};

// src/pages/users.tsx
import type { User } from '@/types/api';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  // ...
};
```

## Programmatic API

### `createDevServer(options)`

Create a development server programmatically:

```typescript
import { createDevServer } from '@vont/core';

const server = await createDevServer({
  port: 3000,
  host: '0.0.0.0',
  hmrPort: 3001,
});
```

### `build(options)`

Build project programmatically:

```typescript
import { build } from '@vont/core';

await build({
  root: process.cwd(),
  outDir: 'dist',
});
```

### `createProdServer(options)`

Create a production server programmatically:

```typescript
import { createProdServer } from '@vont/core';

const server = await createProdServer({
  port: 3000,
  host: '0.0.0.0',
});
```

## Examples

### Dynamic Routes

```typescript
// src/api/posts/[id].ts
export const get = async (ctx: Context) => {
  const { id } = ctx.params;
  ctx.body = { id, title: 'Post Title' };
};
```

### Query Parameters

```typescript
// src/api/search.ts
export const get = async (ctx: Context) => {
  const { q, page = '1' } = ctx.query;
  ctx.body = { query: q, page: parseInt(page as string) };
};
```

### Request Body

```typescript
// src/api/users.ts
export const post = async (ctx: Context) => {
  const { name, email } = ctx.request.body;
  ctx.body = { id: 1, name, email };
  ctx.status = 201;
};
```

## Development

### Hot Reload Features

- **Frontend HMR** - React Fast Refresh for instant component updates
- **CSS Hot Update** - Style changes apply immediately
- **Backend Auto-Restart** - Server restarts automatically (1-2s)
- **API Hot Reload** - API routes reload dynamically (1-2s)

### Performance

| Feature | Before | After |
|---------|--------|-------|
| Startup Time | 10-30s | < 2s |
| Frontend Updates | Manual refresh | HMR (instant) |
| Backend Updates | Manual restart | Auto-restart (1-2s) |
| API Updates | Manual restart | Hot reload (1-2s) |

## License

MIT

## Links

- [GitHub](https://github.com/yourusername/vont)
- [Documentation](https://vont.dev)
- [Examples](https://github.com/yourusername/vont/tree/main/examples)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

