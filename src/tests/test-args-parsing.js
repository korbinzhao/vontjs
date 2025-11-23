#!/usr/bin/env node

/**
 * 测试 --template 参数解析
 */

// 模拟不同的命令行参数格式
const testCases = [
  {
    name: '格式 1: --template=react-ts',
    argv: ['node', 'vont', 'create', 'my-app', '--template=react-ts'],
    expected: { projectName: 'my-app', template: 'react-ts' }
  },
  {
    name: '格式 2: --template react-ts',
    argv: ['node', 'vont', 'create', 'my-app', '--template', 'react-ts'],
    expected: { projectName: 'my-app', template: 'react-ts' }
  },
  {
    name: '格式 3: 项目名在后面 --template=vue-ts',
    argv: ['node', 'vont', 'create', '--template=vue-ts', 'my-app'],
    expected: { projectName: 'my-app', template: 'vue-ts' }
  },
  {
    name: '格式 4: 项目名在后面 --template vue-ts',
    argv: ['node', 'vont', 'create', '--template', 'vue-ts', 'my-app'],
    expected: { projectName: 'my-app', template: 'vue-ts' }
  },
  {
    name: '格式 5: 只有项目名',
    argv: ['node', 'vont', 'create', 'my-app'],
    expected: { projectName: 'my-app', template: undefined }
  },
  {
    name: '格式 6: 无参数',
    argv: ['node', 'vont', 'create'],
    expected: { projectName: undefined, template: undefined }
  }
];

// 参数解析函数（从 create.ts 复制）
function parseArgs(argv) {
  const args = argv.slice(3);
  
  // 解析 --template 参数
  let templateFlag;
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
  
  return {
    projectName: projectNameArg,
    template: templateFlag
  };
}

// 运行测试
console.log('🧪 测试 --template 参数解析\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = parseArgs(testCase.argv);
  const isMatch = 
    result.projectName === testCase.expected.projectName &&
    result.template === testCase.expected.template;
  
  const status = isMatch ? '✅ PASS' : '❌ FAIL';
  
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   命令: ${testCase.argv.slice(2).join(' ')}`);
  console.log(`   期望: projectName="${testCase.expected.projectName}", template="${testCase.expected.template}"`);
  console.log(`   实际: projectName="${result.projectName}", template="${result.template}"`);
  console.log(`   ${status}`);
  
  if (isMatch) {
    passed++;
  } else {
    failed++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 测试结果: ${passed}/${testCases.length} 通过`);

if (failed > 0) {
  console.log(`❌ ${failed} 个测试失败`);
  process.exit(1);
} else {
  console.log('✅ 所有测试通过！');
}

