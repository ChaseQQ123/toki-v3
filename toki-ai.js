// TOKI V4.0 - 智谱AI集成配置
const TOKI_CONFIG = {
    // 智谱AI配置
    ZHIPU_API_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    ZHIPU_API_KEY: '', // 需要填入API Key
    
    // 模型选择
    MODELS: {
        light: 'glm-4-flash',    // 轻量模型（免费）
        heavy: 'glm-4',          // 重量模型
        vision: 'glm-4v-flash',  // 视觉模型（免费）
        image: 'cogview-3-flash' // 图像生成（免费）
    }
};

// ============ 智谱AI调用 ============
async function callZhipuAI(message, history = [], options = {}) {
    if (!TOKI_CONFIG.ZHIPU_API_KEY) {
        console.warn('未配置智谱AI API Key，使用模拟回复');
        return getMockResponse(message);
    }
    
    const model = options.model || TOKI_CONFIG.MODELS.light;
    
    const messages = [
        {
            role: 'system',
            content: `你是 TOKI，一只来自四川的熊猫 AI 助手。

特点：
- 性格温和、友善、乐于助人
- 说话简洁自然，不要太长
- 用表情符号增加趣味性
- 记住用户的信息和偏好

回答格式：
- 简单问题：1-2句话
- 复杂问题：分点说明
- 始终保持友善的态度`
        },
        ...history.map(h => ({
            role: h.role,
            content: h.content
        })),
        {
            role: 'user',
            content: message
        }
    ];
    
    try {
        const response = await fetch(TOKI_CONFIG.ZHIPU_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKI_CONFIG.ZHIPU_API_KEY}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
                stream: false
            })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            throw new Error(data.error?.message || '未知错误');
        }
    } catch (error) {
        console.error('智谱AI调用失败:', error);
        return getMockResponse(message);
    }
}

// ============ 模拟回复（无API时使用） ============
function getMockResponse(message) {
    const responses = [
        '好的，我明白了！🐼',
        '这个很有意思，让我想想...',
        '收到！我可以帮你处理这个。',
        '好的，请稍等，我正在处理...',
        '明白了！有什么其他问题吗？',
        '这个话题很有趣！继续说说看。',
        '我记住了！还有别的吗？'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// ============ 智能路由 ============
function selectModel(message) {
    // 检测复杂度
    const hasCode = message.includes('```');
    const isLong = message.length > 200;
    const hasImage = message.includes('data:image') || 
                     message.includes('.jpg') || 
                     message.includes('.png');
    
    if (hasImage) {
        return TOKI_CONFIG.MODELS.vision; // 图像用视觉模型
    }
    
    if (hasCode || isLong) {
        return TOKI_CONFIG.MODELS.heavy; // 复杂任务用重量模型
    }
    
    return TOKI_CONFIG.MODELS.light; // 简单任务用轻量模型（免费）
}

// ============ 导出 ============
window.TOKI_AI = {
    chat: callZhipuAI,
    selectModel: selectModel,
    config: TOKI_CONFIG
};
