// TOKI V4.0 - 讯飞星火AI集成
// Spark Lite - 无限免费

const SPARK_CONFIG = {
    APPID: '375ffe02',
    APIKey: 'a5f5156fb7cb051d55866912f67178d0',
    APISecret: 'ZGNkYWM3MmYyNmIzYjUwYTYwZGZmZjA5',
    model: 'spark-lite' // 无限免费
};

// ============ 讯飞星火 WebSocket 调用 ============
class SparkAI {
    constructor(config) {
        this.config = config;
        this.wsUrl = this.getWsUrl();
    }
    
    // 生成鉴权URL
    getWsUrl() {
        const host = 'spark-api.xf-yun.com';
        const path = '/v1.1/chat';
        const date = new Date().toUTCString();
        
        // 生成签名
        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
        const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.config.APISecret);
        const signature = CryptoJS.enc.Base64.stringify(signatureSha);
        const authorizationOrigin = `api_key="${this.config.APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
        const authorization = btoa(authorizationOrigin);
        
        return `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
    }
    
    // 发送消息
    async chat(message, history = []) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(this.wsUrl);
            let response = '';
            
            ws.onopen = () => {
                const data = {
                    header: {
                        app_id: this.config.APPID,
                        uid: 'user_001'
                    },
                    parameter: {
                        chat: {
                            domain: 'general',
                            temperature: 0.7,
                            max_tokens: 500
                        }
                    },
                    payload: {
                        message: {
                            text: [
                                ...history.map(h => ({
                                    role: h.role === 'assistant' ? 'assistant' : 'user',
                                    content: h.content
                                })),
                                {
                                    role: 'user',
                                    content: message
                                }
                            ]
                        }
                    }
                };
                ws.send(JSON.stringify(data));
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.payload?.choices?.text) {
                    response += data.payload.choices.text[0].content;
                }
                if (data.header.code === 0 && data.header.status === 2) {
                    ws.close();
                    resolve(response);
                }
            };
            
            ws.onerror = (error) => {
                console.error('星火AI错误:', error);
                resolve('抱歉，我暂时无法回应。');
            };
            
            ws.onclose = () => {
                if (!response) {
                    resolve('网络出现问题，请重试。');
                }
            };
            
            // 超时处理
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                    resolve(response || '响应超时，请重试。');
                }
            }, 30000);
        });
    }
}

// ============ 简化版：HTTP API调用 ============
async function callSparkAI(message) {
    // 星火 Lite 使用简单的HTTP接口
    const url = 'https://spark-api-open.xf-yun.com/v1/chat';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SPARK_CONFIG.APIKey}`
            },
            body: JSON.stringify({
                model: 'spark-lite',
                messages: [
                    {
                        role: 'system',
                        content: '你是TOKI，一只友善的熊猫AI助手。回答简洁友好，善用表情符号。'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '抱歉，我暂时无法回应。';
    } catch (error) {
        console.error('星火AI调用失败:', error);
        // 返回模拟回复
        return getMockResponse(message);
    }
}

// ============ 模拟回复 ============
function getMockResponse(message) {
    const responses = [
        '好的，我明白了！🐼',
        '这个很有意思！让我想想...',
        '收到！我可以帮你处理这个。',
        '明白了！还有什么问题吗？',
        '我记住了！继续说吧。',
        '好的，请稍等...',
        '明白了！我帮你处理。'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// ============ 导出 ============
window.SPARK_CONFIG = SPARK_CONFIG;
window.SparkAI = SparkAI;
window.callSparkAI = callSparkAI;
