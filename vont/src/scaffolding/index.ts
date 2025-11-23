import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TemplateFile {
  path: string;
  content: string;
}

/**
 * 询问用户选择模板
 */
async function promptTemplate(): Promise<'react' | 'vue'> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log('\n📦 Select a template:');
    console.log('  1) React + TypeScript (default)');
    console.log('  2) Vue + TypeScript\n');

    rl.question('Choose template (1 or 2): ', (answer) => {
      rl.close();
      const choice = answer.trim() || '1';
      resolve(choice === '2' ? 'vue' : 'react');
    });
  });
}

/**
 * 生成 React 模板文件
 */
function generateReactTemplate(projectName: string): TemplateFile[] {
  return [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: projectName,
        version: '1.0.0',
        type: 'module',
        private: true,
        scripts: {
          dev: 'vont dev',
          build: 'vont build',
          start: 'vont start',
          'type-check': 'tsc --noEmit',
        },
        dependencies: {
          'vont': '^1.0.0-beta.7',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          'react-router-dom': '^6.14.2',
        },
        devDependencies: {
          '@tailwindcss/vite': '^4.0.0',
          '@types/node': '^20.5.0',
          '@types/react': '^18.2.20',
          '@types/react-dom': '^18.2.7',
          '@vitejs/plugin-react': '^5.0.0',
          tailwindcss: '^4.0.0',
          typescript: '^5.1.6',
          vite: '^7.2.0',
        },
      }, null, 2),
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src'],
      }, null, 2),
    },
    {
      path: 'vont.config.ts',
      content: `import { defineConfig } from 'vont';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  port: 3000,
  host: '0.0.0.0',

  viteConfig: {
    plugins: [
      tailwindcss(),
      react(),
    ],
  },
});
`,
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vont Framework</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/.vont/client.tsx"></script>
  </body>
</html>
`,
    },
    {
      path: '.gitignore',
      content: `# Dependencies
node_modules/

# Build output
dist/

# Vont generated files
/.vont/

# Environment
.env
.env.local

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
`,
    },
    {
      path: 'README.md',
      content: `# ${projectName}

A full-stack application built with Vont Framework.

## Get Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── api/          # API routes
│   ├── pages/        # Page components
│   ├── styles/       # Global styles
│   └── types/        # TypeScript types
├── index.html
├── vont.config.ts
└── package.json
\`\`\`

## Learn More

- [Vont Documentation](https://github.com/korbinzhao/vontjs)
`,
    },
    {
      path: 'src/styles/app.css',
      content: `@import "tailwindcss";
`,
    },
    {
      path: 'src/pages/index.tsx',
      content: `import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Vont Framework
              </span>
            </div>
            <div className="flex space-x-8">
              <Link to="/" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                About
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vont
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A modern full-stack TypeScript framework
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/about"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
`,
    },
    {
      path: 'src/pages/about.tsx',
      content: `import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Vont Framework
              </span>
            </div>
            <div className="flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link to="/about" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                About
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Vont</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">
            Vont is a modern full-stack TypeScript framework that combines the power of Koa and React/Vue
            with file-based routing, hot module replacement, and a great developer experience.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
          <ul className="space-y-2 text-gray-600">
            <li>📁 File-based routing for both API and pages</li>
            <li>🔥 Hot Module Replacement (HMR)</li>
            <li>🔤 Full TypeScript support</li>
            <li>⚡ Powered by Vite</li>
            <li>🎨 Tailwind CSS ready</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
`,
    },
  ];
}

/**
 * 生成 Vue 模板文件
 */
function generateVueTemplate(projectName: string): TemplateFile[] {
  return [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: projectName,
        version: '1.0.0',
        type: 'module',
        private: true,
        scripts: {
          dev: 'vont dev',
          build: 'vont build',
          start: 'vont start',
          'type-check': 'vue-tsc --noEmit',
        },
        dependencies: {
          'vont': '^1.0.0-beta.7',
          vue: '^3.4.21',
          'vue-router': '^4.3.0',
        },
        devDependencies: {
          '@tailwindcss/vite': '^4.0.0',
          '@types/node': '^20.5.0',
          '@vitejs/plugin-vue': '^6.0.0',
          tailwindcss: '^4.0.0',
          typescript: '^5.4.2',
          vite: '^7.2.0',
          'vue-tsc': '^2.0.6',
        },
      }, null, 2),
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          module: 'ESNext',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src/**/*.ts', 'src/**/*.vue'],
      }, null, 2),
    },
    {
      path: 'vont.config.ts',
      content: `import { defineConfig } from 'vont';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  port: 3000,
  host: '0.0.0.0',

  viteConfig: {
    plugins: [
      tailwindcss(),
      vue(),
    ],
  },
});
`,
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vont Framework</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/.vont/client.tsx"></script>
  </body>
</html>
`,
    },
    {
      path: '.gitignore',
      content: `# Dependencies
node_modules/

# Build output
dist/

# Vont generated files
/.vont/

# Environment
.env
.env.local

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
`,
    },
    {
      path: 'README.md',
      content: `# ${projectName}

A full-stack application built with Vont Framework and Vue 3.

## Get Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── api/          # API routes
│   ├── pages/        # Page components (.vue)
│   ├── styles/       # Global styles
│   └── types/        # TypeScript types
├── index.html
├── vont.config.ts
└── package.json
\`\`\`

## Learn More

- [Vont Documentation](https://github.com/korbinzhao/vontjs)
- [Vue 3 Documentation](https://vuejs.org/)
`,
    },
    {
      path: 'src/styles/app.css',
      content: `@import "tailwindcss";
`,
    },
    {
      path: 'src/pages/index.vue',
      content: `<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <header class="bg-white shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">🚀</span>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vont Framework
            </span>
          </div>
          <div class="flex space-x-8">
            <router-link to="/" class="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </router-link>
            <router-link to="/about" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              About
            </router-link>
          </div>
        </div>
      </nav>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center">
        <h1 class="text-5xl font-bold text-gray-900 mb-4">
          Welcome to
          <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Vont
          </span>
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          A modern full-stack TypeScript framework with Vue 3
        </p>
        <div class="flex justify-center gap-4">
          <router-link
            to="/about"
            class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Get Started →
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Home page component
</script>
`,
    },
    {
      path: 'src/pages/about.vue',
      content: `<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <header class="bg-white shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">🚀</span>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vont Framework
            </span>
          </div>
          <div class="flex space-x-8">
            <router-link to="/" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </router-link>
            <router-link to="/about" class="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              About
            </router-link>
          </div>
        </div>
      </nav>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">About Vont</h1>
      
      <div class="prose prose-lg">
        <p class="text-gray-600 mb-6">
          Vont is a modern full-stack TypeScript framework that combines the power of Koa and Vue 3
          with file-based routing, hot module replacement, and a great developer experience.
        </p>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">Features</h2>
        <ul class="space-y-2 text-gray-600">
          <li>📁 File-based routing for both API and pages</li>
          <li>🔥 Hot Module Replacement (HMR)</li>
          <li>🔤 Full TypeScript support</li>
          <li>⚡ Powered by Vite</li>
          <li>🎨 Tailwind CSS ready</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// About page component
</script>
`,
    },
  ];
}

/**
 * 创建项目
 */
export async function createProject(projectName: string): Promise<void> {
  const targetDir = path.join(process.cwd(), projectName);

  // 检查目录是否已存在
  try {
    await fs.access(targetDir);
    console.error(`❌ Directory "${projectName}" already exists`);
    process.exit(1);
  } catch {
    // 目录不存在，继续
  }

  // 询问模板类型
  const template = await promptTemplate();

  console.log(`\n📦 Creating project with ${template === 'react' ? 'React' : 'Vue'} template...\n`);

  // 生成模板文件
  const files = template === 'react' 
    ? generateReactTemplate(projectName)
    : generateVueTemplate(projectName);

  // 创建项目目录
  await fs.mkdir(targetDir, { recursive: true });

  // 写入所有文件
  for (const file of files) {
    const filePath = path.join(targetDir, file.path);
    const fileDir = path.dirname(filePath);

    // 确保目录存在
    await fs.mkdir(fileDir, { recursive: true });

    // 写入文件
    await fs.writeFile(filePath, file.content, 'utf-8');
    console.log(`  ✓ Created ${file.path}`);
  }

  // 成功提示
  console.log(`\n✅ Project created successfully!\n`);
  console.log('📝 Next steps:\n');
  console.log(`  cd ${projectName}`);
  console.log('  npm install');
  console.log('  npm run dev\n');
  console.log(`🚀 Happy coding!\n`);
}

