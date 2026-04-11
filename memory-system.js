// TOKI记忆系统 - 基于MiniClaw核心
// 纯JavaScript实现，无需npm安装

class TOKIMemory {
  constructor() {
    this.memoryPath = './memory/';
    this.maxMemories = 1000;
    this.memories = this.loadMemories();
  }
  
  // 加载记忆
  loadMemories() {
    try {
      const saved = localStorage.getItem('toki_memories');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }
  
  // 保存记忆
  saveMemories() {
    try {
      localStorage.setItem('toki_memories', JSON.stringify(this.memories));
    } catch (e) {
      console.error('保存记忆失败:', e);
    }
  }
  
  // 记住信息
  memorize(input, output, metadata = {}) {
    const memory = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input: input,
      output: output,
      metadata: metadata,
      tags: this.extractTags(input + ' ' + output)
    };
    
    this.memories.push(memory);
    
    // 保持记忆数量限制
    if (this.memories.length > this.maxMemories) {
      this.memories = this.memories.slice(-this.maxMemories);
    }
    
    this.saveMemories();
    console.log('✅ 已记住:', input.substring(0, 50));
    return memory.id;
  }
  
  // 提取标签
  extractTags(text) {
    const keywords = ['用户', '偏好', '项目', '问题', '解决方案', '重要'];
    const tags = [];
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });
    return tags;
  }
  
  // 回忆相关信息
  recall(query, limit = 5) {
    const queryWords = query.toLowerCase().split(' ');
    
    // 计算相关性得分
    const scored = this.memories.map(memory => {
      let score = 0;
      const text = (memory.input + ' ' + memory.output).toLowerCase();
      
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
      
      return { memory, score };
    });
    
    // 排序并返回最相关的记忆
    const relevant = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.memory);
    
    console.log(`🧠 找到 ${relevant.length} 条相关记忆`);
    return relevant;
  }
  
  // 构建上下文
  buildContext(query) {
    const memories = this.recall(query);
    
    if (memories.length === 0) {
      return '';
    }
    
    let context = '📝 相关记忆：\n';
    memories.forEach((memory, i) => {
      context += `${i + 1}. ${memory.input}\n   回答：${memory.output}\n\n`;
    });
    
    return context;
  }
  
  // 清除记忆
  clearMemories() {
    this.memories = [];
    this.saveMemories();
    console.log('🗑️ 记忆已清除');
  }
  
  // 导出记忆
  exportMemories() {
    return JSON.stringify(this.memories, null, 2);
  }
  
  // 导入记忆
  importMemories(json) {
    try {
      this.memories = JSON.parse(json);
      this.saveMemories();
      console.log('✅ 导入成功:', this.memories.length, '条记忆');
    } catch (e) {
      console.error('导入失败:', e);
    }
  }
}

// 创建全局实例
const tokiMemory = new TOKIMemory();
