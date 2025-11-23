import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Template = 'react-ts' | 'vue-ts';

interface TemplateInfo {
  name: Template;
  display: string;
  color: string;
}

/**
 * 递归复制目录
 */
async function copyDir(src: string, dest: string, projectName: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, projectName);
    } else {
      // 读取文件内容
      let content = await fs.readFile(srcPath, 'utf-8');
      
      // 替换模板变量
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
      
      // 写入文件
      await fs.writeFile(destPath, content, 'utf-8');
      console.log(`  ✓ Created ${path.relative(dest.split(path.sep).slice(0, -1).join(path.sep), destPath)}`);
    }
  }
}

/**
 * 获取可用模板列表
 */
export function getAvailableTemplates(): Template[] {
  return ['react-ts', 'vue-ts'];
}

/**
 * 获取模板信息列表
 */
function getTemplateInfoList(): TemplateInfo[] {
  return [
    {
      name: 'react-ts',
      display: 'React',
      color: 'cyan',
    },
    {
      name: 'vue-ts',
      display: 'Vue',
      color: 'green',
    },
  ];
}

/**
 * 验证模板是否存在
 */
export function isValidTemplate(template: string): template is Template {
  return getAvailableTemplates().includes(template as Template);
}

/**
 * 获取模板描述
 */
export function getTemplateDescription(template: Template): string {
  const templateInfo = getTemplateInfoList().find(t => t.name === template);
  return templateInfo ? `${templateInfo.display} + TypeScript` : template;
}

/**
 * 创建项目
 */
export async function createProject(
  projectName: string,
  template?: Template
): Promise<void> {
  const targetDir = path.join(process.cwd(), projectName);

  // 检查目录是否已存在
  try {
    await fs.access(targetDir);
    console.error(`❌ Directory "${projectName}" already exists`);
    process.exit(1);
  } catch {
    // 目录不存在，继续
  }

  // 如果没有指定模板，则交互式选择
  let selectedTemplate = template;
  if (!selectedTemplate) {
    selectedTemplate = await promptTemplate();
  }

  // 验证模板
  if (!isValidTemplate(selectedTemplate)) {
    console.error(`❌ Invalid template: ${selectedTemplate}`);
    console.log(`\nAvailable templates:`);
    getAvailableTemplates().forEach((t, i) => {
      console.log(`  ${i + 1}) ${t} - ${getTemplateDescription(t)}`);
    });
    process.exit(1);
  }

  console.log(`\n📦 Creating project with ${getTemplateDescription(selectedTemplate)} template...\n`);

  // 获取模板路径
  const distDir = path.resolve(__dirname, '..');
  const templateDir = path.join(distDir, 'templates', selectedTemplate);

  // 检查模板是否存在
  try {
    await fs.access(templateDir);
  } catch {
    console.error(`❌ Template directory not found: ${templateDir}`);
    console.error(`\n💡 Dist directory: ${distDir}`);
    console.error(`💡 Make sure the vont package is properly installed with templates.`);
    process.exit(1);
  }

  // 创建项目目录
  await fs.mkdir(targetDir, { recursive: true });

  // 复制模板文件
  await copyDir(templateDir, targetDir, projectName);

  // 成功提示
  console.log(`\n✅ Project created successfully!\n`);
  console.log('📝 Next steps:\n');
  console.log(`  cd ${projectName}`);
  console.log('  npm install');
  console.log('  npm run dev\n');
  console.log(`🚀 Happy coding!\n`);
}

/**
 * 交互式选择模板
 */
async function promptTemplate(): Promise<Template> {
  const templates = getTemplateInfoList();

  // 如果只有一个模板，直接返回
  if (templates.length === 1) {
    return templates[0].name;
  }

  const response = await prompts(
    [
      {
        type: 'select',
        name: 'template',
        message: 'Select a framework:',
        choices: templates.map((t) => ({
          title: t.display,
          value: t.name,
        })),
        initial: 0,
      },
    ],
    {
      onCancel: () => {
        console.log('\n❌ Operation cancelled');
        process.exit(0);
      },
    }
  );

  return response.template;
}
