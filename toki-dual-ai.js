// TOKI V4.0 - 双AI引擎
// 支持讯飞星火（无限免费）和智谱AI（免费额度）

const AI_ENGINES = {
    // 讯飞星火 Lite - 无限免费
    spark: {
        name: '讯飞星火 Lite',
        icon: '🔥',
        type: 'free-unlimited',
        APPID: '375ffe02',
        APIKey: 'a5f5156fb7cb051d55866912f67178d0',
        APISecret: 'ZGNkYWM3MmYyNmIzYjUwYTYwZGZmZjA5'
    },
    
    // 智谱AI - GLM-4-Flash免费
    zhipu: {
        name: '智谱 GLM-4-Flash',
        icon: '💚',
        type: 'free-quota',
        APIKey: '', // 需要用户自己配置
        URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    }
};

// 当前选择的AI引擎
let currentEngine = 'spark';

// ============ 讯飞星火调用 ============
async function callSpark(message, history = []) {
    const config = AI_ENGINES.spark;
    
    try {
        const response = await fetch('https://spark-api-open.xf-yun.com/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.APIKey}`
            },
            body: JSON.stringify({
                model: 'spark-lite',
                messages: [
                    { role: 'system', content: '你是TOKI，一只友善的熊猫AI助手。回答简洁友好，善用表情符号。' },
                    ...history,
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (e) {
        console.error('星火调用失败:', e);
        return null;
    }
}

// ============ 智谱AI调用 ============
async function callZhipu(message, history = []) {
    const config = AI_ENGINES.zhipu;
    
    if (!config.APIKey) {
        return null; // 未配置API Key
    }
    
    try {
        const response = await fetch(config.URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.APIKey}`
            },
            body: JSON.stringify({
                model: 'glm-4-flash', // 免费模型
                messages: [
                    { role: 'system', content: '你是TOKI，一只友善的熊猫AI助手。回答简洁友好，善用表情符号。' },
                    ...history,
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (e) {
        console.error('智谱调用失败:', e);
        return null;
    }
}

// ============ 统一调用接口 ============
async function callAI(message, history = []) {
    const historyFormatted = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content
    }));
    
    // 尝试当前选择的引擎
    let response = null;
    
    if (currentEngine === 'zhipu') {
        response = await callZhipu(message, historyFormatted);
        if (!response) {
            // 智谱失败，回退到星火
            console.log('智谱AI不可用，回退到星火');
            response = await callSpark(message, historyFormatted);
        }
    } else {
        response = await callSpark(message, historyFormatted);
    }
    
    // 如果都失败，返回模拟回复
    if (!response) {
        response = getMockResponse();
    }
    
    return response;
}

// ============ 模拟回复 ============
function getMockResponse() {
    const responses = [
        '好的，我明白了！🐼',
        '这个很有意思！',
        '收到！我可以帮你。',
        '明白了！还有问题吗？',
        '好的，我记住了！'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// ============ 切换AI引擎 ============
function switchEngine(engine) {
    if (AI_ENGINES[engine]) {
        currentEngine = engine;
        localStorage.setItem('toki_ai_engine', engine);
        return true;
    }
    return false;
}

// ============ 配置智谱API Key ============
function configureZhipuKey(apiKey) {
    AI_ENGINES.zhipu.APIKey = apiKey;
    localStorage.setItem('zhipu_api_key', apiKey);
}

// ============ 初始化 ============
function initAI() {
    // 加载保存的设置
    const savedEngine = localStorage.getItem('toki_ai_engine');
    if (savedEngine && AI_ENGINES[savedEngine]) {
        currentEngine = savedEngine;
    }
    
    const savedZhipuKey = localStorage.getItem('zhipu_api_key');
    if (savedZhipuKey) {
        AI_ENGINES.zhipu.APIKey = savedZhipuKey;
    }
}

// 导出
window.AI_ENGINES = AI_ENGINES;
window.callAI = callAI;
window.switchEngine = switchEngine;
window.configureZhipuKey = configureZhipuKey;
window.initAI = initAI;
window.getCurrentEngine = () => currentEngine;
