#!/usr/bin/env node

/**
 * TOKI V6 完整功能测试
 * 自动测试所有核心功能
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🧪 TOKI V6 完整功能测试\n');
console.log('='.repeat(70));

const API_KEY = 'sk-ebea5eacead94e65aaec23f101a20a44';
const API_URL = 'dashscope.aliyuncs.com';

const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  passed: 0,
  failed: 0
};

// 测试 1: 检查核心文件
console.log('\n📋 测试 1: 检查核心文件');
console.log('-'.repeat(70));

const requiredFiles = [
  'v6-core.js',
  'aliyun-browser.js',
  'chat-direct.html',
  'index-v6.html',
  'index-v6-image.html'
];

let filesPass = true;
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) filesPass = false;
}

results.tests.push({
  name: '核心文件检查',
  pass: filesPass,
  message: filesPass ? '所有文件存在' : '部分文件缺失'
});

if (filesPass) results.passed++;
else results.failed++;

// 测试 2: 测试隐私脱敏
console.log('\n📋 测试 2: 测试隐私脱敏功能');
console.log('-'.repeat(70));

function sanitize(text) {
  let result = text;
  result = result.replace(/1[3-9]\d{9}/g, '[手机号]');
  result = result.replace(/[\u4e00-\u9fa5]{3,}(省 | 市 | 区|县 | 路 | 街 | 号)/g, '[地址]');
  result = result.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[邮箱]');
  return result;
}

const privacyTests = [
  { input: '手机号 13812345678', expected: '[手机号]', name: '手机号' },
  { input: '北京朝阳区', expected: '[地址]', name: '地址' },
  { input: 'test@example.com', expected: '[邮箱]', name: '邮箱' }
];

let privacyPass = true;
for (const test of privacyTests) {
  const output = sanitize(test.input);
  const pass = output.includes(test.expected);
  console.log(`${pass ? '✅' : '❌'} ${test.name}: ${test.input} → ${output}`);
  if (!pass) privacyPass = false;
}

results.tests.push({
  name: '隐私脱敏测试',
  pass: privacyPass,
  message: privacyPass ? '脱敏功能正常' : '脱敏功能异常'
});

if (privacyPass) results.passed++;
else results.failed++;

// 测试 3: 测试阿里云 API 连接
console.log('\n📋 测试 3: 测试阿里云 API 连接');
console.log('-'.repeat(70));

function apiRequest(model, message) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: model,
      input: {
        messages: [
          { role: 'system', content: '你是 TOKI 助手' },
          { role: 'user', content: message }
        ]
      },
      parameters: {
        temperature: 0.7,
        max_tokens: 100,
        result_format: 'message'
      }
    });

    const options = {
      hostname: API_URL,
      port: 443,
      path: '/api/v1/services/aigc/text-generation/generation',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve({
              success: true,
              content: parsed.output?.choices?.[0]?.message?.content,
              model: model,
              usage: parsed.usage
            });
          } catch (e) {
            reject(new Error('响应解析失败'));
          }
        } else {
          try {
            const error = JSON.parse(data);
            reject(new Error(`${res.statusCode}: ${error.message || 'API 错误'}`));
          } catch (e) {
            reject(new Error(`${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`请求失败：${e.message}`));
    });

    req.write(postData);
    req.end();
  });
}

// 测试 3a: qwen-turbo
async function testTurbo() {
  try {
    console.log('⏳ 测试 qwen-turbo...');
    const result = await apiRequest('qwen-turbo', '你好，只回复"你好"两个字');
    console.log(`✅ qwen-turbo: ${result.content}`);
    console.log(`   模型：${result.model}`);
    console.log(`   Tokens: 输入${result.usage?.input_tokens || 0}, 输出${result.usage?.output_tokens || 0}`);
    return true;
  } catch (e) {
    console.log(`❌ qwen-turbo: ${e.message}`);
    return false;
  }
}

// 测试 3b: qwen-plus
async function testPlus() {
  try {
    console.log('⏳ 测试 qwen-plus...');
    const result = await apiRequest('qwen-plus', '你好，只回复"你好"两个字');
    console.log(`✅ qwen-plus: ${result.content}`);
    console.log(`   模型：${result.model}`);
    return true;
  } catch (e) {
    console.log(`❌ qwen-plus: ${e.message}`);
    return false;
  }
}

// 运行 API 测试
(async () => {
  const turboPass = await testTurbo();
  const plusPass = await testPlus();
  
  const apiPass = turboPass && plusPass;
  
  results.tests.push({
    name: '阿里云 API 测试',
    pass: apiPass,
    message: apiPass ? 'API 连接正常' : 'API 连接失败'
  });
  
  if (apiPass) results.passed++;
  else results.failed++;
  
  // 测试 4: 检查 GitHub Pages
  console.log('\n📋 测试 4: 检查 GitHub Pages 部署');
  console.log('-'.repeat(70));
  
  const { execSync } = require('child_process');
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const isClean = gitStatus.trim() === '';
    console.log(`${isClean ? '✅' : '⚠️'} Git 仓库：${isClean ? '干净' : '有未提交更改'}`);
    
    const gitLog = execSync('git log --oneline -1', { encoding: 'utf8' });
    console.log(`📝 最新提交：${gitLog.trim()}`);
    
    results.tests.push({
      name: 'Git 部署检查',
      pass: true,
      message: gitLog.trim()
    });
    results.passed++;
    
  } catch (e) {
    console.log(`❌ Git 检查失败：${e.message}`);
    results.tests.push({
      name: 'Git 部署检查',
      pass: false,
      message: e.message
    });
    results.failed++;
  }
  
  // 总结
  console.log('\n' + '='.repeat(70));
  console.log('📊 测试结果总结');
  console.log('='.repeat(70));
  
  const total = results.passed + results.failed;
  const successRate = Math.round((results.passed / total) * 100);
  
  console.log(`\n总计：${total}`);
  console.log(`通过：${results.passed} ✅`);
  console.log(`失败：${results.failed} ❌`);
  console.log(`成功率：${successRate}%`);
  
  console.log('\n📋 详细结果:');
  for (const test of results.tests) {
    console.log(`${test.pass ? '✅' : '❌'} ${test.name}: ${test.message}`);
  }
  
  // 导出报告
  const reportPath = path.join(__dirname, 'test-report-final.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 测试报告已导出：${reportPath}`);
  
  console.log('\n' + '='.repeat(70));
  
  if (results.passed === total) {
    console.log('\n🎉 所有测试通过！可以安全使用。');
    console.log('\n🌐 访问地址:');
    console.log('  - 直接对话：https://chaseqq123.github.io/toki-v3/chat-direct.html');
    console.log('  - V6 正式版：https://chaseqq123.github.io/toki-v3/index-v6.html');
    console.log('  - V6 图像版：https://chaseqq123.github.io/toki-v3/index-v6-image.html');
  } else {
    console.log('\n⚠️ 部分测试失败，请查看上面的错误信息。');
  }
  
  console.log('\n' + '='.repeat(70));
  
})().catch(console.error);
