# Vont Framework

> 🚀 A modern full-stack TypeScript framework combining Koa and React/Vue with file-based routing

[![npm version](https://img.shields.io/npm/v/vont.svg)](https://www.npmjs.com/package/vont)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org/)

## ✨ Features

- 📁 **File-based Routing** - Automatic API and page routes
- 🔥 **Hot Module Replacement** - Instant feedback
- ⚙️ **Zero Configuration** - Works out of the box
- 🔤 **TypeScript First** - Full type safety
- ⚛️ **React & Vue Support** - Choose your framework
- ⚡ **Vite 7 Powered** - Lightning-fast builds
- 🏗️ **Production Ready** - Single unified deployment

## 🚀 Quick Start

```bash
# Create a new project
npx vont create my-app

# Choose React or Vue template
cd my-app
npm install
npm run dev
```

Visit `http://localhost:3000` 🎉

## 📖 Documentation

For complete documentation, see **[vont/README.md](./vont/README.md)**

### Key Topics

- **[Quick Start](./vont/README.md#quick-start)** - Get started in minutes
- **[Project Structure](./vont/README.md#project-structure)** - File organization
- **[API Routes](./vont/README.md#api-routes)** - File-based API routing
- **[Page Routes](./vont/README.md#page-routes)** - File-based page routing
- **[Configuration](./vont/README.md#configuration)** - `vont.config.ts` options
- **[CLI Commands](./vont/README.md#cli-commands)** - Available commands
- **[Deployment](./vont/README.md#deployment)** - Production deployment
- **[Troubleshooting](./vont/README.md#troubleshooting)** - Common issues

## 📦 Monorepo Structure

This repository contains:

- **[`vont/`](./vont/)** - The core `vont` npm package ([Documentation](./vont/README.md))
- **[`examples/`](./examples/)** - Example applications
  - [`koa-react-ts/`](./examples/koa-react-ts/) - React + TypeScript example
  - [`koa-vue-ts/`](./examples/koa-vue-ts/) - Vue + TypeScript example

## 🎯 Quick Example

### API Route

```typescript
// src/api/users.ts
import type { Context } from 'koa';

export const get = async (ctx: Context) => {
  ctx.body = { users: [] };
};

export const post = async (ctx: Context) => {
  const { name, email } = ctx.request.body;
  ctx.body = { id: Date.now(), name, email };
  ctx.status = 201;
};
```

**Result**: `GET /api/users` and `POST /api/users`

### Page Component (React)

```typescript
// src/pages/users.tsx
import React from 'react';

export default function UsersPage() {
  return <h1>Users</h1>;
}
```

**Result**: `GET /users`

### Page Component (Vue)

```vue
<!-- src/pages/users.vue -->
<template>
  <h1>Users</h1>
</template>

<script setup lang="ts">
// Your code here
</script>
```

**Result**: `GET /users`

## 🛠️ Development

### Setup

```bash
# Install dependencies
npm install

# Start React example
cd examples/koa-react-ts && npm install && npm run dev

# Start Vue example
cd examples/koa-vue-ts && npm install && npm run dev

# Build vont package
cd vont && npm run build
```

### Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start example in development mode |
| `npm run build` | Build the project |
| `npm run start` | Start in production mode |

## 🚢 Deployment

For deployment guides (Docker, Nginx, etc.), see **[Deployment Documentation](./vont/README.md#deployment)**

## 📊 Performance

| Feature | Traditional Approach | Vont |
|---------|---------------------|------|
| Startup Time | 10-30s | < 2s |
| Frontend Updates | Manual refresh | HMR (instant) |
| Backend Updates | Manual restart (~10s) | Auto-restart (~1-2s) |
| API Updates | Manual restart (~10s) | Hot reload (~500ms) |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Single file should not exceed 500 lines
- Use explicit types, avoid `any` in TypeScript
- Maintain good component separation
- Follow existing code style

## 📄 License

MIT © Vont Team

## 🔗 Links

- **[Full Documentation](./vont/README.md)** - Complete documentation
- **[NPM Package](https://www.npmjs.com/package/vont)** - npm registry
- **[GitHub Repository](https://github.com/korbinzhao/vontjs)** - Source code
- **[Examples](./examples/)** - Example applications
- **[Issues](https://github.com/korbinzhao/vontjs/issues)** - Bug reports

## 🙏 Acknowledgments

Built with:
- [Koa](https://koajs.com/) - Backend framework
- [React](https://react.dev/) / [Vue](https://vuejs.org/) - Frontend frameworks
- [Vite](https://vitejs.dev/) - Build tool
- [esbuild](https://esbuild.github.io/) - Fast bundler
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

**Made with ❤️ by the Vont Team**
