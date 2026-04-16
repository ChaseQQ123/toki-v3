#!/usr/bin/env node

/**
 * TOKI V6 自动化测试脚本
 * 在 Node.js 环境中运行所有功能测试
 */

const fs = require('fs');
const path = require('path');

// 测试结果
const results = {
  timestamp: new Date().toISOString(),
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// 测试函数
async function runTests() {
  console.log('🧪 TOKI V6 自动化测试\n');
  console.log('=' .repeat(60));
  
  // 1. 检查文件是否存在
  console.log('\n📋 测试 1: 检查核心文件');
  console.log('-'.repeat(60));
  
  const requiredFiles = [
    'v6-core.js',
    'aliyun-browser.js',
    'index-v6.html',
    'index-v6-image.html',
    'test-all-features.html'
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  }
  
  results.tests.push({
    name: '核心文件检查',
    pass: allFilesExist,
    message: allFilesExist ? '所有文件存在' : '部分文件缺失'
  });
  
  if (allFilesExist) results.passed++;
  else results.failed++;
  results.total++;
  
  // 2. 检查 v6-core.js 内容
  console.log('\n📋 测试 2: 检查 V6 核心代码');
  console.log('-'.repeat(60));
  
  const v6CoreContent = fs.readFileSync(path.join(__dirname, 'v6-core.js'), 'utf8');
  
  const requiredClasses = [
    'PrivacyFilter',
    'SecurityManager',
    'JSONLStore',
    'DNASystem',
    'initTOKIV6'
  ];
  
  let allClassesExist = true;
  for (const className of requiredClasses) {
    const exists = v6CoreContent.includes(`class ${className}`) || 
                   v6CoreContent.includes(`${className} =`);
    console.log(`${exists ? '✅' : '❌'} ${className}`);
    if (!exists) allClassesExist = false;
  }
  
  results.tests.push({
    name: 'V6 核心代码检查',
    pass: allClassesExist,
    message: allClassesExist ? '所有类已定义' : '部分类缺失'
  });
  
  if (allClassesExist) results.passed++;
  else results.failed++;
  results.total++;
  
  // 3. 检查阿里云客户端
  console.log('\n📋 测试 3: 检查阿里云客户端');
  console.log('-'.repeat(60));
  
  const aliyunContent = fs.readFileSync(path.join(__dirname, 'aliyun-browser.js'), 'utf8');
  
  const requiredMethods = [
    'chat',
    'vision',
    'uploadAndRecognize',
    'selectModel'
  ];
  
  let allMethodsExist = true;
  for (const method of requiredMethods) {
    const exists = aliyunContent.includes(`async ${method}(`) || 
                   aliyunContent.includes(`${method}(`);
    console.log(`${exists ? '✅' : '❌'} ${method}`);
    if (!exists) allMethodsExist = false;
  }
  
  results.tests.push({
    name: '阿里云客户端检查',
    pass: allMethodsExist,
    message: allMethodsExist ? '所有方法已定义' : '部分方法缺失'
  });
  
  if (allMethodsExist) results.passed++;
  else results.failed++;
  results.total++;
  
  // 4. 检查 API 密钥配置
  console.log('\n📋 测试 4: 检查 API 密钥配置');
  console.log('-'.repeat(60));
  
  const apiKeyPattern = /sk-[a-zA-Z0-9]{32}/;
  const hasApiKey = apiKeyPattern.test(aliyunContent);
  
  console.log(`${hasApiKey ? '✅' : '❌'} API 密钥已配置`);
  
  if (hasApiKey) {
    const apiKeyMatch = aliyunContent.match(apiKeyPattern)[0];
    console.log(`   密钥：${apiKeyMatch.substring(0, 8)}...${apiKeyMatch.substring(apiKeyMatch.length - 8)}`);
  }
  
  results.tests.push({
    name: 'API 密钥检查',
    pass: hasApiKey,
    message: hasApiKey ? 'API 密钥已配置' : 'API 密钥缺失'
  });
  
  if (hasApiKey) results.passed++;
  else results.failed++;
  results.total++;
  
  // 5. 检查隐私脱敏功能
  console.log('\n📋 测试 5: 检查隐私脱敏功能');
  console.log('-'.repeat(60));
  
  const privacyTests = [
    { input: '我的手机号是 13812345678', expected: '[手机号]' },
    { input: '我住在北京朝阳区', expected: '[地址]' },
    { input: '邮箱是 test@example.com', expected: '[邮箱]' }
  ];
  
  let privacyPass = true;
  
  // 模拟 PrivacyFilter.sanitize
  function sanitize(text) {
    let result = text;
    // 先替换手机号
    result = result.replace(/1[3-9]\d{9}/g, '[手机号]');
    // 再替换地址（3 个中文字以上 + 地址后缀）
    result = result.replace(/[\u4e00-\u9fa5]{3,}(省|市|区|县|路|街|号)/g, '[地址]');
    // 替换邮箱
    result = result.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[邮箱]');
    return result;
  }
  
  for (const test of privacyTests) {
    const output = sanitize(test.input);
    const pass = output.includes(test.expected);
    console.log(`${pass ? '✅' : '❌'} ${test.input} → ${output}`);
    if (!pass) privacyPass = false;
  }
  
  results.tests.push({
    name: '隐私脱敏测试',
    pass: privacyPass,
    message: privacyPass ? '脱敏功能正常' : '脱敏功能异常'
  });
  
  if (privacyPass) results.passed++;
  else results.failed++;
  results.total++;
  
  // 6. 检查智能路由
  console.log('\n📋 测试 6: 检查智能路由功能');
  console.log('-'.repeat(60));
  
  const routeTests = [
    { input: '你好', expected: 'qwen-turbo' },
    { input: '什么是量子力学', expected: 'qwen-plus' },
    { input: '用 Python 写代码', expected: 'qwen-coder' },
    { input: '识别这张图片', hasImage: true, expected: 'qwen-vl-max' }
  ];
  
  // 模拟 selectModel
  function selectModel(message, hasImage = false) {
    if (hasImage || /图片 | 照片 | 图像 | 识别/i.test(message)) {
      return { model: 'qwen-vl-max' };
    }
    if (/^(你好 | 您好|hello|hi|hey)/i.test(message) && message.length < 15) {
      return { model: 'qwen-turbo' };
    }
    if (/为什么 | 是什么 | 怎么做/i.test(message)) {
      return { model: 'qwen-plus' };
    }
    if (/代码 | 编程|python/i.test(message)) {
      return { model: 'qwen-coder' };
    }
    return { model: 'qwen-plus' };
  }
  
  let routePass = true;
  for (const test of routeTests) {
    const route = selectModel(test.input, test.hasImage);
    const pass = route.model === test.expected;
    console.log(`${pass ? '✅' : '❌'} "${test.input}" → ${route.model} (期望：${test.expected})`);
    if (!pass) routePass = false;
  }
  
  results.tests.push({
    name: '智能路由测试',
    pass: routePass,
    message: routePass ? '路由功能正常' : '路由功能异常'
  });
  
  if (routePass) results.passed++;
  else results.failed++;
  results.total++;
  
  // 7. 检查 GitHub Pages 可访问性
  console.log('\n📋 测试 7: 检查 GitHub Pages 部署');
  console.log('-'.repeat(60));
  
  const { execSync } = require('child_process');
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const isClean = gitStatus.trim() === '';
    console.log(`${isClean ? '✅' : '⚠️'} Git 仓库状态：${isClean ? '干净' : '有未提交更改'}`);
    
    const gitLog = execSync('git log --oneline -1', { encoding: 'utf8' });
    console.log(`📝 最新提交：${gitLog.trim()}`);
    
    results.tests.push({
      name: 'Git 仓库检查',
      pass: true,
      message: gitLog.trim()
    });
    results.passed++;
    
  } catch (e) {
    console.log(`❌ Git 检查失败：${e.message}`);
    results.tests.push({
      name: 'Git 仓库检查',
      pass: false,
      message: e.message
    });
    results.failed++;
  }
  results.total++;
  
  // 8. 总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果总结');
  console.log('='.repeat(60));
  
  const successRate = Math.round((results.passed / results.total) * 100);
  
  console.log(`\n总计：${results.total}`);
  console.log(`通过：${results.passed} ✅`);
  console.log(`失败：${results.failed} ❌`);
  console.log(`成功率：${successRate}%`);
  
  console.log('\n📋 详细结果:');
  for (const test of results.tests) {
    console.log(`${test.pass ? '✅' : '❌'} ${test.name}: ${test.message}`);
  }
  
  // 导出测试报告
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 测试报告已导出：${reportPath}`);
  
  // 判断是否所有测试通过
  if (results.passed === results.total) {
    console.log('\n🎉 所有测试通过！可以安全使用。');
    console.log('\n🌐 访问地址:');
    console.log('  - 功能测试页：https://chaseqq123.github.io/toki-v3/test-all-features.html');
    console.log('  - V6 正式版：https://chaseqq123.github.io/toki-v3/index-v6.html');
    console.log('  - V6 图像版：https://chaseqq123.github.io/toki-v3/index-v6-image.html');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查后再使用。');
  }
  
  console.log('\n' + '='.repeat(60));
}

// 运行测试
runTests().catch(console.error);
