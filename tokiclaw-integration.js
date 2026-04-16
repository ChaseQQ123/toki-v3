/**
 * TOKIClaw 核心功能集成到 TOKI
 * 包含：记忆系统、DNA、智能路由、情绪系统
 * 创建日期：2026-04-16
 */

// ============ TOKIClaw 轻量级核心 ============

class TOKIClawCore {
  constructor(config = {}) {
    this.config = config;
    this.userId = config.userId || 'tony';
    this.userName = config.userName || 'Tony';
    
    // 核心模块
    this.memory = new MemorySystem(config.memory || {});
    this.dna = new DNASystem(config.dna || {});
    this.emotion = new EmotionSystem(config.emotion || {});
    this.router = config.router || null; // 使用 aliyun-client.js 的路由
  }

  /**
   * 初始化
   */
  async init() {
    console.log('[TOKIClaw] 开始初始化...');
    
    // 加载记忆
    await this.memory.load(this.userId);
    
    // 加载 DNA
    await this.dna.load(this.userId);
    
    console.log('[TOKIClaw] 初始化完成 ✅');
    return this;
  }

  /**
   * 处理消息（完整流程）
   */
  async processMessage(message, options = {}) {
    const startTime = Date.now();
    
    // 1. 记录用户消息
    await this.memory.add({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });
    
    // 2. 更新情绪状态
    this.emotion.update('neutral', 0.5);
    
    // 3. 智能路由选择模型
    let modelOptions = {};
    if (this.router) {
      const route = this.router.selectModel(message, await this.memory.getHistory());
      modelOptions = route;
    }
    
    // 4. 调用 AI（由外部传入的 chat 函数处理）
    const aiResponse = await options.chatFunction(message, modelOptions);
    
    // 5. 记录 AI 回复
    await this.memory.add({
      role: 'assistant',
      content: aiResponse.content,
      model: aiResponse.model,
      timestamp: Date.now()
    });
    
    // 6. 更新 DNA（学习用户偏好）
    await this.dna.learn(message, aiResponse);
    
    // 7. 计算响应时间
    const responseTime = Date.now() - startTime;
    
    return {
      ...aiResponse,
      responseTime,
      memory: true,
      dna: this.dna.export()
    };
  }

  /**
   * 获取用户画像
   */
  getUserProfile() {
    return {
      userId: this.userId,
      userName: this.userName,
      dna: this.dna.export(),
      emotion: this.emotion.getState(),
      stats: this.memory.getStats()
    };
  }

  /**
   * 搜索记忆
   */
  async searchMemory(query) {
    return await this.memory.search(query);
  }

  /**
   * 清除记忆
   */
  async clearMemory() {
    await this.memory.clear();
  }

  /**
   * 导出状态
   */
  export() {
    return {
      memory: this.memory.export(),
      dna: this.dna.export(),
      emotion: this.emotion.getState()
    };
  }

  /**
   * 导入状态
   */
  async import(data) {
    if (data.memory) await this.memory.import(data.memory);
    if (data.dna) await this.dna.import(data.dna);
    if (data.emotion) this.emotion.import(data.emotion);
  }
}

// ============ 记忆系统（JSONL 轻量版） ============

class MemorySystem {
  constructor(config = {}) {
    this.storagePath = config.storagePath || 'toki-memory';
    this.maxMessages = config.maxMessages || 100;
    this.messages = [];
    this.initialized = false;
  }

  /**
   * 加载记忆
   */
  async load(userId) {
    try {
      const key = `toki_memory_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        this.messages = JSON.parse(stored);
      }
      this.initialized = true;
      console.log(`[Memory] 已加载 ${this.messages.length} 条记忆`);
    } catch (e) {
      console.error('[Memory] 加载失败:', e);
      this.messages = [];
    }
  }

  /**
   * 添加记忆
   */
  async add(message) {
    this.messages.push(message);
    
    // 限制记忆数量
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
    
    // 保存到 localStorage
    this.save();
  }

  /**
   * 保存记忆
   */
  save() {
    try {
      const key = `toki_memory_${this.userId || 'default'}`;
      localStorage.setItem(key, JSON.stringify(this.messages));
    } catch (e) {
      console.error('[Memory] 保存失败:', e);
    }
  }

  /**
   * 获取历史
   */
  async getHistory() {
    return this.messages.slice(-50); // 返回最近 50 条
  }

  /**
   * 搜索记忆
   */
  async search(query) {
    const results = this.messages.filter(msg =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
    return results.slice(-10);
  }

  /**
   * 清除记忆
   */
  async clear() {
    this.messages = [];
    this.save();
  }

  /**
   * 获取统计
   */
  getStats() {
    return {
      total: this.messages.length,
      user: this.messages.filter(m => m.role === 'user').length,
      assistant: this.messages.filter(m => m.role === 'assistant').length
    };
  }

  /**
   * 导出
   */
  export() {
    return {
      messages: this.messages,
      stats: this.getStats()
    };
  }

  /**
   * 导入
   */
  async import(data) {
    if (data.messages) {
      this.messages = data.messages;
      this.save();
    }
  }
}

// ============ DNA 系统（用户画像） ============

class DNASystem {
  constructor(config = {}) {
    this.chromosomes = {
      preferences: {},      // 偏好
      habits: {},          // 习惯
      knowledge: {},       // 知识领域
      personality: {}      // 性格特征
    };
    this.version = 1;
  }

  /**
   * 加载 DNA
   */
  async load(userId) {
    try {
      const key = `toki_dna_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        this.chromosomes = { ...this.chromosomes, ...data.chromosomes };
        this.version = data.version || 1;
      }
      console.log(`[DNA] 已加载 v${this.version}`);
    } catch (e) {
      console.error('[DNA] 加载失败:', e);
    }
  }

  /**
   * 学习用户行为
   */
  async learn(message, response) {
    // 学习偏好
    if (message.includes('喜欢') || message.includes('不喜欢')) {
      this.chromosomes.preferences[message] = response.content;
    }
    
    // 学习习惯
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 12) {
      this.chromosomes.habs.morning = (this.chromosomes.habits.morning || 0) + 1;
    }
    
    // 保存
    this.save();
  }

  /**
   * 保存 DNA
   */
  save() {
    try {
      const key = `toki_dna_${this.userId || 'default'}`;
      localStorage.setItem(key, JSON.stringify({
        chromosomes: this.chromosomes,
        version: this.version
      }));
    } catch (e) {
      console.error('[DNA] 保存失败:', e);
    }
  }

  /**
   * 导出
   */
  export() {
    return {
      chromosomes: this.chromosomes,
      version: this.version
    };
  }

  /**
   * 导入
   */
  async import(data) {
    if (data.chromosomes) {
      this.chromosomes = data.chromosomes;
      this.version = data.version || 1;
      this.save();
    }
  }
}

// ============ 情绪系统 ============

class EmotionSystem {
  constructor(config = {}) {
    this.state = {
      valence: 0.5,    // 愉悦度 (0-1)
      arousal: 0.5,    // 唤醒度 (0-1)
      dominance: 0.5,  // 主导度 (0-1)
      mood: 'neutral'  // 心情
    };
  }

  /**
   * 更新情绪
   */
  update(mood, intensity) {
    this.state.mood = mood;
    this.state.valence = intensity;
  }

  /**
   * 获取状态
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 导入
   */
  import(data) {
    if (data) {
      this.state = { ...this.state, ...data };
    }
  }
}

// ============ 导出 ============

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TOKIClawCore,
    MemorySystem,
    DNASystem,
    EmotionSystem
  };
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.TOKIClawCore = TOKIClawCore;
  window.MemorySystem = MemorySystem;
  window.DNASystem = DNASystem;
  window.EmotionSystem = EmotionSystem;
}

console.log('✅ TOKIClaw 核心已加载');
