// TOKNM API 服务
// 用于调用 TOKNM 平台的 AI 模型

const TOKNM_CONFIG = {
  baseUrl: 'https://toknm.hk/api',
  apiKey: 'YOUR_API_KEY', // 从配置中读取
  defaultModel: 'glm-4-flash'
};

export class TOKNM_API {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || TOKNM_CONFIG.apiKey;
    this.baseUrl = TOKNM_CONFIG.baseUrl;
  }

  // 对话接口
  async chat(message: string, context?: string): Promise<string> {
    try {
      const messages = [];

      // 添加记忆上下文
      if (context) {
        messages.push({
          role: 'system',
          content: context
        });
      }

      // 添加用户消息
      messages.push({
        role: 'user',
        content: message
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: TOKNM_CONFIG.defaultModel,
          messages: messages
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      } else {
        throw new Error('API调用失败');
      }
    } catch (error) {
      console.error('TOKNM API错误:', error);
      throw error;
    }
  }

  // 图像生成
  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'cogview-3-flash',
          prompt: prompt
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data[0].url;
      } else {
        throw new Error('图像生成失败');
      }
    } catch (error) {
      console.error('图像生成错误:', error);
      throw error;
    }
  }

  // Token 余额查询
  async getBalance(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.balance;
      } else {
        throw new Error('查询余额失败');
      }
    } catch (error) {
      console.error('查询余额错误:', error);
      throw error;
    }
  }

  // 设置 API Key
  setApiKey(key: string) {
    this.apiKey = key;
  }
}

export default new TOKNM_API();