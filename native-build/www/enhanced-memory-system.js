// TOKI 增强记忆系统 - 基于MiniClaw架构
// 参考：DNA系统、痛觉记忆、情绪状态

class EnhancedTOKIMemory {
  constructor() {
    this.storageKey = 'toki_enhanced_memory';
    this.config = {
      maxMemories: 1000,           // 最大记忆数量
      decayHalfLife: 7 * 24 * 60 * 60 * 1000,  // 7天半衰期
      nociceptionThreshold: 3,     // 痛觉阈值
      maxNociception: 10           // 最大痛觉记录
    };
    
    // DNA染色体（参考MiniClaw）
    this.chromosomes = {
      IDENTITY: this.loadChromosome('IDENTITY'),
      SOUL: this.loadChromosome('SOUL'),
      USER: this.loadChromosome('USER'),
      MEMORY: this.loadChromosome('MEMORY'),
      TOOLS: this.loadChromosome('TOOLS'),
      NOCICEPTION: this.loadChromosome('NOCICEPTION'),
      REFLECTION: this.loadChromosome('REFLECTION'),
      HORIZONS: this.loadChromosome('HORIZONS')
    };
    
    // 情绪状态系统
    this.affect = {
      alertness: 0.5,    // 警觉度 [0,1]
      mood: 0.5,         // 情绪效价 [0,1]
      curiosity: 0.7,    // 好奇心 [0,1]
      confidence: 0.5    // 信心 [0,1]
    };
    
    // 加载记忆
    this.memories = this.loadMemories();
    this.nociceptionLog = this.loadNociception();
    
    console.log('🧠 TOKI增强记忆系统已启动');
    console.log('📊 记忆数量:', this.memories.length);
    console.log '💢 痛觉记录:', this.nociceptionLog.length);
  }
  
  // ========== DNA系统 ==========
  
  loadChromosome(name) {
    try {
      const data = localStorage.getItem(`toki_dna_${name}`);
      return data ? JSON.parse(data) : this.getDefaultChromosome(name);
    } catch (e) {
      return this.getDefaultChromosome(name);
    }
  }
  
  saveChromosome(name, content) {
    try {
      localStorage.setItem(`toki_dna_${name}`, JSON.stringify(content));
    } catch (e) {
      console.error(`保存染色体${name}失败:`, e);
    }
  }
  
  getDefaultChromosome(name) {
    const defaults = {
      IDENTITY: {
        name: 'TOKI',
        version: '3.0',
        species: 'AI Assistant',
        created: new Date().toISOString()
      },
      SOUL: {
        personality: '友好、专业、简洁',
        style: '直接回答，避免冗余',
        values: ['高效', '准确', '友好']
      },
      USER: {
        preferences: [],
        habits: [],
        avoidPatterns: []
      },
      MEMORY: {
        longTerm: [],
        patterns: []
      },
      TOOLS: {
        skills: [],
        bestPractices: []
      },
      NOCICEPTION: {
        painPoints: [],
        avoidance: []
      },
      REFLECTION: {
        insights: [],
        growthAreas: []
      },
      HORIZONS: {
        todos: [],
        goals: []
      }
    };
    return defaults[name] || {};
  }
  
  // ========== 记忆系统 ==========
  
  loadMemories() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }
  
  saveMemories() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.memories));
    } catch (e) {
      console.error('保存记忆失败:', e);
    }
  }
  
  // 记忆新信息（核心方法）
  memorize(input, output, metadata = {}) {
    const memory = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input: input,
      output: output,
      metadata: metadata,
      tags: this.extractTags(input + ' ' + output),
      importance: this.calculateImportance(input, output, metadata),
      decayWeight: 1.0,  // 初始权重
      accessCount: 0
    };
    
    this.memories.push(memory);
    
    // 自动衰减旧记忆
    this.applyDecay();
    
    // 保持记忆数量限制
    if (this.memories.length > this.config.maxMemories) {
      this.pruneMemories();
    }
    
    this.saveMemories();
    
    // 更新用户画像
    this.updateUserProfile(input, output);
    
    console.log('✅ 已记住:', input.substring(0, 30));
    return memory.id;
  }
  
  // 计算重要性
  calculateImportance(input, output, metadata) {
    let score = 0.5;  // 基础分
    
    // 关键词加分
    const importantKeywords = ['重要', '必须', '记住', '偏好', '项目', '关键'];
    importantKeywords.forEach(keyword => {
      if ((input + output).includes(keyword)) {
        score += 0.1;
      }
    });
    
    // 用户明确标记
    if (metadata.important) {
      score += 0.2;
    }
    
    // 情绪相关
    if (metadata.emotional) {
      score += 0.15;
    }
    
    return Math.min(score, 1.0);
  }
  
  // 提取标签
  extractTags(text) {
    const tagPatterns = {
      '用户偏好': /喜欢|偏好|希望|想要/,
      '项目信息': /项目|代码|文件|功能/,
      '技术问题': /错误|bug|问题|解决/,
      '日程安排': /时间|日期|会议|提醒/,
      '重要事项': /重要|必须|关键|紧急/
    };
    
    const tags = [];
    for (const [tag, pattern] of Object.entries(tagPatterns)) {
      if (pattern.test(text)) {
        tags.push(tag);
      }
    }
    return tags;
  }
  
  // 应用衰减
  applyDecay() {
    const now = Date.now();
    this.memories.forEach(memory => {
      const age = now - new Date(memory.timestamp).getTime();
      const decayFactor = Math.pow(0.5, age / this.config.decayHalfLife);
      memory.decayWeight = decayFactor;
    });
  }
  
  // 修剪记忆
  pruneMemories() {
    // 按重要性×衰减权重排序
    this.memories.sort((a, b) => {
      const scoreA = a.importance * a.decayWeight;
      const scoreB = b.importance * b.decayWeight;
      return scoreB - scoreA;
    });
    
    // 保留前80%
    const keepCount = Math.floor(this.config.maxMemories * 0.8);
    this.memories = this.memories.slice(0, keepCount);
    
    console.log('✂️ 已修剪记忆至', this.memories.length, '条');
  }
  
  // 回忆相关信息
  recall(query, limit = 5) {
    const queryWords = query.toLowerCase().split(/\s+/);
    
    // 计算相关性得分
    const scored = this.memories.map(memory => {
      let score = 0;
      const text = (memory.input + ' ' + memory.output).toLowerCase();
      
      // 词汇匹配
      queryWords.forEach(word => {
        if (text.includes(word)) {
          score += 1;
        }
      });
      
      // 标签匹配加分
      memory.tags.forEach(tag => {
        if (query.toLowerCase().includes(tag)) {
          score += 2;
        }
      });
      
      // 重要性加权
      score *= memory.importance;
      
      // 衰减加权
      score *= memory.decayWeight;
      
      // 访问次数加成（最近访问的更重要）
      score *= (1 + memory.accessCount * 0.1);
      
      return { memory, score };
    });
    
    // 排序并返回
    const relevant = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => {
        // 增加访问计数
        item.memory.accessCount++;
        return item.memory;
      });
    
    this.saveMemories();
    console.log(`🧠 找到 ${relevant.length} 条相关记忆`);
    return relevant;
  }
  
  // 构建上下文
  buildContext(query) {
    const memories = this.recall(query);
    
    if (memories.length === 0) {
      return '';
    }
    
    let context = '📝 相关记忆：\n\n';
    memories.forEach((memory, i) => {
      context += `${i + 1}. ${memory.input}\n`;
      context += `   回答：${memory.output.substring(0, 100)}...\n\n`;
    });
    
    return context;
  }
  
  // ========== 痛觉系统（Nociception）==========
  
  loadNociception() {
    try {
      const data = localStorage.getItem('toki_nociception');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }
  
  saveNociception() {
    try {
      localStorage.setItem('toki_nociception', JSON.stringify(this.nociceptionLog));
    } catch (e) {
      console.error('保存痛觉记录失败:', e);
    }
  }
  
  // 记录痛觉
  recordPain(painPoint, context) {
    const pain = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      pain: painPoint,
      context: context,
      intensity: 1,
      occurrences: 1,
      lastOccurrence: new Date().toISOString()
    };
    
    // 检查是否已存在相同痛点
    const existing = this.nociceptionLog.find(p => p.pain === painPoint);
    if (existing) {
      existing.occurrences++;
      existing.intensity = Math.min(existing.occurrences, this.config.maxNociception);
      existing.lastOccurrence = new Date().toISOString();
    } else {
      this.nociceptionLog.push(pain);
    }
    
    // 更新情绪状态
    this.affect.alertness = Math.min(this.affect.alertness + 0.1, 1.0);
    this.affect.mood = Math.max(this.affect.mood - 0.1, 0.0);
    
    this.saveNociception();
    
    // 如果痛觉强度超过阈值，写入DNA
    if (existing && existing.intensity >= this.config.nociceptionThreshold) {
      this.addPainToDNA(painPoint, context);
    }
    
    console.log('💢 记录痛觉:', painPoint);
  }
  
  // 将痛觉写入DNA
  addPainToDNA(pain, context) {
    const nociceptionDNA = this.chromosomes.NOCICEPTION;
    
    if (!nociceptionDNA.painPoints.includes(pain)) {
      nociceptionDNA.painPoints.push(pain);
      nociceptionDNA.avoidance.push({
        trigger: pain,
        action: '避免重复此操作',
        reason: context
      });
      
      this.saveChromosome('NOCICEPTION', nociceptionDNA);
      console.log('🧬 痛觉已写入DNA:', pain);
    }
  }
  
  // 检查是否应该避免某操作
  shouldAvoid(action) {
    const nociceptionDNA = this.chromosomes.NOCICEPTION;
    
    for (const avoid of nociceptionDNA.avoidance) {
      if (action.includes(avoid.trigger)) {
        console.log('⚠️ 避免操作:', action, '原因:', avoid.reason);
        return {
          avoid: true,
          reason: avoid.reason
        };
      }
    }
    
    return { avoid: false };
  }
  
  // ========== 情绪状态系统 ==========
  
  updateAffect(event, success = true) {
    switch(event) {
      case 'task_complete':
        if (success) {
          this.affect.confidence = Math.min(this.affect.confidence + 0.05, 1.0);
          this.affect.mood = Math.min(this.affect.mood + 0.05, 1.0);
        } else {
          this.affect.confidence = Math.max(this.affect.confidence - 0.1, 0.0);
          this.affect.mood = Math.max(this.affect.mood - 0.05, 0.0);
        }
        break;
        
      case 'user_feedback':
        if (success) {
          this.affect.mood = Math.min(this.affect.mood + 0.1, 1.0);
          this.affect.curiosity = Math.min(this.affect.curiosity + 0.05, 1.0);
        } else {
          this.affect.alertness = Math.min(this.affect.alertness + 0.1, 1.0);
          this.affect.confidence = Math.max(this.affect.confidence - 0.05, 0.0);
        }
        break;
        
      case 'idle':
        // 空闲时恢复基线
        this.affect.alertness = Math.max(this.affect.alertness - 0.02, 0.5);
        this.affect.mood = Math.max(this.affect.mood - 0.01, 0.5);
        break;
    }
    
    console.log('💭 情绪状态更新:', this.affect);
  }
  
  getAffectSummary() {
    const { alertness, mood, curiosity, confidence } = this.affect;
    
    let summary = '当前状态：';
    
    if (alertness > 0.7) {
      summary += '⚠️ 高度警觉 ';
    }
    if (mood > 0.7) {
      summary += '😊 情绪良好 ';
    } else if (mood < 0.3) {
      summary += '😔 情绪低落 ';
    }
    if (curiosity > 0.7) {
      summary += '🔍 好奇心强 ';
    }
    if (confidence > 0.7) {
      summary += '💪 信心十足 ';
    } else if (confidence < 0.3) {
      summary += '😰 缺乏信心 ';
    }
    
    return summary;
  }
  
  // ========== 用户画像系统 ==========
  
  updateUserProfile(input, output) {
    const userDNA = this.chromosomes.USER;
    
    // 提取偏好
    if (input.includes('我喜欢') || input.includes('我偏好')) {
      const preference = input.match(/我(喜欢|偏好)(.+)/);
      if (preference) {
        userDNA.preferences.push({
          type: 'explicit',
          content: preference[2],
          timestamp: new Date().toISOString()
        });
        this.saveChromosome('USER', userDNA);
      }
    }
    
    // 提取习惯
    if (input.includes('经常') || input.includes('总是')) {
      const habit = input.match(/我(经常|总是)(.+)/);
      if (habit) {
        userDNA.habits.push({
          content: habit[2],
          frequency: habit[1],
          timestamp: new Date().toISOString()
        });
        this.saveChromosome('USER', userDNA);
      }
    }
  }
  
  getUserPreferences() {
    const userDNA = this.chromosomes.USER;
    return {
      preferences: userDNA.preferences.slice(-10),  // 最近10条
      habits: userDNA.habits.slice(-10),
      avoidPatterns: userDNA.avoidPatterns
    };
  }
  
  // ========== 工具方法 ==========
  
  clearMemories() {
    this.memories = [];
    this.saveMemories();
    console.log('🗑️ 记忆已清除');
  }
  
  exportData() {
    return {
      chromosomes: this.chromosomes,
      memories: this.memories,
      nociception: this.nociceptionLog,
      affect: this.affect,
      exportDate: new Date().toISOString()
    };
  }
  
  importData(data) {
    try {
      if (data.chromosomes) {
        for (const [name, content] of Object.entries(data.chromosomes)) {
          this.saveChromosome(name, content);
        }
      }
      
      if (data.memories) {
        this.memories = data.memories;
        this.saveMemories();
      }
      
      if (data.nociception) {
        this.nociceptionLog = data.nociception;
        this.saveNociception();
      }
      
      if (data.affect) {
        this.affect = data.affect;
      }
      
      console.log('✅ 数据导入成功');
      return true;
    } catch (e) {
      console.error('导入失败:', e);
      return false;
    }
  }
  
  getStats() {
    return {
      totalMemories: this.memories.length,
      totalNociception: this.nociceptionLog.length,
      affectState: this.affect,
      userPreferences: this.chromosomes.USER.preferences.length,
      userHabits: this.chromosomes.USER.habits.length
    };
  }
}

// 创建全局实例
const enhancedMemory = new EnhancedTOKIMemory();

// 导出到全局
if (typeof window !== 'undefined') {
  window.TOKIMemory = enhancedMemory;
}
