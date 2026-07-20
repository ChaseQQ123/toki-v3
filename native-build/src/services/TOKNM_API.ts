// TOKNM API 服务
// 用于调用 TOKNM 平台的 AI 模型

const TOKNM_CONFIG = {
  // Gateway 代理地址（安全）
  baseUrl: 'https://toknm.hk/v1',
  apiKey: 'toknm-ea9f3d84920d4dc9a718b8e55021100f',
  defaultModel: 'glm-4-flash',
  
  // 多模态模型配置（阿里云）
  multimodal: {
    baseUrl: 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
    apiKey: 'sk-sp-H.RXIPE.ZRDm.MEYCIQCsk1q5MzpT8Nrfmi3FgVxaJ_EIK5wFZE8-5BIEkaiRcAIhAPWROp-D_0gKZ5H75WsH8a7-x9kxAl7zQ0zfK-TtmRfT',
    model: 'qwen3.8-max-preview'
  }
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

  // 多模态：图片理解（阿里云 qwen）
  async analyzeImage(imageUrl: string, question: string): Promise<string> {
    try {
      const response = await fetch(`${TOKNM_CONFIG.multimodal.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKNM_CONFIG.multimodal.apiKey}`
        },
        body: JSON.stringify({
          model: TOKNM_CONFIG.multimodal.model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: question || '请描述这张图片' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }],
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      } else {
        throw new Error('图片分析失败');
      }
    } catch (error) {
      console.error('图片分析错误:', error);
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