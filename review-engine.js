/**
 * TOKI 复盘引擎
 * 记录用户操作、检测模式、生成技能建议
 * 
 * 实事求是：当前是基础框架，完整的自动Skill生成需要更复杂的逻辑
 */

class ReviewEngine {
  constructor() {
    this.logKey = 'toki_operation_log';
    this.patternsKey = 'toki_detected_patterns';
    this.skillsKey = 'toki_suggested_skills';
    
    // 操作日志
    this.logs = [];
    
    // 检测到的模式
    this.patterns = [];
    
    // 建议的技能
    this.suggestedSkills = [];
    
    // 模式检测规则
    this.patternRules = [
      {
        name: '重复查询',
        detect: (logs) => this.detectRepeatQuery(logs),
        description: '用户多次查询相同内容'
      },
      {
        name: '连续操作',
        detect: (logs) => this.detectSequentialAction(logs),
        description: '用户按固定顺序执行操作'
      },
      {
        name: '时间规律',
        detect: (logs) => this.detectTimePattern(logs),
        description: '用户在固定时间执行相同操作'
      },
      {
        name: '高频功能',
        detect: (logs) => this.detectFrequentFeature(logs),
        description: '用户频繁使用某个功能'
      }
    ];
  }

  /**
   * 初始化
   */
  async init() {
    try {
      const logs = localStorage.getItem(this.logKey);
      const patterns = localStorage.getItem(this.patternsKey);
      const skills = localStorage.getItem(this.skillsKey);
      
      this.logs = logs ? JSON.parse(logs) : [];
      this.patterns = patterns ? JSON.parse(patterns) : [];
      this.suggestedSkills = skills ? JSON.parse(skills) : [];
      
      console.log(`✅ ReviewEngine 初始化完成`);
      console.log(`   日志: ${this.logs.length} 条`);
      console.log(`   模式: ${this.patterns.length} 个`);
      console.log(`   技能建议: ${this.suggestedSkills.length} 个`);
      
      return true;
    } catch (error) {
      console.error('❌ ReviewEngine 初始化失败:', error);
      return false;
    }
  }

  /**
   * 记录操作
   */
  log(action, data = {}) {
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: Date.now(),
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    };
    
    this.logs.push(entry);
    
    // 限制日志大小
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    this.saveLogs();
    return entry.id;
  }

  /**
   * 检测重复查询
   */
  detectRepeatQuery(logs) {
    const queryLogs = logs.filter(l => l.action === 'query' || l.action === 'chat');
    const queryCount = {};
    
    queryLogs.forEach(l => {
      const key = l.data?.query || l.data?.message || '';
      if (key) {
        queryCount[key] = (queryCount[key] || 0) + 1;
      }
    });
    
    const repeats = Object.entries(queryCount)
      .filter(([_, count]) => count >= 3)
      .map(([query, count]) => ({ query, count }));
    
    return repeats.length > 0 ? { type: 'repeat_query', items: repeats } : null;
  }

  /**
   * 检测连续操作
   */
  detectSequentialAction(logs) {
    // 简化版：检测 A → B → C 的固定顺序
    const sequences = {};
    
    for (let i = 0; i < logs.length - 2; i++) {
      const seq = `${logs[i].action}→${logs[i+1].action}→${logs[i+2].action}`;
      sequences[seq] = (sequences[seq] || 0) + 1;
    }
    
    const frequent = Object.entries(sequences)
      .filter(([_, count]) => count >= 3)
      .map(([seq, count]) => ({ sequence: seq, count }));
    
    return frequent.length > 0 ? { type: 'sequential_action', items: frequent } : null;
  }

  /**
   * 检测时间规律
   */
  detectTimePattern(logs) {
    const hourActions = {};
    
    logs.forEach(l => {
      const key = `${l.hour}:00`;
      hourActions[key] = hourActions[key] || {};
      hourActions[key][l.action] = (hourActions[key][l.action] || 0) + 1;
    });
    
    // 找出在特定时间高频的操作
    const patterns = [];
    Object.entries(hourActions).forEach(([hour, actions]) => {
      Object.entries(actions).forEach(([action, count]) => {
        if (count >= 5) {
          patterns.push({ hour, action, count });
        }
      });
    });
    
    return patterns.length > 0 ? { type: 'time_pattern', items: patterns } : null;
  }

  /**
   * 检测高频功能
   */
  detectFrequentFeature(logs) {
    const actionCount = {};
    
    logs.forEach(l => {
      actionCount[l.action] = (actionCount[l.action] || 0) + 1;
    });
    
    const frequent = Object.entries(actionCount)
      .filter(([_, count]) => count >= 10)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);
    
    return frequent.length > 0 ? { type: 'frequent_feature', items: frequent } : null;
  }

  /**
   * 运行模式检测
   */
  async detectPatterns() {
    console.log('🔍 开始检测用户行为模式...');
    
    const newPatterns = [];
    
    for (const rule of this.patternRules) {
      const result = rule.detect(this.logs);
      if (result) {
        newPatterns.push({
          id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: rule.name,
          description: rule.description,
          data: result,
          detectedAt: Date.now()
        });
      }
    }
    
    if (newPatterns.length > 0) {
      this.patterns = [...this.patterns, ...newPatterns];
      this.savePatterns();
      console.log(`✅ 检测到 ${newPatterns.length} 个新模式`);
    } else {
      console.log('未检测到新模式');
    }
    
    return newPatterns;
  }

  /**
   * 根据模式生成技能建议
   */
  async generateSkillSuggestions() {
    console.log('💡 根据模式生成技能建议...');
    
    const suggestions = [];
    
    for (const pattern of this.patterns) {
      const suggestion = this.patternToSkillSuggestion(pattern);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
    
    if (suggestions.length > 0) {
      this.suggestedSkills = [...this.suggestedSkills, ...suggestions];
      this.saveSkills();
      console.log(`✅ 生成了 ${suggestions.length} 个技能建议`);
    }
    
    return suggestions;
  }

  /**
   * 将模式转换为技能建议
   */
  patternToSkillSuggestion(pattern) {
    switch (pattern.data.type) {
      case 'repeat_query':
        return {
          id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `快捷查询: ${pattern.data.items[0].query.substring(0, 20)}`,
          description: '将常用查询保存为快捷方式',
          type: 'shortcut',
          pattern: pattern.id,
          suggestedAt: Date.now(),
          status: 'suggested'
        };
        
      case 'sequential_action':
        return {
          id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: '工作流',
          description: '将连续操作自动化为工作流',
          type: 'workflow',
          pattern: pattern.id,
          suggestedAt: Date.now(),
          status: 'suggested'
        };
        
      case 'time_pattern':
        return {
          id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: '定时任务',
          description: `在${pattern.data.items[0].hour}自动执行${pattern.data.items[0].action}`,
          type: 'scheduled',
          pattern: pattern.id,
          suggestedAt: Date.now(),
          status: 'suggested'
        };
        
      case 'frequent_feature':
        return {
          id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: '功能快捷方式',
          description: `为高频功能${pattern.data.items[0].action}创建快捷入口`,
          type: 'shortcut',
          pattern: pattern.id,
          suggestedAt: Date.now(),
          status: 'suggested'
        };
        
      default:
        return null;
    }
  }

  /**
   * 采纳技能建议
   */
  acceptSkill(skillId) {
    const skill = this.suggestedSkills.find(s => s.id === skillId);
    if (skill) {
      skill.status = 'accepted';
      this.saveSkills();
      console.log(`✅ 已采纳技能: ${skill.name}`);
      return skill;
    }
    return null;
  }

  /**
   * 获取复盘报告
   */
  getReport() {
    return {
      totalLogs: this.logs.length,
      patterns: this.patterns,
      suggestedSkills: this.suggestedSkills,
      summary: {
        topActions: this.getTopActions(),
        activeHours: this.getActiveHours(),
        patternCount: this.patterns.length,
        skillCount: this.suggestedSkills.length
      }
    };
  }

  /**
   * 获取高频操作
   */
  getTopActions(limit = 5) {
    const count = {};
    this.logs.forEach(l => {
      count[l.action] = (count[l.action] || 0) + 1;
    });
    
    return Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([action, count]) => ({ action, count }));
  }

  /**
   * 获取活跃时段
   */
  getActiveHours() {
    const hourCount = {};
    this.logs.forEach(l => {
      hourCount[l.hour] = (hourCount[l.hour] || 0) + 1;
    });
    
    return Object.entries(hourCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }));
  }

  /**
   * 保存日志
   */
  saveLogs() {
    try {
      localStorage.setItem(this.logKey, JSON.stringify(this.logs));
    } catch (e) {
      console.error('保存日志失败:', e);
    }
  }

  /**
   * 保存模式
   */
  savePatterns() {
    localStorage.setItem(this.patternsKey, JSON.stringify(this.patterns));
  }

  /**
   * 保存技能
   */
  saveSkills() {
    localStorage.setItem(this.skillsKey, JSON.stringify(this.suggestedSkills));
  }

  /**
   * 清空数据
   */
  clear() {
    this.logs = [];
    this.patterns = [];
    this.suggestedSkills = [];
    localStorage.removeItem(this.logKey);
    localStorage.removeItem(this.patternsKey);
    localStorage.removeItem(this.skillsKey);
    console.log('🗑️ 已清空复盘引擎数据');
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReviewEngine };
}