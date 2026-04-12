// TOKNM API 服务 - 支持智能路由
// 自动选择最优API，节省成本

import SmartRouter, { RequestType } from './SmartRouter';
import { API_CONFIG } from '../utils/constants';

export class TOKNM_API_v2 {
  private router = SmartRouter;

  // 智能对话
  async chat(message: string, context?: string): Promise<string> {
    try {
      const route = this.router.route('chat');
      
      const messages = [];
      if (context) {
        messages.push({ role: 'system', content: context });
      }
      messages.push({ role: 'user', content: message });

      const data = await this.router.callZhipuAI('chat/completions', {
        messages: messages
      }, route.model);

      return data.choices[0].message.content;
    } catch (error) {
      console.error('对话错误:', error);
      throw error;
    }
  }

  // 图像生成
  async generateImage(prompt: string): Promise<string> {
    try {
      const route = this.router.route('image');
      
      const data = await this.router.callZhipuAI('images/generations', {
        prompt: prompt
      }, route.model);

      return data.data[0].url;
    } catch (error) {
      console.error('图像生成错误:', error);
      throw error;
    }
  }

  // 视频生成
  async generateVideo(prompt: string): Promise<string> {
    try {
      const route = this.router.route('video');
      
      const data = await this.router.callZhipuAI('videos/generations', {
        prompt: prompt
      }, route.model);

      return data.data[0].url;
    } catch (error) {
      console.error('视频生成错误:', error);
      throw error;
    }
  }

  // 图像识别
  async recognizeImage(imageUrl: string, question?: string): Promise<string> {
    try {
      const route = this.router.route('vision');
      
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: question || '请描述这张图片' }
          ]
        }
      ];

      const data = await this.router.callZhipuAI('chat/completions', {
        messages: messages
      }, route.model);

      return data.choices[0].message.content;
    } catch (error) {
      console.error('图像识别错误:', error);
      throw error;
    }
  }

  // 语音识别（使用讯飞星火）
  async recognizeVoice(audioUrl: string): Promise<string> {
    try {
      // 讯飞星火语音识别
      // 实际实现需要使用讯飞SDK
      return '语音识别结果（需要集成讯飞SDK）';
    } catch (error) {
      console.error('语音识别错误:', error);
      throw error;
    }
  }

  // Token使用统计
  async getTokenUsage(): Promise<{ used: number; remaining: number }> {
    // 智谱AI免费，无需计费
    // 返回模拟数据
    return {
      used: 10000,
      remaining: 999990000
    };
  }

  // 获取路由信息
  getRouteInfo(type: RequestType) {
    return this.router.route(type);
  }
}

export default new TOKNM_API_v2();