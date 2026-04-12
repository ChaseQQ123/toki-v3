// TOKI Native 自动化测试脚本

const fs = require('fs');
const path = require('path');

console.log('🧪 TOKI Native 自动化测试\n');

let passed = 0;
let failed = 0;

// 测试1：检查文件结构
console.log('📋 测试1: 文件结构');
try {
  const requiredFiles = [
    'App.tsx',
    'package.json',
    'tsconfig.json',
    'app.json',
    'src/services/PicoClaw.ts',
    'src/services/TOKNM_API_v2.ts',
    'src/services/VoiceService_v2.ts',
    'src/services/SmartRouter.ts',
    'src/services/CloudSync.ts',
    'src/services/TokenBilling.ts',
    'src/components/ChatScreen.tsx',
    'src/components/MemoryScreen.tsx',
    'src/types/index.ts',
    'src/utils/constants.ts'
  ];

  let allExist = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - 不存在`);
      allExist = false;
    }
  });

  if (allExist) {
    console.log('✅ 文件结构完整');
    passed++;
  } else {
    throw new Error('文件结构不完整');
  }
} catch (e) {
  console.log('❌ 文件结构测试失败:', e.message);
  failed++;
}

// 测试2：检查TypeScript配置
console.log('\n📋 测试2: TypeScript配置');
try {
  const tsconfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.json'), 'utf8'));
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.strict) {
    console.log('✅ TypeScript配置正确');
    passed++;
  } else {
    throw new Error('TypeScript配置不正确');
  }
} catch (e) {
  console.log('❌ TypeScript配置测试失败:', e.message);
  failed++;
}

// 测试3：检查PicoClaw集成
console.log('\n📋 测试3: PicoClaw集成');
try {
  const picoCode = fs.readFileSync(path.join(__dirname, 'src/services/PicoClaw.ts'), 'utf8');
  if (picoCode.includes('class PicoMemory') && 
      picoCode.includes('async memorize') && 
      picoCode.includes('async recall')) {
    console.log('✅ PicoClaw集成完整');
    passed++;
  } else {
    throw new Error('PicoClaw代码不完整');
  }
} catch (e) {
  console.log('❌ PicoClaw集成测试失败:', e.message);
  failed++;
}

// 测试4：检查智能路由
console.log('\n📋 测试4: 智能路由');
try {
  const routerCode = fs.readFileSync(path.join(__dirname, 'src/services/SmartRouter.ts'), 'utf8');
  if (routerCode.includes('SmartRouter') && 
      routerCode.includes('route(') &&
      routerCode.includes('zhipu')) {
    console.log('✅ 智能路由配置正确');
    passed++;
  } else {
    throw new Error('智能路由配置不完整');
  }
} catch (e) {
  console.log('❌ 智能路由测试失败:', e.message);
  failed++;
}

// 测试5：检查API配置
console.log('\n📋 测试5: API配置');
try {
  const constants = fs.readFileSync(path.join(__dirname, 'src/utils/constants.ts'), 'utf8');
  if (constants.includes('zhipu') && 
      constants.includes('xunfei') &&
      constants.includes('routing')) {
    console.log('✅ API配置完整');
    passed++;
  } else {
    throw new Error('API配置不完整');
  }
} catch (e) {
  console.log('❌ API配置测试失败:', e.message);
  failed++;
}

// 测试6：检查云端同步
console.log('\n📋 测试6: 云端同步');
try {
  const syncCode = fs.readFileSync(path.join(__dirname, 'src/services/CloudSync.ts'), 'utf8');
  if (syncCode.includes('class CloudSync') && 
      syncCode.includes('syncToCloud') &&
      syncCode.includes('loadFromCloud')) {
    console.log('✅ 云端同步功能完整');
    passed++;
  } else {
    throw new Error('云端同步代码不完整');
  }
} catch (e) {
  console.log('❌ 云端同步测试失败:', e.message);
  failed++;
}

// 测试7：检查Token计费
console.log('\n📋 测试7: Token计费');
try {
  const billingCode = fs.readFileSync(path.join(__dirname, 'src/services/TokenBilling.ts'), 'utf8');
  if (billingCode.includes('class TokenBilling') && 
      billingCode.includes('consumeTokens') &&
      billingCode.includes('getBalance')) {
    console.log('✅ Token计费功能完整');
    passed++;
  } else {
    throw new Error('Token计费代码不完整');
  }
} catch (e) {
  console.log('❌ Token计费测试失败:', e.message);
  failed++;
}

// 测试8：检查UI组件
console.log('\n📋 测试8: UI组件');
try {
  const chatScreen = fs.readFileSync(path.join(__dirname, 'src/components/ChatScreen.tsx'), 'utf8');
  const memoryScreen = fs.readFileSync(path.join(__dirname, 'src/components/MemoryScreen.tsx'), 'utf8');
  
  if (chatScreen.includes('ChatScreen') && memoryScreen.includes('MemoryScreen')) {
    console.log('✅ UI组件完整');
    passed++;
  } else {
    throw new Error('UI组件不完整');
  }
} catch (e) {
  console.log('❌ UI组件测试失败:', e.message);
  failed++;
}

// 测试9：代码大小检查
console.log('\n📋 测试9: 代码大小');
try {
  const picoSize = fs.statSync(path.join(__dirname, 'src/services/PicoClaw.ts')).size;
  const sizeKB = (picoSize / 1024).toFixed(1);
  
  if (picoSize < 30 * 1024) {
    console.log(`✅ PicoClaw大小: ${sizeKB}KB < 30KB`);
    passed++;
  } else {
    throw new Error(`PicoClaw大小: ${sizeKB}KB > 30KB`);
  }
} catch (e) {
  console.log('❌ 代码大小测试失败:', e.message);
  failed++;
}

// 测试10：依赖检查
console.log('\n📋 测试10: 依赖配置');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const required = ['expo', 'react', 'react-native', '@react-navigation/native'];
  
  let allDeps = true;
  required.forEach(dep => {
    if (pkg.dependencies[dep]) {
      console.log(`  ✅ ${dep}: ${pkg.dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep}: 缺失`);
      allDeps = false;
    }
  });

  if (allDeps) {
    console.log('✅ 依赖配置完整');
    passed++;
  } else {
    throw new Error('依赖配置不完整');
  }
} catch (e) {
  console.log('❌ 依赖配置测试失败:', e.message);
  failed++;
}

// 最终结果
console.log('\n' + '='.repeat(50));
console.log(`\n📊 测试结果:`);
console.log(`   ✅ 通过: ${passed}`);
console.log(`   ❌ 失败: ${failed}`);
console.log(`   📈 通过率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 所有测试通过！');
  console.log('\n📱 下一步:');
  console.log('   1. 等待npm install完成');
  console.log('   2. 运行: npm start');
  console.log('   3. 在模拟器或真机上测试');
  process.exit(0);
} else {
  console.log('\n⚠️ 有测试失败');
  process.exit(1);
}