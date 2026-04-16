/**
 * 阿里云百炼 API 客户端 - 浏览器版本
 * 支持：文本对话、图像识别、语音等
 * 创建日期：2026-04-16
 */

class AliyunBrowserClient {
  constructor() {
    this.apiKey = 'sk-ebea5eacead94e65aaec23f101a20a44';
    this.baseUrl = 'https://dashscope.aliyuncs.com/api/v1';
    this.routeHistory = [];
  }

  /**
   * 智能路由 - 根据消息类型选择模型
   */
  selectModel(message, hasImage = false) {
    // 如果有图片，使用视觉模型
    if (hasImage || this.isVisionIntent(message)) {
      return {
        model: 'qwen-vl-max',
        provider: 'aliyun',
        intent: 'vision',
        reason: '图像识别，使用视觉模型'
      };
    }
    
    // 简单对话
    if (this.isSimpleChat(message)) {
      return { model: 'qwen-turbo', intent: 'chat' };
    }
    
    // 知识问答
    if (this.isKnowledge(message)) {
      return { model: 'qwen-plus', intent: 'knowledge' };
    }
    
    // 代码编程
    if (this.isCoding(message)) {
      return { model: 'qwen-coder', intent: 'coding' };
    }
    
    // 复杂推理
    if (this.isReasoning(message)) {
      return { model: 'qwen-max', intent: 'reasoning' };
    }
    
    // 默认使用 qwen-plus
    return { model: 'qwen-plus', intent: 'chat' };
  }

  // 意图识别辅助函数
  isVisionIntent(msg) {
    return /图片 | 照片 | 图像 | 识别 | 看看这个 | 这是什么/i.test(msg);
  }
  
  isSimpleChat(msg) {
    return /你好 | 您好|hello|hi|在吗 | 谢谢 | 再见/i.test(msg) && msg.length < 20;
  }
  
  isKnowledge(msg) {
    return /是什么 | 为什么|怎么做|如何|什么是 | 谁 | 哪里 | 解释 | 说明/i.test(msg);
  }
  
  isCoding(msg) {
    return /写代码 | 编程 | 开发|函数 | 类 | 方法|bug|错误 | 异常|python|javascript/i.test(msg);
  }
  
  isReasoning(msg) {
    return /推理 | 分析 | 判断|如果 | 假设 | 比较 | 对比 | 区别 | 优劣/i.test(msg) && msg.length > 30;
  }

  /**
   * 文本对话
   */
  async chat(messages, options = {}) {
    const lastMessage = messages[messages.length - 1]?.content || '';
    const route = this.selectModel(lastMessage, options.hasImage);
    
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
          input: { messages },
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
   * 图像识别（视觉对话）
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
                { text: question || '请描述这张图片' }
              ]
            }]
          },
          parameters: {
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000
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
        provider: 'aliyun',
        usage: data.usage || {}
      };
      
    } catch (error) {
      console.error('视觉识别失败:', error);
      throw error;
    }
  }

  /**
   * 上传图片并识别（浏览器版本）
   */
  async uploadAndRecognize(file, question = '') {
    return new Promise((resolve, reject) => {
      // 1. 将文件转换为 Base64
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result;
          
          // 2. 调用视觉 API
          const result = await this.vision(base64, question);
          
          resolve(result);
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * 获取路由统计
   */
  getStats() {
    return {
      total: this.routeHistory.length,
      byIntent: {},
      byModel: {}
    };
  }
}

// 创建全局实例
window.aliyunBrowserClient = new AliyunBrowserClient();

console.log('✅ 阿里云浏览器客户端已加载');
