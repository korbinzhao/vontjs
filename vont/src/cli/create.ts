import { createProject } from '../scaffolding/index.js';

/**
 * 创建新项目
 */
const projectName = process.argv[3];

if (!projectName) {
  console.error('❌ Project name is required');
  console.log('\nUsage: vont create <project-name>');
  console.log('\nExample: vont create my-app');
  process.exit(1);
}

createProject(projectName).catch((error) => {
  console.error('❌ Failed to create project:', error);
  process.exit(1);
});

