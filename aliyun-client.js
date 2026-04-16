/**
 * TOKI - 阿里云百炼 API 客户端
 * 集成智能路由系统
 * 创建日期：2026-04-16
 */

const CONFIG = require('./config');

/**
 * 智能路由配置
 */
const ROUTE_RULES = {
  // 简单对话
  chat: { model: 'qwen-turbo', reason: '简单对话，快速响应' },
  
  // 知识问答
  knowledge: { model: 'qwen-plus', reason: '知识问答，性价比最优' },
  
  // 创作写作
  writing: { model: 'qwen-plus', reason: '创作写作，平衡性能' },
  
  // 代码编程
  coding: { model: 'qwen-coder', reason: '代码编程，专业模型' },
  
  // 数学计算
  math: { model: 'qwen-turbo', reason: '数学计算，快速响应' },
  
  // 逻辑推理
  reasoning: { model: 'qwen-max', reason: '逻辑推理，最强模型' },
  
  // 图像识别
  vision: { model: 'qwen-vl-max', reason: '图像识别，视觉模型' },
  
  // 语音相关
  audio: { model: 'qwen-plus', reason: '语音相关，配合语音模型' },
  
  // 文件处理
  document: { model: 'qwen-long', reason: '文件处理，长上下文' },
  
  // 日程管理
  schedule: { model: 'qwen-turbo', reason: '日程管理，快速响应' }
};

/**
 * 意图识别模式
 */
const INTENT_PATTERNS = {
  chat: [/你好 | 您好|hello|hi|hey/i, /在吗 | 在嘛/i, /谢谢 | 感谢/i, /再见 | 拜拜/i],
  knowledge: [/是什么 | 为什么|怎么做|如何/i, /什么是 | 谁 | 哪里/i, /解释 | 说明/i],
  writing: [/写一封 | 写一篇 | 写一个/i, /帮我写 | 创作/i, /总结 | 摘要 | 翻译/i],
  coding: [/写代码 | 编程 | 开发/i, /函数 | 类|方法/i, /bug|错误 | 异常/i],
  math: [/计算 | 算一下 | 等于/i, /\d+\s*[+\-*/]\s*\d+/i, /公式 | 方程/i],
  reasoning: [/推理 | 分析 | 判断/i, /如果...那么 | 假设/i, /比较 | 对比 | 区别/i],
  vision: [/这是什么 | 看看这个 | 识别 | 图片/i, /照片 | 图像|截图/i],
  audio: [/语音 | 声音 | 说话/i, /朗读 | 读出来/i],
  document: [/pdf|word|excel|文档 | 文件/i, /ppt|演示文稿/i, /转换 | 格式/i],
  schedule: [/提醒 | 闹钟 | 日程/i, /会议 | 约会 | 待办/i, /明天 | 下周 | 几点/i]
};

/**
 * 阿里云客户端类
 */
class AliyunClient {
  constructor() {
    this.apiKey = CONFIG.aliyun.apiKey;
    this.baseUrl = CONFIG.aliyun.baseUrl;
    this.routeHistory = [];
  }

  /**
   * 识别意图
   */
  recognizeIntent(message) {
    const scores = {};
    
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      scores[intent] = 0;
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          scores[intent] += 1;
        }
      }
    }
    
    let bestIntent = 'chat';
    let bestScore = 0;
    
    for (const [intent, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestIntent = intent;
        bestScore = score;
      }
    }
    
    return { intent: bestIntent, confidence: bestScore };
  }

  /**
   * 评估复杂度
   */
  assessComplexity(message, history = []) {
    let complexity = 0.5;
    
    if (message.length > 500) complexity += 0.2;
    else if (message.length > 200) complexity += 0.1;
    
    if (history.length > 20) complexity += 0.1;
    else if (history.length > 10) complexity += 0.05;
    
    if (message.includes('详细') || message.includes('深入')) complexity += 0.15;
    if (message.includes('简单') || message.includes('快速')) complexity -= 0.1;
    
    return Math.min(1, Math.max(0, complexity));
  }

  /**
   * 选择模型（智能路由）
   */
  selectModel(message, history = []) {
    const intent = this.recognizeIntent(message);
    const complexity = this.assessComplexity(message, history);
    
    let route = ROUTE_RULES[intent.intent] || ROUTE_RULES.chat;
    let model = route.model;
    
    // 根据复杂度调整
    if (complexity > 0.8 && model !== 'qwen-max') {
      model = 'qwen-max';
    } else if (complexity > 0.6 && model === 'qwen-turbo') {
      model = 'qwen-plus';
    }
    
    // 成本优化
    if (CONFIG.router.costOptimization) {
      if (complexity < 0.3 && model === 'qwen-plus') {
        model = 'qwen-turbo';
      }
    }
    
    const routeInfo = {
      model,
      provider: 'aliyun',
      intent: intent.intent,
      complexity,
      reason: `${route.reason}（复杂度：${(complexity * 100).toFixed(0)}%）`,
      score: intent.confidence
    };
    
    // 记录路由历史
    this.routeHistory.push({
      timestamp: Date.now(),
      message: message.slice(0, 100),
      ...routeInfo
    });
    
    return routeInfo;
  }

  /**
   * 发送聊天请求
   */
  async chat(messages, options = {}) {
    const lastMessage = messages[messages.length - 1]?.content || '';
    const route = this.selectModel(lastMessage, messages);
    
    const model = options.model || route.model;
    
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          input: {
            messages: this.formatMessages(messages)
          },
          parameters: {
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000,
            result_format: 'message'
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`阿里云 API 错误：${error.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.output?.choices?.[0]?.message?.content || '',
        model: model,
        usage: data.usage || {},
        provider: 'aliyun',
        route: route
      };
    } catch (error) {
      console.error('阿里云 API 调用失败:', error);
      throw error;
    }
  }

  /**
   * 视觉识别
   */
  async vision(imageUrl, question, options = {}) {
    const model = options.model || 'qwen-vl-max';
    
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/multimodal-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          input: {
            messages: [{
              role: 'user',
              content: [
                { image: imageUrl },
                { text: question }
              ]
            }]
          },
          parameters: {
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000
          }
        })
      });

      const data = await response.json();
      
      return {
        content: data.output?.choices?.[0]?.message?.content || '',
        model: model,
        provider: 'aliyun'
      };
    } catch (error) {
      console.error('视觉识别失败:', error);
      throw error;
    }
  }

  /**
   * 文本嵌入（向量化）
   */
  async embed(text, options = {}) {
    const model = options.model || 'text-embedding-v3';
    
    try {
      const response = await fetch(`${this.baseUrl}/services/embeddings/text-embedding/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          input: {
            texts: [text]
          }
        })
      });

      const data = await response.json();
      
      return {
        embedding: data.output?.embeddings?.[0]?.embedding || [],
        model: model,
        provider: 'aliyun'
      };
    } catch (error) {
      console.error('文本嵌入失败:', error);
      throw error;
    }
  }

  /**
   * 图像生成
   */
  async generateImage(prompt, options = {}) {
    const model = options.model || 'wanx2.1-t2i-turbo';
    
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/image-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          input: { prompt },
          parameters: {
            size: options.size || '1024x1024',
            n: options.n || 1
          }
        })
      });

      const data = await response.json();
      
      return {
        imageUrl: data.output?.results?.[0]?.url || '',
        model: model,
        provider: 'aliyun'
      };
    } catch (error) {
      console.error('图像生成失败:', error);
      throw error;
    }
  }

  /**
   * 格式化消息
   */
  formatMessages(messages) {
    return messages.map(msg => ({
      role: msg.role || 'user',
      content: typeof msg.content === 'string' ? msg.content : msg.content[0]?.text || ''
    }));
  }

  /**
   * 获取路由统计
   */
  getStats() {
    const stats = {
      total: this.routeHistory.length,
      byIntent: {},
      byModel: {}
    };
    
    for (const record of this.routeHistory) {
      stats.byIntent[record.intent] = (stats.byIntent[record.intent] || 0) + 1;
      stats.byModel[record.model] = (stats.byModel[record.model] || 0) + 1;
    }
    
    return stats;
  }

  /**
   * 清除路由历史
   */
  clearHistory() {
    this.routeHistory = [];
  }
}

// 创建单例
const aliyunClient = new AliyunClient();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AliyunClient,
    aliyunClient
  };
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.AliyunClient = AliyunClient;
  window.aliyunClient = aliyunClient;
}

console.log('✅ 阿里云客户端已加载，API 密钥已配置');
