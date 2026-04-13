/**
 * TOKI V4.0 浏览器测试
 * 在浏览器中运行
 */

const TOKIBrowserTest = {
    passed: 0,
    failed: 0,
    results: []
};

function test(name, fn) {
    TOKIBrowserTest.results.push({ name, fn });
}

async function runBrowserTests() {
    console.log('🧪 TOKI V4.0 浏览器测试\n');
    
    const output = document.getElementById('testOutput');
    output.innerHTML = '<h3>测试进行中...</h3>';
    
    for (const { name, fn } of TOKIBrowserTest.results) {
        try {
            await fn();
            TOKIBrowserTest.passed++;
            console.log(`✅ ${name}`);
        } catch (error) {
            TOKIBrowserTest.failed++;
            console.log(`❌ ${name}: ${error.message}`);
        }
    }
    
    // 显示结果
    const success = TOKIBrowserTest.failed === 0;
    output.innerHTML = `
        <h3 style="color: ${success ? '#4CAF50' : '#f44336'}">
            ${success ? '✅ 所有测试通过' : '❌ 部分测试失败'}
        </h3>
        <div class="test-stats">
            <div>✅ 通过: ${TOKIBrowserTest.passed}</div>
            <div>❌ 失败: ${TOKIBrowserTest.failed}</div>
            <div>📈 成功率: ${(TOKIBrowserTest.passed / TOKIBrowserTest.results.length * 100).toFixed(1)}%</div>
        </div>
    `;
}

// ============ 断言函数 ============
function assert(condition, message) {
    if (!condition) throw new Error(message || '断言失败');
}

// ============ 浏览器功能测试 ============

test('Web Speech API - 语音识别支持', async () => {
    const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    assert(supported, '浏览器应支持语音识别');
});

test('Web Speech API - 语音合成支持', async () => {
    const supported = 'speechSynthesis' in window;
    assert(supported, '浏览器应支持语音合成');
});

test('Web Storage - localStorage 支持', async () => {
    const supported = 'localStorage' in window;
    assert(supported, '浏览器应支持localStorage');
});

test('Web Storage - IndexedDB 支持', async () => {
    const supported = 'indexedDB' in window;
    assert(supported, '浏览器应支持IndexedDB');
});

test('File API - FileReader 支持', async () => {
    const supported = 'FileReader' in window;
    assert(supported, '浏览器应支持FileReader');
});

test('Canvas API - Canvas 支持', async () => {
    const canvas = document.createElement('canvas');
    const supported = canvas.getContext('2d') !== null;
    assert(supported, '浏览器应支持Canvas');
});

// ============ 运行测试 ============
window.addEventListener('load', runBrowserTests);
