# Vont Demo Application

This is a demo application showcasing the Vont Framework capabilities.

## Features

- 🎨 Modern UI with Tailwind CSS v4
- ⚡ File-based routing for API and pages
- 🔧 Full TypeScript support
- 🔄 Hot module replacement

## Getting Started

### Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

### Production

```bash
npm run build
npm start
```

## Project Structure

```
demo/
├── api/              # API routes
│   └── users/        # User API endpoints
├── pages/            # Frontend pages
│   ├── index.tsx     # Home page
│   ├── about.tsx     # About page
│   └── users.tsx     # Users page
├── lib/              # Utility libraries
├── styles/           # Global styles
├── types/            # TypeScript types
├── server/           # Server entry point
├── client.tsx        # Client entry point
├── index.html        # HTML template
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
└── vite.config.ts    # Vite config
```

## API Routes

### GET /api/users
Get all users

### POST /api/users
Create a new user

Body: `{ "name": string, "email": string }`

### GET /api/users/:id
Get user by ID

## Pages

- `/` - Home page with framework overview
- `/about` - About the framework
- `/users` - User management demo

## Technologies

- **Backend**: Koa 2.x
- **Frontend**: React 18 + React Router 6
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Learn More

See the main README at the project root for more information about the Vont Framework.

