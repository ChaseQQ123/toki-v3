/**
 * PicoClaw - 轻量级记忆系统 (集成版)
 * 大小: <10KB | 零依赖 | 完全离线
 * 
 * 适用: Web / PWA / React Native
 */

class PicoMemory {
  constructor(config = {}) {
    this.config = {
      maxMemories: config.maxMemories || 1000,
      decayDays: config.decayDays || 7,
      storage: config.storage || 'localStorage',
      ...config
    };

    // 简化DNA（3个核心染色体）
    this.dna = {
      USER: { preferences: [], habits: [], name: '', interests: [] },
      MEMORY: { longTerm: [], important: [] },
      SKILLS: { cache: [], learned: [] }
    };

    // 记忆缓存
    this.memories = [];

    // 情绪状态
    this.affect = {
      mood: 0.5,        // 0-1 情绪
      confidence: 0.5   // 0-1 自信
    };

    // 初始化
    this.init();
  }

  // ========== 初始化 ==========

  async init() {
    try {
      // 加载DNA
      const savedDNA = await this.load('toki_dna');
      if (savedDNA) {
        this.dna = { ...this.dna, ...savedDNA };
      }

      // 加载记忆
      const savedMemories = await this.load('toki_memories');
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
    try {
      if (this.config.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.error('Load failed:', error);
    }
    return null;
  }

  async save(key, value) {
    try {
      if (this.config.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  }

  // ========== 记忆系统 ==========

  async memorize(input, output, metadata = {}) {
    const memory = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input: input.substring(0, 200),
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
    await this.save('toki_memories', this.memories);

    // 更新用户画像
    this.updateUserProfile(input);

    return memory.id;
  }

  async recall(query, limit = 5) {
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

    return relevant;
  }

  calculateImportance(input) {
    let score = 0.5;

    const important = ['重要', '必须', '记住', '偏好', '关键', '喜欢', '名字', '生日'];
    important.forEach(keyword => {
      if (input.includes(keyword)) score += 0.1;
    });

    return Math.min(score, 1.0);
  }

  extractTags(text) {
    const tags = [];
    const patterns = {
      '偏好': /喜欢|偏好|希望|爱/,
      '项目': /项目|代码|文件|开发/,
      '问题': /错误|bug|问题|fix/,
      '个人': /我|我的|自己/,
      '工作': /工作|任务|会议|计划/
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
    return this.dna[name] || {};
  }

  async updateChromosome(name, data) {
    this.dna[name] = { ...this.dna[name], ...data };
    await this.save('toki_dna', this.dna);
    console.log(`🧬 Updated ${name}`);
  }

  // ========== 用户画像 ==========

  updateUserProfile(input) {
    // 提取名字
    const nameMatch = input.match(/我叫(\S+)|我是(\S+)|名字是(\S+)/);
    if (nameMatch) {
      const name = nameMatch[1] || nameMatch[2] || nameMatch[3];
      this.dna.USER.name = name.replace(/[，。！？、]/g, '');
    }

    // 提取偏好
    if (input.includes('我喜欢') || input.includes('我偏好') || input.includes('我爱好')) {
      this.dna.USER.preferences.push({
        content: input.substring(0, 100),
        time: new Date().toISOString()
      });
    }

    // 提取兴趣
    const interests = input.match(/喜欢(\S+)|爱(\S+)|爱好(\S+)/);
    if (interests) {
      const interest = interests[1] || interests[2] || interests[3];
      if (interest && !this.dna.USER.interests.includes(interest)) {
        this.dna.USER.interests.push(interest.replace(/[，。！？、]/g, ''));
      }
    }

    // 保持最近20条
    if (this.dna.USER.preferences.length > 20) {
      this.dna.USER.preferences = this.dna.USER.preferences.slice(-20);
    }

    // 异步保存
    this.save('toki_dna', this.dna);
  }

  async getUserProfile() {
    return {
      name: this.dna.USER.name || '用户',
      preferences: this.dna.USER.preferences.slice(-5),
      interests: this.dna.USER.interests.slice(-10)
    };
  }

  // ========== 情绪状态 ==========

  getAffect() {
    return {
      mood: this.affect.mood,
      confidence: this.affect.confidence,
      moodText: this.getMoodText()
    };
  }

  getMoodText() {
    if (this.affect.mood > 0.8) return '非常开心 😊';
    if (this.affect.mood > 0.6) return '心情不错 🙂';
    if (this.affect.mood > 0.4) return '状态一般 😐';
    if (this.affect.mood > 0.2) return '有点低落 😔';
    return '心情不好 😢';
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

  // ========== 对话增强 ==========

  async enhancePrompt(userInput) {
    const profile = await this.getUserProfile();
    const relevantMemories = await this.recall(userInput, 3);
    const affect = this.getAffect();

    let context = '';

    // 用户画像
    if (profile.name !== '用户') {
      context += `用户名字：${profile.name}\n`;
    }

    if (profile.interests.length > 0) {
      context += `用户兴趣：${profile.interests.join('、')}\n`;
    }

    // 相关记忆
    if (relevantMemories.length > 0) {
      context += `\n相关记忆：\n`;
      relevantMemories.forEach((m, i) => {
        context += `${i + 1}. ${m.input.substring(0, 50)}...\n`;
      });
    }

    // 情绪状态
    context += `\n当前情绪：${affect.moodText}\n`;

    return context;
  }

  // ========== 数据管理 ==========

  async clear() {
    this.memories = [];
    this.dna = {
      USER: { preferences: [], habits: [], name: '', interests: [] },
      MEMORY: { longTerm: [], important: [] },
      SKILLS: { cache: [], learned: [] }
    };
    this.affect = { mood: 0.5, confidence: 0.5 };

    await this.save('toki_memories', []);
    await this.save('toki_dna', this.dna);

    console.log('🗑️ All data cleared');
  }

  async export() {
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

      await this.save('toki_dna', this.dna);
      await this.save('toki_memories', this.memories);

      console.log(`📥 Imported ${this.memories.length} memories`);
      return true;
    }
    return false;
  }

  async getStats() {
    return {
      totalMemories: this.memories.length,
      userPreferences: this.dna.USER.preferences.length,
      userName: this.dna.USER.name || '未设置',
      userInterests: this.dna.USER.interests.length,
      affect: this.getAffect()
    };
  }
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.PicoMemory = PicoMemory;
}
