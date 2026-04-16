const text1 = '手机号 13812345678';
const text2 = '北京朝阳区';
const text3 = 'test@example.com';

// 实际代码中的正则
function sanitize(text) {
  let result = text;
  result = result.replace(/1[3-9]\d{9}/g, '[手机号]');
  result = result.replace(/[\u4e00-\u9fa5]{2,}(省 | 市 | 区|县 | 路 | 街 | 号|栋 | 单元 | 室 | 镇 | 乡 | 村)/g, '[地址]');
  result = result.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[邮箱]');
  return result;
}

console.log('隐私脱敏测试（使用实际代码中的正则）:');
console.log('='.repeat(50));
console.log('1. 手机号:', text1, '→', sanitize(text1));
console.log('2. 地址:', text2, '→', sanitize(text2));
console.log('3. 邮箱:', text3, '→', sanitize(text3));
console.log('='.repeat(50));

const pass1 = sanitize(text1).includes('[手机号]');
const pass2 = sanitize(text2).includes('[地址]');
const pass3 = sanitize(text3).includes('[邮箱]');

console.log('\n结果:');
console.log('手机号:', pass1 ? '✅' : '❌');
console.log('地址:', pass2 ? '✅' : '❌');
console.log('邮箱:', pass3 ? '✅' : '❌');
console.log('\n总计:', pass1 && pass2 && pass3 ? '✅ 全部通过' : '❌ 部分失败');
