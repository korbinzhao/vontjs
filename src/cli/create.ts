import prompts from 'prompts';
import { 
  createProject, 
  isValidTemplate, 
  getAvailableTemplates, 
  getTemplateDescription 
} from '../scaffolding/index.js';

/**
 * 创建新项目
 */

// 解析命令行参数
// 支持格式:
// - vont create project-name --template=xxx
// - vont create project-name --template xxx
// - vont create --template=xxx project-name
// - vont create --template xxx project-name
const args = process.argv.slice(3);

// 解析 --template 参数（支持 --template=xxx 和 --template xxx 两种格式）
let templateFlag: string | undefined;
let templateValueIndex = -1;
const templateArgIndex = args.findIndex(arg => arg.startsWith('--template'));

if (templateArgIndex !== -1) {
  const templateArg = args[templateArgIndex];
  if (templateArg.includes('=')) {
    // 格式: --template=react-ts
    templateFlag = templateArg.split('=')[1];
  } else if (templateArgIndex + 1 < args.length) {
    // 格式: --template react-ts
    const nextArg = args[templateArgIndex + 1];
    if (!nextArg.startsWith('-')) {
      templateFlag = nextArg;
      templateValueIndex = templateArgIndex + 1;
    }
  }
}

// 获取项目名称（排除 flag 和 flag 的值）
const projectNameArg = args.find((arg, index) => {
  // 排除以 - 开头的参数
  if (arg.startsWith('-')) return false;
  // 排除作为 template 值的参数
  if (index === templateValueIndex) return false;
  return true;
});

async function main(): Promise<void> {
  console.log();
  
  // 交互式获取项目名称（如果没有提供）
  let projectName = projectNameArg;
  if (!projectName) {
    const response = await prompts(
      {
        type: 'text',
        name: 'projectName',
        message: 'Project name:',
        initial: 'vont-project',
        validate: (value: string) => {
          if (!value) return 'Project name is required';
          if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
            return 'Project name can only contain letters, numbers, hyphens and underscores';
          }
          return true;
        },
      },
      {
        onCancel: () => {
          console.log('\n❌ Operation cancelled');
          process.exit(0);
        },
      }
    );
    projectName = response.projectName;
  }

  // 验证模板（如果提供）
  if (templateFlag && !isValidTemplate(templateFlag)) {
    console.error(`❌ Invalid template: ${templateFlag}`);
    console.log('\nAvailable templates:');
    getAvailableTemplates().forEach((t) => {
      console.log(`  - ${t}: ${getTemplateDescription(t)}`);
    });
    process.exit(1);
  }

  await createProject(projectName!, templateFlag as any);
}

main().catch((error) => {
  console.error('❌ Failed to create project:', error);
  process.exit(1);
});
