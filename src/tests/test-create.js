#!/usr/bin/env node

/**
 * 本地测试脚本
 * 用于测试 vont create 命令的交互功能
 * 
 * 使用方法：
 * node test-create.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 模拟命令行参数
const testCases = [
  {
    name: '测试 1: 完全交互式（无参数）',
    args: ['node', 'vont', 'create'],
    description: '应该提示输入项目名称和选择框架',
  },
  {
    name: '测试 2: 指定项目名称',
    args: ['node', 'vont', 'create', 'my-test-app'],
    description: '应该只提示选择框架',
  },
  {
    name: '测试 3: 完全非交互式（使用 = 语法）',
    args: ['node', 'vont', 'create', 'my-app', '--template=react-ts'],
    description: '应该直接创建项目，无需交互',
  },
  {
    name: '测试 4: 完全非交互式（使用空格语法）',
    args: ['node', 'vont', 'create', 'my-vue-app', '--template', 'vue-ts'],
    description: '应该直接创建项目，无需交互',
  },
];

console.log('📋 Vont Create 测试用例\n');
console.log('=' .repeat(60));

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   描述: ${testCase.description}`);
  console.log(`   命令: ${testCase.args.slice(1).join(' ')}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n📝 手动测试步骤:\n');
console.log('1. 构建项目:');
console.log('   cd /Users/joebon/work/vontjs/vont');
console.log('   npm run build\n');

console.log('2. 测试完全交互式:');
console.log('   node bin/vont.js create\n');

console.log('3. 测试指定项目名称:');
console.log('   node bin/vont.js create test-project\n');

console.log('4. 测试完全非交互式:');
console.log('   node bin/vont.js create test-app --template react-ts\n');

console.log('5. 测试项目名称验证:');
console.log('   node bin/vont.js create');
console.log('   然后输入无效字符如 "my project" 或 "my@app"\n');

console.log('6. 测试取消操作:');
console.log('   node bin/vont.js create');
console.log('   然后按 Ctrl+C 或 ESC\n');

console.log('7. 测试键盘导航:');
console.log('   node bin/vont.js create my-app');
console.log('   使用 ↑↓ 键切换框架\n');

console.log('=' .repeat(60));
console.log('\n✅ 预期结果:\n');
console.log('- 项目名称输入框应该显示默认值 "vont-project"');
console.log('- 框架选择应该使用列表形式，支持 ↑↓ 键导航');
console.log('- 无效输入应该显示错误提示');
console.log('- ESC 或 Ctrl+C 应该取消操作');
console.log('- 创建成功后应该显示下一步操作提示\n');

