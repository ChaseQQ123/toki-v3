/**
 * TOKI V4.0 测试文件
 * Phase 3: 测试上线
 */

// ============ 测试套件 ============
const TOKITest = {
    passed: 0,
    failed: 0,
    tests: []
};

function test(name, fn) {
    TOKITest.tests.push({ name, fn });
}

async function runTests() {
    console.log('🧪 TOKI V4.0 测试套件\n');
    console.log('='.repeat(50));
    
    for (const { name, fn } of TOKITest.tests) {
        try {
            await fn();
            TOKITest.passed++;
            console.log(`✅ ${name}`);
        } catch (error) {
            TOKITest.failed++;
            console.log(`❌ ${name}`);
            console.log(`   错误: ${error.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 测试结果:`);
    console.log(`   ✅ 通过: ${TOKITest.passed}`);
    console.log(`   ❌ 失败: ${TOKITest.failed}`);
    console.log(`   📈 成功率: ${(TOKITest.passed / TOKITest.tests.length * 100).toFixed(1)}%`);
    
    return TOKITest.failed === 0;
}

// ============ 断言函数 ============
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || '断言失败');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `期望 ${expected}，实际 ${actual}`);
    }
}

function assertExists(value, message) {
    if (!value) {
        throw new Error(message || '值不存在');
    }
}

// ============ 模块测试 ============

// 测试1: TOKIClaw 核心模块
test('TOKIClaw - 智能路由模块加载', async () => {
    const module = await import('./tokiclaw/core/router.js');
    assertExists(module.default, 'SmartRouter 模块应存在');
});

test('TOKIClaw - 情绪系统模块加载', async () => {
    const module = await import('./tokiclaw/core/emotion.js');
    assertExists(module.default, 'EmotionSystem 模块应存在');
});

test('TOKIClaw - ACE引擎模块加载', async () => {
    const module = await import('./tokiclaw/core/ace.js');
    assertExists(module.default, 'ACEEngine 模块应存在');
});

test('TOKIClaw - 痛觉记忆模块加载', async () => {
    const module = await import('./tokiclaw/core/nociception.js');
    assertExists(module.default, 'NociceptionSystem 模块应存在');
});

// 测试2: 智能路由逻辑
test('智能路由 - 简单消息使用轻量模型', async () => {
    const SmartRouter = (await import('./tokiclaw/core/router.js')).default;
    const router = new SmartRouter();
    
    const result = router.selectModel('你好');
    assert(result.usedLight === true, '简单消息应使用轻量模型');
});

test('智能路由 - 编程任务使用重量模型', async () => {
    const SmartRouter = (await import('./tokiclaw/core/router.js')).default;
    const router = new SmartRouter();
    
    const result = router.selectModel('```python\nprint("hello")\n```');
    assert(result.usedLight === false, '编程任务应使用重量模型');
});

test('智能路由 - 多媒体强制重量模型', async () => {
    const SmartRouter = (await import('./tokiclaw/core/router.js')).default;
    const router = new SmartRouter();
    
    const result = router.selectModel('data:image/png;base64,xxx');
    assert(result.usedLight === false, '多媒体应强制使用重量模型');
});

// 测试3: 情绪系统
test('情绪系统 - 初始状态', async () => {
    const EmotionSystem = (await import('./tokiclaw/core/emotion.js')).default;
    const emotion = new EmotionSystem();
    
    const state = emotion.getState();
    assertExists(state.mood, '应有mood属性');
    assertExists(state.confidence, '应有confidence属性');
    assert(state.mood >= 0 && state.mood <= 1, 'mood应在0-1之间');
});

test('情绪系统 - 成功后情绪提升', async () => {
    const EmotionSystem = (await import('./tokiclaw/core/emotion.js')).default;
    const emotion = new EmotionSystem();
    
    const initialMood = emotion.mood;
    emotion.onSuccess();
    assert(emotion.mood > initialMood, '成功后心情应提升');
});

test('情绪系统 - 失败后自信降低', async () => {
    const EmotionSystem = (await import('./tokiclaw/core/emotion.js')).default;
    const emotion = new EmotionSystem();
    
    const initialConfidence = emotion.confidence;
    emotion.onFailure();
    assert(emotion.confidence < initialConfidence, '失败后自信应降低');
});

// 测试4: ACE引擎
test('ACE引擎 - 时间模式识别', async () => {
    const ACEEngine = (await import('./tokiclaw/core/ace.js')).default;
    const ace = new ACEEngine();
    
    const validModes = ['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night', 'lateNight'];
    for (let hour = 0; hour < 24; hour++) {
        const mode = ace.getTimeMode(hour);
        assert(validModes.includes(mode), `${hour}点的时间模式应有效`);
    }
});

test('ACE引擎 - 环境感知', async () => {
    const ACEEngine = (await import('./tokiclaw/core/ace.js')).default;
    const ace = new ACEEngine();
    
    const env = ace.senseEnvironment();
    assertExists(env.time, '应有time属性');
    assertExists(env.hour, '应有hour属性');
});

// 测试5: 痛觉记忆
test('痛觉记忆 - 阈值机制', async () => {
    const NociceptionSystem = (await import('./tokiclaw/core/nociception.js')).default;
    const nociception = new NociceptionSystem();
    
    // 1次失败
    nociception.recordPain('test', 'harm', 'strategy');
    let result = nociception.checkTaboo('test');
    assert(result.isTaboo === false, '1次失败不应成为禁忌');
    
    // 2次失败
    nociception.recordPain('test', 'harm', 'strategy');
    result = nociception.checkTaboo('test');
    assert(result.isTaboo === false, '2次失败不应成为禁忌');
    
    // 3次失败
    nociception.recordPain('test', 'harm', 'strategy');
    result = nociception.checkTaboo('test');
    assert(result.isTaboo === true, '3次失败应成为禁忌');
});

// 测试6: DNA系统
test('DNA系统 - 染色体加载', async () => {
    const { DNASystem } = await import('./tokiclaw/dna/chromosome.js');
    const dna = new DNASystem();
    
    assertExists(dna.chromosomes, '应有chromosomes属性');
});

// ============ 性能测试 ============
test('性能 - 智能路由响应时间', async () => {
    const SmartRouter = (await import('./tokiclaw/core/router.js')).default;
    const router = new SmartRouter();
    
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
        router.selectModel('测试消息');
    }
    const end = performance.now();
    
    const avgTime = (end - start) / 1000;
    assert(avgTime < 1, `平均响应时间应小于1ms，实际: ${avgTime.toFixed(3)}ms`);
    console.log(`   ⚡ 平均响应时间: ${avgTime.toFixed(3)}ms`);
});

test('性能 - 情绪系统响应时间', async () => {
    const EmotionSystem = (await import('./tokiclaw/core/emotion.js')).default;
    const emotion = new EmotionSystem();
    
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
        emotion.onSuccess();
        emotion.getState();
    }
    const end = performance.now();
    
    const avgTime = (end - start) / 1000;
    assert(avgTime < 0.1, `平均响应时间应小于0.1ms，实际: ${avgTime.toFixed(3)}ms`);
    console.log(`   ⚡ 平均响应时间: ${avgTime.toFixed(3)}ms`);
});

// ============ 运行测试 ============
runTests().then(success => {
    process.exit(success ? 0 : 1);
});
