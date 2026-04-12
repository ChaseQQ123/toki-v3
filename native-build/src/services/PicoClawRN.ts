/**
 * PicoClaw React Native 适配器
 * 用于 TOKI APP 原生版本
 */

import { AsyncStorage } from 'react-native';
import PicoMemory from './memory';

export class PicoClawRN extends PicoMemory {
  constructor(config = {}) {
    super({
      ...config,
      storage: 'asyncStorage'
    });
  }

  // React Native 专用方法

  async backgroundEvolve() {
    // 后台任务：自动进化
    try {
      // 1. 整理用户画像
      const profile = await this.getUserProfile();

      // 2. 提取长期记忆
      const important = this.memories
        .filter(m => m.importance > 0.8)
        .slice(-10);

      await this.updateChromosome('MEMORY', { longTerm: important });

      console.log('🧬 Background evolution completed');
    } catch (error) {
      console.error('Evolution failed:', error);
    }
  }

  async syncToCloud(endpoint, token) {
    // 同步到TOKNM云端
    try {
      const data = await this.export();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('☁️ Synced to cloud');
        return true;
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
    return false;
  }

  async loadFromCloud(endpoint, token) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        await this.import(data);
        console.log('☁️ Loaded from cloud');
        return true;
      }
    } catch (error) {
      console.error('Load failed:', error);
    }
    return false;
  }
}

export default PicoClawRN;