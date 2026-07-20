/**
 * TOKI 本地向量记忆系统
 * 使用 sqlite-vec 或简化方案实现本地向量存储
 * 
 * 实事求是：当前使用 localStorage + 简化版向量搜索
 * 完整版需要集成 sqlite-vec-wasm
 */

class LocalVectorMemory {
  constructor() {
    this.storageKey = 'toki_vector_memory';
    this.memories = [];
    this.dimension = 384; // all-MiniLM-L6-v2 维度
    
    // 使用云端嵌入API（阿里云 text-embedding-v3）
    this.embedFn = this.cloudEmbed.bind(this);
    this.apiConfig = {
      url: 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding',
      model: 'text-embedding-v3',
      apiKey: null // 运行时注入
    };
  }

  /**
   * 初始化
   * @param {Object} config - 配置选项
   * @param {string} config.apiKey - 嵌入API Key（可选）
   */
  async init(config = {}) {
    try {
      // 设置API Key
      if (config.apiKey) {
        this.apiConfig.apiKey = config.apiKey;
      }
      
      const stored = localStorage.getItem(this.storageKey);
      this.memories = stored ? JSON.parse(stored) : [];
      console.log(`✅ LocalVectorMemory 初始化完成，已有 ${this.memories.length} 条记忆`);
      
      if (this.apiConfig.apiKey) {
        console.log('✅ 已配置云端嵌入API');
      } else {
        console.warn('⚠️ 未配置嵌入API，使用简化版嵌入');
      }
      
      return true;
    } catch (error) {
      console.error('❌ LocalVectorMemory 初始化失败:', error);
      this.memories = [];
      return false;
    }
  }

  /**
   * 云端嵌入API（阿里云 text-embedding-v3）
   * 返回真实向量，语义搜索有效
   */
  async cloudEmbed(text) {
    // 如果没有API Key，回退到简化版
    if (!this.apiConfig.apiKey) {
      console.warn('未配置嵌入API Key，使用简化版嵌入');
      return this.simpleEmbed(text);
    }

    try {
      const response = await fetch(this.apiConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: this.apiConfig.model,
          input: {
            texts: [text]
          },
          parameters: {
            text_type: 'query'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`嵌入API失败: ${response.status}`);
      }

      const data = await response.json();
      const embedding = data.output?.embeddings?.[0]?.embedding;
      
      if (embedding) {
        this.dimension = embedding.length; // 更新维度
        return embedding;
      }
      
      throw new Error('嵌入返回格式错误');
      
    } catch (error) {
      console.error('云端嵌入失败:', error);
      return this.simpleEmbed(text);
    }
  }

  /**
   * 简化版嵌入函数（回退方案）
   */
  simpleEmbed(text) {
    const vector = new Array(this.dimension).fill(0);
    const chars = text.toLowerCase().split('');
    
    for (let i = 0; i < chars.length && i < 1000; i++) {
      const charCode = chars[i].charCodeAt(0);
      const idx = charCode % this.dimension;
      vector[idx] = Math.min(vector[idx] + 0.1, 1);
    }
    
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return norm > 0 ? vector.map(v => v / norm) : vector;
  }

  /**
   * 余弦相似度
   */
  cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  /**
   * 添加记忆
   */
  async addMemory(content, metadata = {}) {
    const vector = await this.embedFn(content);
    
    const memory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      vector,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
        accessCount: 0
      }
    };
    
    this.memories.push(memory);
    this.save();
    
    console.log(`📝 已添加记忆: ${content.substring(0, 50)}...`);
    return memory.id;
  }

  /**
   * 搜索相关记忆
   */
  async search(query, topK = 5) {
    const queryVector = await this.embedFn(query);
    
    const scored = this.memories.map(memory => ({
      memory,
      score: this.cosineSimilarity(queryVector, memory.vector)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    // 更新访问计数
    const results = scored.slice(0, topK);
    results.forEach(item => {
      item.memory.metadata.accessCount++;
    });
    this.save();
    
    return results.map(r => ({
      content: r.memory.content,
      score: r.score,
      metadata: r.memory.metadata
    }));
  }

  /**
   * 删除记忆
   */
  async deleteMemory(id) {
    const index = this.memories.findIndex(m => m.id === id);
    if (index >= 0) {
      this.memories.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  /**
   * 清空所有记忆
   */
  async clearAll() {
    this.memories = [];
    this.save();
    console.log('🗑️ 已清空所有记忆');
  }

  /**
   * 导出记忆
   */
  async export() {
    return {
      memories: this.memories.map(m => ({
        content: m.content,
        metadata: m.metadata
      })),
      exportedAt: Date.now()
    };
  }

  /**
   * 导入记忆
   */
  async import(data) {
    for (const item of data.memories) {
      await this.addMemory(item.content, item.metadata);
    }
    console.log(`📥 已导入 ${data.memories.length} 条记忆`);
  }

  /**
   * 保存到 localStorage
   * 注意：保存包含向量的完整记忆（可能很大）
   */
  save() {
    try {
      // 保存完整的记忆（包括向量）
      localStorage.setItem(this.storageKey, JSON.stringify(this.memories));
    } catch (error) {
      console.warn('记忆存储空间不足，清理旧记忆...');
      this.cleanup();
    }
  }

  /**
   * 清理旧记忆
   */
  cleanup() {
    // 保留最近100条
    if (this.memories.length > 100) {
      this.memories.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);
      this.memories = this.memories.slice(0, 100);
      this.save();
    }
  }

  /**
   * 统计信息
   */
  getStats() {
    return {
      total: this.memories.length,
      oldestTimestamp: this.memories.length > 0 
        ? Math.min(...this.memories.map(m => m.metadata.timestamp))
        : null,
      newestTimestamp: this.memories.length > 0
        ? Math.max(...this.memories.map(m => m.metadata.timestamp))
        : null
    };
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LocalVectorMemory };
}
