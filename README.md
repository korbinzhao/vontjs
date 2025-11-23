# vont

> 🚀 A lightweight full-stack TypeScript framework combining Koa and React/Vue with file-based routing and hot module replacement

[![npm version](https://img.shields.io/npm/v/vont.svg)](https://www.npmjs.com/package/vont)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 📁 **File-based Routing** - Automatic API and page routes based on file structure
- 🔥 **Hot Module Replacement** - Instant feedback during development
- ⚙️ **Zero Configuration** - Convention over configuration
- 🔤 **TypeScript First** - Full type safety across your entire stack
- 📡 **REST API Routes** - Simple function exports become API endpoints
- ⚛️ **React & Vue Support** - Choose your preferred frontend framework
- 🎯 **Type Safety** - Share types between frontend and backend
- 🏗️ **Production Ready** - Single unified deployment
- 🔒 **Clean Architecture** - Internal files hidden in `.vont/` directory
- ⚡ **Vite 7 Powered** - Lightning-fast builds and HMR

## 🚀 Quick Start

### Create a New Project

Vont provides an interactive CLI to scaffold new projects with ease:

#### Interactive Mode (Recommended)

```bash
# Using npx (no installation needed)
npx vont create

# Or install globally first
npm install -g vont
vont create
```

**Interactive Setup:**

```
? Project name: › my-awesome-app
? Select a framework: › - Use arrow-keys. Return to submit.
❯ React
  Vue
```

1. **Enter project name** - Type your project name (validated for valid characters)
2. **Select framework** - Use ↑↓ arrow keys to choose, press Enter to confirm
3. **Done!** - Vont creates your project with all necessary files

#### Non-Interactive Mode

For automation or when you know what you want:

```bash
# With project name (will prompt for framework)
vont create my-app

# Fully non-interactive (CI/CD friendly)
vont create my-app --template react-ts
vont create my-app --template vue-ts

# Flexible argument order
vont create --template react-ts my-app
```

**Supported Formats:**
- `--template=react-ts` (equals sign)
- `--template react-ts` (space separated)

#### Next Steps

```bash
cd my-app
npm install
npm run dev
```

Visit `http://localhost:3000` 🎉

**What You Get:**
- ✅ Complete project structure
- ✅ TypeScript configuration
- ✅ Vite development server
- ✅ Hot Module Replacement
- ✅ Example pages and API routes
- ✅ Type-safe API client

### Add to Existing Project

```bash
npm install vont --save-dev
```

Update your `package.json`:

```json
{
  "scripts": {
    "dev": "vont dev",
    "build": "vont build",
    "start": "vont start"
  }
}
```

## 📖 Documentation

### Table of Contents

- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Page Routes](#page-routes)
- [Configuration](#configuration)
- [CLI Commands](#cli-commands)
- [Deployment](#deployment)
- [Examples](#examples)

## 📁 Project Structure

## 📁 Project Structure

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

### 2. File Structure

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
│   ├── styles/           # Stylesheets
│   │   └── app.css
│   └── types/            # Shared types
│       └── api.ts
├── .vont/                # Framework internal files (auto-generated, git-ignored)
│   └── client.tsx        # Generated client entry (don't edit)
├── index.html            # HTML entry (optional)
├── vont.config.ts        # Vont configuration (optional)
├── .gitignore            # Should include .vont/
└── package.json
```

> **Important**: Add `.vont/` to your `.gitignore`:
> ```gitignore
> # Vont Framework generated files
> .vont/
> ```

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

## 🛠️ CLI Commands

### `vont create`

Create a new Vont project with interactive prompts or command-line options.

**Interactive Mode:**
```bash
vont create
```

**Quick Mode:**
```bash
vont create <project-name>              # Prompts for template
vont create <project-name> --template <template>  # Fully automated
```

**Available Templates:**
- `react-ts` - React + TypeScript + React Router
- `vue-ts` - Vue 3 + TypeScript + Vue Router

**Examples:**
```bash
# Interactive (recommended for first-time users)
vont create

# With project name only
vont create my-project

# Fully automated (great for scripts/CI)
vont create my-app --template react-ts
vont create my-vue-app --template vue-ts

# Flexible syntax
vont create --template react-ts my-app
vont create --template=vue-ts my-app
```

**Project Name Rules:**
- ✅ Letters, numbers, hyphens, underscores
- ❌ Spaces, special characters

---

### `vont dev`

Start development server with hot module replacement.

**Basic Usage:**
```bash
npm run dev
# or
vont dev
```

**With Options:**
```bash
vont dev --port 4000              # Custom port
vont dev --host 0.0.0.0          # Custom host
vont dev --port 4000 --host localhost --open
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--port <number>` | Server port | `3000` |
| `--host <string>` | Server host | `0.0.0.0` |
| `--open` | Open browser automatically | `false` |

**Environment Variables:**
```bash
PORT=4000 HMR_PORT=4001 vont dev
```

**What Happens:**
- ✅ API routes are compiled and served
- ✅ Frontend served with Vite HMR
- ✅ File watching enabled
- ✅ Hot reload on changes
- ✅ WebSocket for instant updates

**Access:**
- Frontend: `http://localhost:3000`
- API: `http://localhost:3000/api/*`
- HMR: `ws://localhost:3001`

---

### `vont build`

Build project for production.

**Basic Usage:**
```bash
npm run build
# or
vont build
```

**With Options:**
```bash
vont build --outDir dist          # Custom output directory
vont build --mode production      # Build mode
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--outDir <dir>` | Output directory | `dist` |
| `--mode <mode>` | Build mode | `production` |

**Output Structure:**
```
dist/
├── client/              # Frontend assets
│   ├── assets/          # JS/CSS bundles
│   │   ├── index-*.js
│   │   └── index-*.css
│   └── index.html       # Entry HTML
├── server/              # Server code
│   └── index.js         # Production server
└── api/                 # API routes
    ├── users.js
    └── users/
        └── [id].js
```

**Build Features:**
- ✅ TypeScript compilation
- ✅ Code minification
- ✅ Tree shaking
- ✅ Source maps
- ✅ Asset optimization

---

### `vont start`

Start production server.

**Basic Usage:**
```bash
npm run start
# or
vont start
```

**With Options:**
```bash
vont start --port 8080           # Custom port
vont start --host 0.0.0.0        # Custom host
PORT=8080 vont start             # Using environment variable
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--port <number>` | Server port | `3000` |
| `--host <string>` | Server host | `0.0.0.0` |

**Prerequisites:**
- Must run `vont build` first
- `dist/` directory must exist

**Production Features:**
- ✅ Serves static files from `dist/client`
- ✅ Handles API routes from `dist/api`
- ✅ Optimized for performance
- ✅ No HMR overhead

---

## 🎯 Complete Workflow Example

### 1. Create Project

```bash
# Interactive creation
npx vont create
? Project name: › my-fullstack-app
? Select a framework: › React

cd my-fullstack-app
npm install
```

### 2. Development

```bash
# Start development server
npm run dev
```

**Create an API route:** `src/api/todos.ts`
```typescript
import type { Context } from 'koa';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const todos: Todo[] = [];

export const get = async (ctx: Context) => {
  ctx.body = { data: todos };
};

export const post = async (ctx: Context) => {
  const { title } = ctx.request.body as { title: string };
  const todo: Todo = {
    id: Date.now(),
    title,
    completed: false,
  };
  todos.push(todo);
  ctx.body = { data: todo };
  ctx.status = 201;
};
```

**Create a page:** `src/pages/todos.tsx`
```typescript
import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const TodosPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await fetch('/api/todos');
    const { data } = await res.json();
    setTodos(data);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const { data } = await res.json();
    setTodos([...todos, data]);
    setTitle('');
  };

  return (
    <div>
      <h1>Todos</h1>
      <form onSubmit={addTodo}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New todo"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default TodosPage;
```

**Access:**
- Page: `http://localhost:3000/todos`
- API: `http://localhost:3000/api/todos`

### 3. Build for Production

```bash
npm run build
```

### 4. Deploy

```bash
# Test production locally
npm run start

# Or deploy to your server
scp -r dist/ user@server:/app
ssh user@server "cd /app && PORT=80 node dist/server/index.js"
```

---

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

Vont follows a **zero-configuration** approach - it works out of the box without any configuration file. However, you can customize behavior through configuration files when needed.

#### Configuration Files

Vont automatically looks for configuration files in the following order:

1. `vont.config.ts` (recommended)
2. `vont.config.js`
3. `vont.config.mjs`

If no configuration file is found, Vont uses sensible defaults.

#### Basic Configuration (`vont.config.ts`)

```typescript
import { defineConfig } from 'vont';

export default defineConfig({
  // Server settings
  port: 3000,
  host: '0.0.0.0',
  
  // API configuration
  apiPrefix: '/api',
  apiDir: './src/api',
  
  // Pages configuration
  pagesDir: './src/pages',
  
  // Output directory
  outDir: './dist',
});
```

#### Advanced Configuration

```typescript
import { defineConfig } from 'vont';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Basic settings
  port: 4000,
  host: '0.0.0.0',
  apiPrefix: '/api/v1',
  
  // Complete Vite configuration (use native Vite config)
  viteConfig: {
    plugins: [
      ...tailwindcss(),
      ...react(),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  },
  
  // Server configuration
  server: {
    hmrPort: 3001,
    middlewares: [
      // Custom Koa middlewares
    ],
  },
  
  // Build configuration
  build: {
    sourcemap: true,
    minify: true,
    target: 'es2020',
  },
});
```

#### JavaScript Configuration (`vont.config.js`)

```javascript
export default {
  port: 3000,
  apiPrefix: '/api',
  viteConfig: {
    plugins: [],
  },
};
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `3000` | Server port |
| `host` | `string` | `'0.0.0.0'` | Server host |
| `apiPrefix` | `string` | `'/api'` | API route prefix |
| `apiDir` | `string` | `'src/api'` | API directory path |
| `pagesDir` | `string` | `'src/pages'` | Pages directory path |
| `outDir` | `string` | `'dist'` | Build output directory |
| `viteConfig` | `ViteConfig` | `{}` | Complete Vite configuration (including plugins) |
| `server.hmrPort` | `number` | `3001` | HMR WebSocket port |
| `server.middlewares` | `Middleware[]` | `[]` | Custom Koa middlewares |
| `build.sourcemap` | `boolean` | `true` | Generate sourcemaps |
| `build.minify` | `boolean` | `true` | Minify output |
| `build.target` | `string` | `'es2020'` | Build target |

#### Environment Variables

You can also configure Vont using environment variables:

```bash
PORT=4000 vont dev
HOST=localhost vont dev
HMR_PORT=4001 vont dev
```

#### Built-in Vite Configuration

Vont provides sensible defaults for Vite configuration, so you **don't need a separate `vite.config.ts`** file. All Vite settings are managed through the `viteConfig` field in `vont.config.ts`:

**Default Vite Configuration:**

- ✅ `server.middlewareMode: true` - For Koa integration
- ✅ `server.hmr.port` - Automatically set from config
- ✅ `server.watch.usePolling: false` - Optimized file watching
- ✅ `build.outDir: 'dist/client'` - Client output directory
- ✅ `build.rollupOptions.input: 'index.html'` - Entry point
- ✅ `resolve.alias['@']: '/src'` - Path alias
- ✅ `optimizeDeps.include: ['react', 'react-dom', 'react-router-dom']` - Pre-bundle dependencies

**Use Native Vite Configuration:**

```typescript
// vont.config.ts
import { defineConfig } from 'vont';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  port: 3000,
  
  // Use complete native Vite configuration
  viteConfig: {
    // Vite plugins (use native Vite plugin config)
    plugins: [
      ...tailwindcss(),
      ...react(),
    ],
    
    // Add or override any Vite configuration
    resolve: {
      alias: {
        '@components': '/src/components',
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});
```

> **Note**: You no longer need to install `vite` as a project dependency. Vont includes it internally.

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

### Development Server

#### `createDevServer(options)`

Create a development server programmatically:

```typescript
import { createDevServer } from 'vont';

await createDevServer({
  root: process.cwd(),
  port: 3000,
  host: '0.0.0.0',
  hmrPort: 3001,
  apiDir: './src/api',
  pagesDir: './src/pages',
});
```

**Options:**
- `root` - Project root directory
- `port` - Server port
- `host` - Server host
- `hmrPort` - Hot Module Replacement port
- `apiDir` - API routes directory
- `pagesDir` - Pages directory
- `apiPrefix` - API route prefix

### Production Server

#### `createProdServer(options)` / `startProductionServer(options)`

Create a production server programmatically:

```typescript
import { createProdServer } from 'vont';
// or
import { startProductionServer } from 'vont';

await createProdServer({
  root: process.cwd(),
  port: 3000,
  host: '0.0.0.0',
});
```

**Options:**
- `root` - Project root directory
- `port` - Server port
- `host` - Server host
- `apiDir` - API routes directory (compiled)
- `apiPrefix` - API route prefix

### Build

#### `buildProject(options)`

Build project programmatically:

```typescript
import { buildProject } from 'vont';

await buildProject({
  root: process.cwd(),
  outDir: 'dist',
  apiDir: './src/api',
});
```

**Options:**
- `root` - Project root directory
- `outDir` - Output directory
- `apiDir` - API routes directory
- `serverDir` - Server output directory

### Configuration Loader

#### `loadConfig(rootDir)`

Load Vont configuration from project:

```typescript
import { loadConfig } from 'vont';

const config = await loadConfig(process.cwd());
console.log(config.port); // 3000
```

#### `defineConfig(config)`

Type-safe configuration helper:

```typescript
import { defineConfig } from 'vont';

export default defineConfig({
  port: 3000,
  // Full TypeScript autocompletion
});
```

## Examples

### Dynamic Routes

```typescript
// src/api/posts/[id].ts
import type { Context } from 'koa';

export const get = async (ctx: Context) => {
  const { id } = ctx.params;
  ctx.body = { id, title: 'Post Title' };
};

export const put = async (ctx: Context) => {
  const { id } = ctx.params;
  const { title } = ctx.request.body;
  ctx.body = { id, title };
};

export const delete = async (ctx: Context) => {
  const { id } = ctx.params;
  ctx.status = 204; // No Content
};
```

### Query Parameters

```typescript
// src/api/search.ts
import type { Context } from 'koa';

export const get = async (ctx: Context) => {
  const { q, page = '1', limit = '10' } = ctx.query;
  
  ctx.body = {
    query: q,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    results: [],
  };
};
```

### Request Body

```typescript
// src/api/users.ts
import type { Context } from 'koa';

export const post = async (ctx: Context) => {
  const { name, email } = ctx.request.body;
  
  // Validation
  if (!name || !email) {
    ctx.status = 400;
    ctx.body = { error: 'Name and email are required' };
    return;
  }
  
  // Create user
  const user = { id: Date.now(), name, email };
  ctx.body = user;
  ctx.status = 201;
};
```

### Error Handling

```typescript
// src/api/users/[id].ts
import type { Context } from 'koa';

export const get = async (ctx: Context) => {
  const { id } = ctx.params;
  
  try {
    // Fetch user from database
    const user = await db.users.findById(id);
    
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }
    
    ctx.body = user;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
    console.error(error);
  }
};
```

### Authentication Middleware

```typescript
// src/api/protected.ts
import type { Context, Next } from 'koa';

// Authentication middleware
export const middleware = [
  async (ctx: Context, next: Next) => {
    const token = ctx.headers.authorization?.split(' ')[1];
    
    if (!token) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized' };
      return;
    }
    
    try {
      // Verify token
      ctx.state.user = await verifyToken(token);
      await next();
    } catch (error) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid token' };
    }
  },
];

// Protected route
export const get = async (ctx: Context) => {
  ctx.body = {
    message: 'Protected data',
    user: ctx.state.user,
  };
};
```

### Nested Dynamic Routes

```typescript
// src/api/posts/[postId]/comments/[commentId].ts
import type { Context } from 'koa';

export const get = async (ctx: Context) => {
  const { postId, commentId } = ctx.params;
  ctx.body = {
    postId,
    commentId,
    content: 'Comment content',
  };
};
```

### File Upload

```typescript
// src/api/upload.ts
import type { Context } from 'koa';
import formidable from 'formidable';

export const post = async (ctx: Context) => {
  const form = formidable({ multiples: true });
  
  const [fields, files] = await form.parse(ctx.req);
  
  ctx.body = {
    fields,
    files,
  };
};
```

## Development

### Hot Reload Features

Vont provides comprehensive hot reload capabilities for both frontend and backend:

- **Frontend HMR** - React Fast Refresh for instant component updates
- **CSS Hot Update** - Style changes apply immediately without page refresh
- **Backend Auto-Restart** - Server restarts automatically when server code changes
- **API Hot Reload** - API routes reload dynamically without full server restart
- **TypeScript Support** - Full TypeScript hot reload with `tsx` loader

### Development Workflow

```bash
# Start development server
npm run dev

# Development server starts at http://localhost:3000
# HMR WebSocket at ws://localhost:3001

# Make changes to:
# - src/pages/*.tsx -> React Fast Refresh (instant)
# - src/styles/*.css -> CSS hot update (instant)
# - src/api/*.ts -> API hot reload (~500ms)
# - src/server/*.ts -> Server restart (~1-2s)
```

### Performance

| Feature | Traditional Approach | Vont |
|---------|---------------------|------|
| Startup Time | 10-30s (build + start) | < 2s (direct execution) |
| Frontend Updates | Manual refresh | HMR (instant) |
| CSS Changes | Full reload | Hot update (instant) |
| Backend Updates | Manual restart (~10s) | Auto-restart (~1-2s) |
| API Updates | Manual restart (~10s) | Hot reload (~500ms) |

### Debug Tips

#### Enable Verbose Logging

```bash
# Show detailed logs
DEBUG=vont:* npm run dev
```

#### TypeScript Errors

```bash
# Type checking (no emit)
npm run type-check

# Watch mode
tsc --noEmit --watch
```

#### Port Conflicts

```bash
# Use different ports
PORT=4000 HMR_PORT=4001 npm run dev
```

#### API Hot Reload Not Working

- Ensure API files are in `src/api/` directory
- Check file naming follows convention (`.ts` extension)
- Verify exports are named correctly (`get`, `post`, etc.)

#### HMR Not Working

- Check if port 3001 is available (or custom `hmrPort`)
- Verify Vite configuration has `middlewareMode: true`
- Check browser console for WebSocket errors

## Deployment

### Building for Production

```bash
npm run build
```

This generates:
```
dist/
├── client/          # Frontend assets (served by Koa)
│   ├── assets/
│   └── index.html
├── server/          # Compiled server
│   └── index.js
└── api/             # Compiled API routes
    └── users.js
```

> **Note**: The `.vont/` directory is automatically cleaned up after build and should not be included in production deployments.

### Starting Production Server

```bash
npm run start

# Or with custom settings
PORT=8080 npm run start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY dist ./dist

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/server/index.js"]
```

### Environment Variables

```bash
# .env.production
PORT=8080
HOST=0.0.0.0
NODE_ENV=production
```

### Nginx Reverse Proxy

```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## Troubleshooting

### Common Issues

#### Module not found errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build fails

```bash
# Check TypeScript errors
npm run type-check

# Clean build and retry
rm -rf dist
npm run build
```

#### API routes not working

- Verify file structure matches convention
- Check exports are named correctly
- Ensure `apiPrefix` in config matches requests
- Check server logs for route registration

#### 404 on page routes

- Verify page files are in `src/pages/`
- Check file exports default React component
- Ensure no TypeScript errors in page files

### Getting Help

- Check [Documentation](https://vont.dev)
- Search [GitHub Issues](https://github.com/yourusername/vont/issues)
- Join [Discord Community](https://discord.gg/vont)

## FAQ

**Q: Do I need both `vont.config.ts` and `vite.config.ts`?**  
A: No, `vont.config.ts` is sufficient for most cases. Use `vite.config.ts` only for advanced Vite-specific features.

**Q: What is the `.vont/` directory?**  
A: It's an auto-generated directory containing framework internal files (like `client.tsx`). It's automatically created during development and cleaned up when not needed. Always add it to your `.gitignore`.

**Q: Can I edit files in `.vont/` directory?**  
A: No, don't edit these files manually. They are auto-generated by Vont and will be overwritten. If you need to customize client behavior, use `vont.config.ts`.

**Q: Can I use other CSS frameworks?**  
A: Yes! Vont works with any CSS solution: CSS Modules, Styled Components, Emotion, Tailwind CSS, etc.

**Q: Does Vont support Server-Side Rendering (SSR)?**  
A: Not yet. Vont currently focuses on SPA with API routes. 

**Q: Can I deploy to serverless platforms?**  
A: Not recommended. Vont uses file-based routing which requires a Node.js server. Best deployed on traditional hosting (VPS, Docker, etc.).

**Q: How do I add database support?**  
A: Install your preferred ORM/database client and use it in API routes:
```typescript
import { db } from '@/lib/db';

export const get = async (ctx) => {
  const users = await db.users.findMany();
  ctx.body = { users };
};
```

};
```

## 💡 Best Practices & Tips

### Project Organization

**Recommended Structure:**
```
src/
├── api/                   # Backend API routes
│   ├── auth/
│   │   ├── login.ts      # POST /api/auth/login
│   │   └── logout.ts     # POST /api/auth/logout
│   ├── users/
│   │   ├── index.ts      # GET/POST /api/users
│   │   └── [id].ts       # GET/PUT/DELETE /api/users/:id
│   └── posts/
│       └── [id]/
│           └── comments.ts # GET /api/posts/:id/comments
├── pages/                 # Frontend pages
│   ├── index.tsx         # Home page
│   ├── about.tsx         # About page
│   ├── users.tsx         # Users list
│   └── users/
│       └── [id].tsx      # User detail (future feature)
├── components/            # Shared React/Vue components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Button.tsx
├── lib/                   # Utility functions
│   ├── api.ts            # API client
│   ├── auth.ts           # Auth helpers
│   └── utils.ts          # Common utilities
├── types/                 # TypeScript types
│   ├── api.ts            # API types
│   └── models.ts         # Data models
└── styles/               # CSS files
    ├── app.css           # Global styles
    └── components.css    # Component styles
```

### Type Safety Tips

**Share types between frontend and backend:**

```typescript
// src/types/api.ts
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// src/api/users.ts
import type { Context } from 'koa';
import type { User, ApiResponse } from '../types/api';

export const get = async (ctx: Context) => {
  const users: User[] = await db.users.findMany();
  const response: ApiResponse<User[]> = { data: users };
  ctx.body = response;
};

// src/pages/users.tsx
import type { User, ApiResponse } from '@/types/api';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  
  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const json: ApiResponse<User[]> = await res.json();
    setUsers(json.data);
  };
};
```

### API Development Tips

**1. Use Middleware for Common Logic:**

```typescript
// src/api/auth/middleware.ts
import type { Context, Next } from 'koa';

export const authMiddleware = async (ctx: Context, next: Next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized' };
    return;
  }
  
  try {
    ctx.state.user = await verifyToken(token);
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid token' };
  }
};

// src/api/protected-route.ts
import { authMiddleware } from './auth/middleware';

export const middleware = [authMiddleware];

export const get = async (ctx: Context) => {
  const user = ctx.state.user;
  ctx.body = { data: `Hello ${user.name}` };
};
```

**2. Error Handling Pattern:**

```typescript
// src/lib/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(message);
  }
}

// src/api/users/[id].ts
import { ApiError } from '@/lib/errors';

export const get = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const user = await db.users.findById(id);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    ctx.body = { data: user };
  } catch (error) {
    if (error instanceof ApiError) {
      ctx.status = error.status;
      ctx.body = { error: error.message };
    } else {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
      console.error(error);
    }
  }
};
```

**3. Request Validation:**

```typescript
// src/api/users.ts
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(18).optional(),
});

export const post = async (ctx: Context) => {
  try {
    const data = createUserSchema.parse(ctx.request.body);
    const user = await db.users.create(data);
    ctx.body = { data: user };
    ctx.status = 201;
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.status = 400;
      ctx.body = { error: 'Validation failed', details: error.errors };
    } else {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  }
};
```

### Frontend Development Tips

**1. Create a Type-Safe API Client:**

```typescript
// src/lib/api.ts
export class ApiClient {
  private baseUrl = '/api';

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Add put, delete, patch methods...
}

export const api = new ApiClient();

// Usage in components
import { api } from '@/lib/api';
import type { ApiResponse, User } from '@/types/api';

const users = await api.get<ApiResponse<User[]>>('/users');
```

**2. Environment Variables:**

```typescript
// vite.config.ts (if needed)
export default defineConfig({
  define: {
    'import.meta.env.API_URL': JSON.stringify(process.env.API_URL),
  },
});

// Usage
const apiUrl = import.meta.env.API_URL || '/api';
```

### Performance Optimization

**1. Code Splitting:**

```typescript
// src/pages/index.tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));

export default () => (
  <Suspense fallback={<div>Loading...</div>}>
    <HeavyComponent />
  </Suspense>
);
```

**2. API Response Caching:**

```typescript
// src/lib/cache.ts
const cache = new Map<string, { data: unknown; expires: number }>();

export async function cachedFetch<T>(
  url: string,
  ttl: number = 60000
): Promise<T> {
  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }

  const res = await fetch(url);
  const data = await res.json();
  cache.set(url, { data, expires: Date.now() + ttl });
  return data;
}
```

### Development Workflow

**1. Hot Reload Workflow:**
```bash
# Terminal 1: Development server
npm run dev

# Terminal 2: Type checking (optional)
tsc --noEmit --watch

# Make changes to:
# - src/api/*.ts -> API reloads (~500ms)
# - src/pages/*.tsx -> HMR (~50ms)
# - src/styles/*.css -> HMR (~50ms)
```

**2. Pre-commit Checks:**

```json
// package.json
{
  "scripts": {
    "dev": "vont dev",
    "build": "vont build",
    "start": "vont start",
    "type-check": "tsc --noEmit",
    "lint": "eslint src/",
    "test": "vitest",
    "precommit": "npm run type-check && npm run lint"
  }
}
```

### Common Patterns

**1. Protected Routes (Frontend):**

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

// Usage
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

**2. File Upload:**

```typescript
// src/api/upload.ts
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const post = async (ctx: Context) => {
  const form = formidable({ uploadDir: './uploads', keepExtensions: true });
  const [fields, files] = await form.parse(ctx.req);
  
  ctx.body = { 
    data: { 
      filename: files.file[0].originalFilename,
      path: files.file[0].filepath 
    } 
  };
};
```

**3. Database Integration:**

```typescript
// src/lib/db.ts (Prisma example)
import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

// src/api/users.ts
import { db } from '@/lib/db';

export const get = async (ctx: Context) => {
  const users = await db.user.findMany();
  ctx.body = { data: users };
};
```

---

## Roadmap

### Completed ✅
- [x] File-based routing for API and pages
- [x] Hot Module Replacement (HMR)
- [x] TypeScript support
- [x] React and Vue support
- [x] **CLI project scaffolding (`vont create`)** - ⭐ New!
- [x] Interactive project creation
- [x] Production build optimization
- [x] Zero-configuration setup

### In Progress 🚧
- [ ] Server-Side Rendering (SSR)
- [ ] API route middleware composition improvements
- [ ] Built-in authentication helpers

### Planned 📋
- [ ] Database adapters (Prisma, Drizzle integration)
- [ ] Plugin system
- [ ] WebSocket support
- [ ] GraphQL support
- [ ] Deployment adapters (Vercel, Cloudflare, Docker)
- [ ] CLI enhancements (migration tools, generators)
- [ ] Testing utilities
- [ ] Documentation site

## License

MIT

## Links

- [GitHub](https://github.com/yourusername/vont)
- [Documentation](https://vont.dev)
- [Examples](https://github.com/yourusername/vont/tree/main/examples)
- [Discord Community](https://discord.gg/vont)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## Acknowledgments

Built with:
- [Koa](https://koajs.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [Vite](https://vitejs.dev/) - Build tool
- [esbuild](https://esbuild.github.io/) - API compiler
- [TypeScript](https://www.typescriptlang.org/) - Type safety

