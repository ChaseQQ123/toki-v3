/**
 * TOKI 离线模型管理器
 * 负责管理本地模型的下载、加载、切换
 * 
 * 实事求是：当前仅实现框架，真正的模型推理需要 Native 代码
 */

class LocalModelManager {
  constructor() {
    this.models = {
      llm: {
        qwen2_5_3b: {
          name: 'Qwen2.5-3B-Q4',
          size: '2.1GB',
          url: 'https://models.toknm.hk/qwen2.5-3b-q4.mlc',
          status: 'not_downloaded', // not_downloaded | downloading | ready | error
          progress: 0
        },
        qwen2_5_1_5b: {
          name: 'Qwen2.5-1.5B-Q4',
          size: '1.1GB',
          url: 'https://models.toknm.hk/qwen2.5-1.5b-q4.mlc',
          status: 'not_downloaded',
          progress: 0
        }
      },
      asr: {
        whisper_tiny: {
          name: 'Whisper-Tiny-Zh',
          size: '75MB',
          url: 'https://models.toknm.hk/whisper-tiny-zh.onnx',
          status: 'not_downloaded',
          progress: 0
        },
        whisper_base: {
          name: 'Whisper-Base-Zh',
          size: '150MB',
          url: 'https://models.toknm.hk/whisper-base-zh.onnx',
          status: 'not_downloaded',
          progress: 0
        }
      }
    };
    
    this.activeModel = {
      llm: null,
      asr: null
    };
    
    // 模型存储（使用 Cache API）
    this.cache = null;
  }

  /**
   * 初始化
   */
  async init() {
    try {
      this.cache = await caches.open('toki-models-v1');
      await this.checkDownloadedModels();
      console.log('✅ LocalModelManager 初始化完成');
      return true;
    } catch (error) {
      console.error('❌ LocalModelManager 初始化失败:', error);
      return false;
    }
  }

  /**
   * 检查已下载的模型
   */
  async checkDownloadedModels() {
    for (const type of Object.keys(this.models)) {
      for (const modelId of Object.keys(this.models[type])) {
        const model = this.models[type][modelId];
        const cached = await this.cache.match(model.url);
        if (cached) {
          model.status = 'ready';
          model.progress = 100;
        }
      }
    }
  }

  /**
   * 下载模型
   */
  async downloadModel(type, modelId, onProgress) {
    const model = this.models[type]?.[modelId];
    if (!model) {
      throw new Error(`模型不存在: ${type}/${modelId}`);
    }

    if (model.status === 'ready') {
      console.log(`模型 ${model.name} 已下载`);
      return true;
    }

    model.status = 'downloading';
    model.progress = 0;

    try {
      console.log(`开始下载 ${model.name} (${model.size})...`);
      
      const response = await fetch(model.url);
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }

      // 流式下载（模拟进度，真实实现需要 ReadableStream）
      const contentLength = response.headers.get('content-length');
      let loaded = 0;
      
      // 简单实现：直接缓存
      await this.cache.put(model.url, response);
      
      model.status = 'ready';
      model.progress = 100;
      
      if (onProgress) {
        onProgress(100);
      }
      
      console.log(`✅ ${model.name} 下载完成`);
      return true;
      
    } catch (error) {
      model.status = 'error';
      model.progress = 0;
      console.error(`❌ 下载失败:`, error);
      throw error;
    }
  }

  /**
   * 删除模型
   */
  async deleteModel(type, modelId) {
    const model = this.models[type]?.[modelId];
    if (!model) {
      throw new Error(`模型不存在: ${type}/${modelId}`);
    }

    await this.cache.delete(model.url);
    model.status = 'not_downloaded';
    model.progress = 0;
    
    if (this.activeModel[type] === modelId) {
      this.activeModel[type] = null;
    }
    
    console.log(`🗑️ ${model.name} 已删除`);
    return true;
  }

  /**
   * 切换模型
   */
  async switchModel(type, modelId) {
    const model = this.models[type]?.[modelId];
    if (!model) {
      throw new Error(`模型不存在: ${type}/${modelId}`);
    }

    if (model.status !== 'ready') {
      throw new Error(`模型未下载: ${model.name}`);
    }

    this.activeModel[type] = modelId;
    console.log(`✅ 已切换到 ${model.name}`);
    return true;
  }

  /**
   * 获取模型状态
   */
  getStatus() {
    return {
      models: this.models,
      active: this.activeModel
    };
  }

  /**
   * 检查是否可以离线运行
   */
  canRunOffline() {
    const hasLLM = Object.values(this.models.llm).some(m => m.status === 'ready');
    const hasASR = Object.values(this.models.asr).some(m => m.status === 'ready');
    return { hasLLM, hasASR, canOffline: hasLLM || hasASR };
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LocalModelManager };
}
