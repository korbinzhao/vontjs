# 🚀 Koa React Framework

A full-stack framework combining Koa.js and React for seamless full-stack development. Similar to Next.js but without SSR, enabling you to build both API routes and frontend pages in a single codebase.

## ✨ Features

- **📁 File-based Routing** - Automatic API and page routes based on file structure
- **🔤 TypeScript Support** - Full type safety across your entire stack
- **⚙️ Zero Configuration** - Convention over configuration
- **🔥 HMR Support** - Hot module replacement for instant feedback
- **📡 REST API Routes** - Simple function exports become API endpoints
- **⚛️ React Pages** - File structure becomes page routes
- **🎯 Type Safety** - Share types between frontend and backend
- **🏗️ Production Ready** - Single unified deployment

## 🛠️ Tech Stack

- **Backend**: Koa 2.x
- **Frontend**: React 18.x + React Router 6.x
- **Build**: Vite
- **Language**: TypeScript
- **Package Manager**: npm

## 📦 Installation

```bash
# Install dependencies
npm i --yes --legacy-peer-deps
```

## 🚀 Development

```bash
# Start development server (with hot reload)
npm run dev

# Start with verbose logging
npm run dev:verbose

# Old development mode (full build, for comparison)
npm run dev:old
```

The development server will start at `http://localhost:3000`

### 🔥 Hot Reload Features

The new development mode includes comprehensive hot reload capabilities:

- **Frontend HMR** - React Fast Refresh for instant component updates without losing state
- **CSS Hot Update** - Style changes apply immediately without page refresh
- **Backend Auto-Restart** - Server automatically restarts when backend code changes (1-2s)
- **API Hot Reload** - API routes reload dynamically without full server restart (1-2s)

### Performance Comparison

| Feature | Old Mode | New Mode |
|---------|----------|----------|
| Startup Time | 10-30s | < 2s |
| Frontend Updates | Manual refresh | HMR (instant) |
| CSS Updates | Manual refresh | HMR (instant) |
| Backend Updates | Manual restart | Auto-restart (1-2s) |
| API Updates | Manual restart | Hot reload (1-2s) |

See [HOT_RELOAD_TEST_GUIDE.md](./HOT_RELOAD_TEST_GUIDE.md) for detailed testing instructions.

## 🏗️ Building

```bash
# Build for production
npm run build
```

This will:
1. Compile frontend code with Vite
2. Bundle backend code with esbuild
3. Generate optimized output in `dist/`

## 🎯 Running Production Build

```bash
# Start production server
npm start
```

## 📂 Project Structure

```
project-root/
├── src/
│   ├── api/                    # Backend API routes
│   │   ├── users.ts           # GET /api/users, POST /api/users
│   │   └── users/
│   │       └── [id].ts         # GET /api/users/:id
│   ├── pages/                  # Frontend pages
│   │   ├── index.tsx           # GET /
│   │   ├── about.tsx           # GET /about
│   │   └── users.tsx           # GET /users
│   ├── components/             # React components
│   ├── lib/                    # Utility functions
│   │   └── api.ts             # API client
│   ├── types/                  # TypeScript types
│   │   ├── api.ts             # API types
│   │   └── framework.ts        # Framework types
│   ├── styles/                 # CSS files
│   ├── server/                 # Server-side code
│   ├── client.tsx              # React app entry
│   └── index.html              # HTML template
├── dist/                       # Build output
├── scripts/                    # Build scripts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── FRAMEWORK_SPEC.md          # Full specification

```

## 📖 API Routes

### Creating API Routes

Create files in `src/api/` directory and export HTTP method functions:

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

This automatically creates:
- `GET /api/users`
- `POST /api/users`

### Dynamic Routes

```typescript
// src/api/users/[id].ts
export const get = async (ctx: Context) => {
  const { id } = ctx.params;
  ctx.body = { id, name: 'User' };
};
```

This creates `GET /api/users/:id`

### Query Parameters and Request Body

```typescript
export const get = async (ctx: Context) => {
  const { page = '1' } = ctx.query;
  const pageNum = parseInt(page as string);
  ctx.body = { page: pageNum };
};

export const post = async (ctx: Context) => {
  const { name, email } = ctx.request.body;
  ctx.body = { id: 1, name, email };
};
```

### Middleware

```typescript
// src/api/middleware/auth.ts
export const auth = async (ctx: Context, next: Next) => {
  const token = ctx.headers.authorization?.split(' ')[1];
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized' };
    return;
  }
  await next();
};

// src/api/users.ts
import { auth } from './middleware/auth';

export const middleware = [auth];

export const get = async (ctx: Context) => {
  ctx.body = { users: [] };
};
```

## 🎨 Pages

### Creating Pages

Create React components in `src/pages/`:

```typescript
// src/pages/about.tsx
const About = () => {
  return <div>About Page</div>;
};

export default About;
```

This creates route `GET /about`

### Dynamic Page Routes

```typescript
// src/pages/posts/[id].tsx
import { useParams } from 'react-router-dom';

const PostDetail = () => {
  const { id } = useParams();
  return <div>Post {id}</div>;
};

export default PostDetail;
```

This creates route `GET /posts/:id`

### Calling APIs

```typescript
import { get, post } from '@/lib/api';

const MyPage = () => {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    get('/users').then(setData);
  }, []);

  return <div>{/* render data */}</div>;
};
```

## 🔗 API Client

Use the provided API client in `src/lib/api.ts`:

```typescript
import { get, post, put, del, patch } from '@/lib/api';

// GET request
const users = await get('/users');

// GET with query parameters
const page1 = await get('/users', { params: { page: 1, limit: 10 } });

// POST request
const newUser = await post('/users', { name: 'John', email: 'john@example.com' });

// PUT request
const updated = await put('/users/1', { name: 'John Doe' });

// DELETE request
await del('/users/1');

// PATCH request
const patched = await patch('/users/1', { status: 'active' });
```

## 📝 Type Safety

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
  const [users, setUsers] = React.useState<User[]>([]);
  // ...
};
```

## 🌍 Environment Variables

Create `.env`, `.env.development`, `.env.production` files:

```
# .env
DATABASE_URL=postgresql://localhost/mydb
API_KEY=secret

# For frontend (Vite exposes VITE_ prefix)
VITE_API_BASE_URL=http://localhost:3000
```

Access in code:

```typescript
// Backend
const dbUrl = process.env.DATABASE_URL;

// Frontend
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 🧪 Type Checking

```bash
npm run type-check
```

## 📚 Documentation

See `FRAMEWORK_SPEC.md` for comprehensive specification and advanced features.

## 🤝 Contributing

Contributions are welcome! Please read the specification first to understand the framework's design principles.

## 📄 License

MIT
