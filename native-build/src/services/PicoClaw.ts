/**
 * PicoClaw - 轻量级记忆系统
 * 目标：<30KB，多平台适配，完全离线
 *
 * 适用：React Native / Web / 小程序
 */

class PicoMemory {
  constructor(config = {}) {
    this.config = {
      maxMemories: config.maxMemories || 1000,
      decayDays: config.decayDays || 7,
      storage: config.storage || 'memory',  // 'memory' | 'asyncStorage' | 'indexedDB' | 'localStorage'
      ...config
    };

    // 简化DNA（只保留3个核心）
    this.dna = {
      USER: { preferences: [], habits: [] },
      MEMORY: { longTerm: [] },
      SKILLS: { cache: [] }
    };

    // 记忆缓存
    this.memories = [];

    // 情绪状态（简化版）
    this.affect = {
      mood: 0.5,
      confidence: 0.5
    };

    // 初始化存储
    this.initPromise = this.init();
  }

  // ========== 初始化 ==========

  async init() {
    try {
      // 加载DNA
      const savedDNA = await this.load('picoclaw_dna');
      if (savedDNA) {
        this.dna = { ...this.dna, ...savedDNA };
      }

      // 加载记忆
      const savedMemories = await this.load('picoclaw_memories');
      if (savedMemories) {
        this.memories = savedMemories;
      }

      console.log('✅ PicoMemory initialized');
      console.log(`📊 Memories: ${this.memories.length}`);
    } catch (error) {
      console.error('❌ Init failed:', error);
    }
  }

  // ========== 存储适配器 ==========

  async load(key) {
    switch (this.config.storage) {
      case 'localStorage':
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;

      case 'asyncStorage':
        // React Native AsyncStorage
        if (typeof AsyncStorage !== 'undefined') {
          const data = await AsyncStorage.getItem(key);
          return data ? JSON.parse(data) : null;
        }
        return null;

      case 'indexedDB':
        // IndexedDB (Web)
        return new Promise((resolve) => {
          const request = indexedDB.open('PicoClaw', 1);
          request.onerror = () => resolve(null);
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['store'], 'readonly');
            const store = transaction.objectStore('store');
            const get = store.get(key);
            get.onsuccess = () => resolve(get.result);
            get.onerror = () => resolve(null);
          };
          request.onupgradeneeded = () => {
            const db = request.result;
            db.createObjectStore('store');
          };
        });

      default:
        // 内存存储（默认）
        return null;
    }
  }

  async save(key, value) {
    switch (this.config.storage) {
      case 'localStorage':
        localStorage.setItem(key, JSON.stringify(value));
        break;

      case 'asyncStorage':
        if (typeof AsyncStorage !== 'undefined') {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        }
        break;

      case 'indexedDB':
        return new Promise((resolve) => {
          const request = indexedDB.open('PicoClaw', 1);
          request.onerror = () => resolve();
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['store'], 'readwrite');
            const store = transaction.objectStore('store');
            store.put(value, key);
            transaction.oncomplete = () => resolve();
          };
          request.onupgradeneeded = () => {
            const db = request.result;
            db.createObjectStore('store');
          };
        });

      default:
        // 内存存储无需持久化
        break;
    }
  }

  // ========== 记忆系统 ==========

  async memorize(input, output, metadata = {}) {
    await this.initPromise;

    const memory = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input: input.substring(0, 200),  // 限制长度
      output: output.substring(0, 500),
      metadata,
      importance: this.calculateImportance(input),
      decayWeight: 1.0,
      tags: this.extractTags(input + ' ' + output)
    };

    this.memories.push(memory);

    // 自动修剪
    if (this.memories.length > this.config.maxMemories) {
      this.prune();
    }

    // 保存
    await this.save('picoclaw_memories', this.memories);

    // 更新用户画像
    this.updateUserProfile(input);

    console.log(`✅ Memorized: ${input.substring(0, 30)}...`);
    return memory.id;
  }

  async recall(query, limit = 5) {
    await this.initPromise;

    // 应用衰减
    this.applyDecay();

    const queryWords = query.toLowerCase().split(/\s+/);

    const scored = this.memories.map(memory => {
      let score = 0;
      const text = (memory.input + ' ' + memory.output).toLowerCase();

      // 词汇匹配
      queryWords.forEach(word => {
        if (text.includes(word)) score += 1;
      });

      // 标签加分
      memory.tags.forEach(tag => {
        if (query.includes(tag)) score += 2;
      });

      // 重要性和衰减加权
      score *= memory.importance * memory.decayWeight;

      return { memory, score };
    });

    const relevant = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.memory);

    console.log(`🧠 recalled ${relevant.length} memories`);
    return relevant;
  }

  calculateImportance(input) {
    let score = 0.5;

    const important = ['重要', '必须', '记住', '偏好', '关键'];
    important.forEach(keyword => {
      if (input.includes(keyword)) score += 0.1;
    });

    return Math.min(score, 1.0);
  }

  extractTags(text) {
    const tags = [];
    const patterns = {
      '偏好': /喜欢|偏好|希望/,
      '项目': /项目|代码|文件/,
      '问题': /错误|bug|问题/
    };

    for (const [tag, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) tags.push(tag);
    }

    return tags;
  }

  applyDecay() {
    const now = Date.now();
    const halfLife = this.config.decayDays * 24 * 60 * 60 * 1000;

    this.memories.forEach(memory => {
      const age = now - new Date(memory.timestamp).getTime();
      memory.decayWeight = Math.pow(0.5, age / halfLife);
    });
  }

  prune() {
    // 按重要性排序，保留80%
    this.memories.sort((a, b) =>
      (b.importance * b.decayWeight) - (a.importance * a.decayWeight)
    );

    this.memories = this.memories.slice(0, Math.floor(this.config.maxMemories * 0.8));
    console.log(`✂️ Pruned to ${this.memories.length} memories`);
  }

  // ========== DNA系统 ==========

  async getChromosome(name) {
    await this.initPromise;
    return this.dna[name] || {};
  }

  async updateChromosome(name, data) {
    await this.initPromise;

    this.dna[name] = { ...this.dna[name], ...data };
    await this.save('picoclaw_dna', this.dna);

    console.log(`🧬 Updated ${name}`);
  }

  // ========== 用户画像 ==========

  updateUserProfile(input) {
    // 提取偏好
    if (input.includes('我喜欢') || input.includes('我偏好')) {
      this.dna.USER.preferences.push({
        content: input.substring(0, 100),
        time: new Date().toISOString()
      });
    }

    // 保持最近20条
    if (this.dna.USER.preferences.length > 20) {
      this.dna.USER.preferences = this.dna.USER.preferences.slice(-20);
    }
  }

  async getUserProfile() {
    await this.initPromise;
    return this.dna.USER;
  }

  // ========== 情绪状态（简化版）==========

  getAffect() {
    return {
      mood: this.affect.mood,
      confidence: this.affect.confidence
    };
  }

  updateAffect(event, success) {
    if (event === 'task') {
      if (success) {
        this.affect.mood = Math.min(this.affect.mood + 0.05, 1.0);
        this.affect.confidence = Math.min(this.affect.confidence + 0.05, 1.0);
      } else {
        this.affect.mood = Math.max(this.affect.mood - 0.05, 0.0);
        this.affect.confidence = Math.max(this.affect.confidence - 0.1, 0.0);
      }
    }
  }

  // ========== 数据管理 ==========

  async clear() {
    this.memories = [];
    this.dna = {
      USER: { preferences: [], habits: [] },
      MEMORY: { longTerm: [] },
      SKILLS: { cache: [] }
    };

    await this.save('picoclaw_memories', []);
    await this.save('picoclaw_dna', this.dna);

    console.log('🗑️ All data cleared');
  }

  async export() {
    await this.initPromise;

    return {
      version: '1.0.0',
      exported: new Date().toISOString(),
      dna: this.dna,
      memories: this.memories,
      affect: this.affect
    };
  }

  async import(data) {
    if (data.version) {
      this.dna = data.dna || this.dna;
      this.memories = data.memories || [];
      this.affect = data.affect || this.affect;

      await this.save('picoclaw_dna', this.dna);
      await this.save('picoclaw_memories', this.memories);

      console.log(`📥 Imported ${this.memories.length} memories`);
      return true;
    }
    return false;
  }

  async getStats() {
    await this.initPromise;

    return {
      totalMemories: this.memories.length,
      userPreferences: this.dna.USER.preferences.length,
      userHabits: this.dna.USER.habits.length,
      affect: this.affect
    };
  }
}

// ========== 导出适配器 ==========

// React Native
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PicoMemory };
}

// Web
if (typeof window !== 'undefined') {
  window.PicoMemory = PicoMemory;
}

// ES Module
export default PicoMemory;