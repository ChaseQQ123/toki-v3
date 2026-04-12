// 智能 API 路由服务
// 根据请求类型自动选择最优API

import { API_CONFIG } from '../utils/constants';

export type RequestType = 'chat' | 'image' | 'video' | 'vision' | 'voice';

export class SmartRouter {
  private config = API_CONFIG;

  // 路由到最优API
  route(type: RequestType) {
    const rule = this.config.routing.rules.find(r => r.type === type);
    
    if (!rule) {
      return {
        provider: this.config.routing.default,
        config: this.config[this.config.routing.default]
      };
    }

    return {
      provider: rule.provider,
      model: rule.model,
      config: this.config[rule.provider]
    };
  }

  // 智谱AI调用
  async callZhipuAI(endpoint: string, data: any, model?: string) {
    const response = await fetch(`${this.config.zhipu.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.zhipu.apiKey}`
      },
      body: JSON.stringify({ ...data, model: model || this.config.zhipu.models.chat })
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }

    return await response.json();
  }

  // 讯飞星火调用（WebSocket）
  async callXunfeiSpark(text: string): Promise<string> {
    // 讯飞星火使用WebSocket，这里简化处理
    // 实际集成需要使用讯飞SDK
    return `讯飞星火回复: ${text}`;
  }
}

export default new SmartRouter();