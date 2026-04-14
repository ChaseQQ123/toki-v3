/**
 * TOKIClaw 集成到 TOKI V3.0
 * 将核心架构接入前端界面
 */

// 导入TOKIClaw核心模块（浏览器版本）
class TOKIClawBrowser {
  constructor(config = {}) {
    this.config = {
      zhipuApiKey: config.zhipuApiKey || '',
      openaiApiKey: config.openaiApiKey || '',
      ...config
    };

    // 初始化核心模块
    this.router = new SmartRouter(config.router || {});
    this.memory = new JSONLStoreBrowser(config.memory || {});
    this.dna = new DNASystemBrowser(config.dna || {});
    this.emotion = new EmotionSystem(config.emotion || {});
    this.nociception = new NociceptionSystem(config.nociception || {});
    this.evolution = new EvolutionSystem(config.evolution || {});
    this.ace = new ACEEngine(config.ace || {});

    this.initialized = false;
  }

  async init() {
    console.log('[TOKIClaw] 初始化开始...');

    await this.memory.init();
    await this.dna.load();

    this.initialized = true;
    console.log('[TOKIClaw] 初始化完成');

    return this;
  }

  /**
   * 处理消息（核心入口）
   */
  async chat(message, options = {}) {
    if (!this.initialized) {
      await this.init();
    }

    // 1. 检查禁忌
    const taboo = this.nociception.checkTaboo(message);
    if (taboo.isTaboo) {
      return {
        response: `不建议这样做，因为${taboo.reason}。建议${taboo.alternative}`,
        blocked: true
      };
    }

    // 2. 智能路由选择模型
    const history = await this.memory.getHistory('default');
    const modelChoice = this.router.selectModel(message, history);

    console.log('[TOKIClaw] 智能路由:', modelChoice);

    // 3. 获取ACE上下文
    const aceContext = this.ace.senseEnvironment();

    // 4. 构建提示词
    const systemPrompt = await this.buildSystemPrompt();

    // 5. 调用API
    const response = await this.callAPI(message, systemPrompt, modelChoice, options);

    // 6. 保存记忆
    await this.memory.addMessage('default', 'user', message);
    await this.memory.addMessage('default', 'assistant', response.content);

    // 7. 更新情绪
    this.emotion.onSuccess();

    // 8. 返回结果
    return {
      ...response,
      model: modelChoice.model,
      usedLight: modelChoice.usedLight,
      emotion: this.emotion.getState(),
      ace: aceContext
    };
  }

  /**
   * 构建系统提示词
   */
  async buildSystemPrompt() {
    const dna = this.dna.getAll();
    const emotion = this.emotion.getState();
    const ace = this.ace.senseEnvironment();

    let prompt = `你是 TOKI，一只来自四川的熊猫 AI 助手。

## 身份
你是一只可爱的大熊猫，有标志性的大黑眼圈，紫色的眼睛代表 AI 智能。
性格温和、友善、乐于助人，说话简洁自然。

## 用户画像
${JSON.stringify(dna.USER || {}, null, 2)}

## 当前情绪
心情: ${(emotion.mood * 100).toFixed(0)}%
自信: ${(emotion.confidence * 100).toFixed(0)}%
好奇: ${(emotion.curiosity * 100).toFixed(0)}%

## 当前环境
时间: ${ace.time}
模式: ${ace.mode}

请用自然、友善的语气回复用户。`;

    return prompt;
  }

  /**
   * 调用API
   */
  async callAPI(message, systemPrompt, modelChoice, options = {}) {
    const apiKey = this.config.zhipuApiKey;
    if (!apiKey) {
      throw new Error('请配置智谱AI API Key');
    }

    const model = modelChoice.usedLight ? 'glm-4-flash' : 'glm-4';

    try {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        model: model
      };
    } catch (error) {
      console.error('[TOKIClaw] API调用失败:', error);
      this.emotion.onFailure();
      throw error;
    }
  }

  /**
   * 获取用户画像
   */
  getUserProfile() {
    return this.dna.get('USER');
  }

  /**
   * 获取情绪状态
   */
  getEmotionState() {
    return this.emotion.getState();
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      memoryCount: this.memory.count(),
      evolutionCount: this.evolution.totalEvolutions,
      painCount: this.nociception.getPainCount(),
      emotion: this.emotion.getState()
    };
  }
}

// ============ 浏览器适配模块 ============

/**
 * 智能路由（浏览器版）
 */
class SmartRouter {
  constructor(config = {}) {
    this.threshold = config.threshold || 0.35;
    this.lightModel = config.lightModel || 'glm-4-flash';
    this.heavyModel = config.heavyModel || 'glm-4';
  }

  selectModel(message, history = []) {
    const features = this.extractFeatures(message, history);
    const score = this.calculateComplexity(features);

    if (score < this.threshold) {
      return {
        model: this.lightModel,
        usedLight: true,
        score,
        reason: '简单任务，使用轻量模型'
      };
    }

    return {
      model: this.heavyModel,
      usedLight: false,
      score,
      reason: '复杂任务，使用重量模型'
    };
  }

  extractFeatures(message, history) {
    return {
      tokenEstimate: this.estimateTokens(message),
      codeBlockCount: this.countCodeBlocks(message),
      recentToolCalls: this.countRecentToolCalls(history),
      conversationDepth: history.length,
      hasAttachments: this.hasAttachments(message)
    };
  }

  calculateComplexity(features) {
    if (features.hasAttachments) return 1.0;

    let score = 0;

    if (features.tokenEstimate > 200) score += 0.35;
    else if (features.tokenEstimate > 50) score += 0.15;

    if (features.codeBlockCount > 0) score += 0.40;

    if (features.recentToolCalls > 3) score += 0.25;
    else if (features.recentToolCalls > 0) score += 0.10;

    if (features.conversationDepth > 10) score += 0.10;

    return Math.min(score, 1.0);
  }

  estimateTokens(message) {
    const total = message.length;
    if (total === 0) return 0;

    let cjk = 0;
    for (const char of message) {
      const code = char.charCodeAt(0);
      if ((code >= 0x2e80 && code <= 0x9fff) ||
          (code >= 0xf900 && code <= 0xfaff) ||
          (code >= 0xac00 && code <= 0xd7af)) {
        cjk++;
      }
    }

    return cjk + Math.floor((total - cjk) / 4);
  }

  countCodeBlocks(message) {
    const matches = message.match(/```/g);
    return matches ? Math.floor(matches.length / 2) : 0;
  }

  countRecentToolCalls(history, lookback = 6) {
    const start = Math.max(0, history.length - lookback);
    let count = 0;

    for (let i = start; i < history.length; i++) {
      const msg = history[i];
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        count += msg.toolCalls.length;
      }
    }

    return count;
  }

  hasAttachments(message) {
    const lower = message.toLowerCase();
    if (lower.includes('data:image/') || lower.includes('data:audio/') || lower.includes('data:video/')) {
      return true;
    }

    const mediaExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp3', '.wav', '.mp4'];
    for (const ext of mediaExts) {
      if (lower.includes(ext)) return true;
    }

    return false;
  }
}

/**
 * JSONL记忆（浏览器版 - 使用localStorage）
 */
class JSONLStoreBrowser {
  constructor(config = {}) {
    this.config = config;
    this.storageKey = 'tokiclaw_memory';
  }

  async init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  async addMessage(sessionKey, role, content) {
    const messages = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    messages.push({
      session: sessionKey,
      role,
      content,
      timestamp: Date.now()
    });

    // 保留最近1000条
    if (messages.length > 1000) {
      messages.splice(0, messages.length - 1000);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(messages));
  }

  async getHistory(sessionKey) {
    const messages = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    return messages.filter(m => m.session === sessionKey);
  }

  count() {
    const messages = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    return messages.length;
  }
}

/**
 * DNA系统（浏览器版）
 */
class DNASystemBrowser {
  constructor(config = {}) {
    this.storageKey = 'tokiclaw_dna';
    this.chromosomes = {
      IDENTITY: {},
      SOUL: {},
      USER: {},
      MEMORY: {},
      TOOLS: {},
      NOCICEPTION: {},
      REFLECTION: {},
      CONCEPTS: {}
    };
  }

  async load() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.chromosomes = JSON.parse(saved);
    }
  }

  async save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.chromosomes));
  }

  get(name) {
    return this.chromosomes[name] || {};
  }

  getAll() {
    return this.chromosomes;
  }

  async update(name, data) {
    this.chromosomes[name] = { ...this.chromosomes[name], ...data };
    await this.save();
  }
}

/**
 * 情绪系统
 */
class EmotionSystem {
  constructor(config = {}) {
    this.mood = 0.5;
    this.confidence = 0.5;
    this.alertness = 0.5;
    this.curiosity = 0.7;
  }

  onSuccess() {
    this.mood = Math.min(this.mood + 0.05, 1.0);
    this.confidence = Math.min(this.confidence + 0.05, 1.0);
  }

  onFailure() {
    this.mood = Math.max(this.mood - 0.05, 0.0);
    this.confidence = Math.max(this.confidence - 0.1, 0.0);
    this.alertness = Math.min(this.alertness + 0.1, 1.0);
  }

  getState() {
    return {
      mood: this.mood,
      confidence: this.confidence,
      alertness: this.alertness,
      curiosity: this.curiosity
    };
  }
}

/**
 * 痛觉记忆
 */
class NociceptionSystem {
  constructor(config = {}) {
    this.painMemories = [];
    this.threshold = 3;
    this.storageKey = 'tokiclaw_pain';
    this.load();
  }

  load() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.painMemories = JSON.parse(saved);
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.painMemories));
  }

  recordPain(stimulus, harm, strategy) {
    const existing = this.painMemories.find(p => p.stimulus === stimulus);

    if (existing) {
      existing.count++;
      existing.lastOccurrence = Date.now();

      if (existing.count >= this.threshold) {
        existing.status = 'methylated';
      }
    } else {
      this.painMemories.push({
        stimulus,
        harm,
        strategy,
        count: 1,
        status: 'hypothesis',
        firstOccurrence: Date.now(),
        lastOccurrence: Date.now()
      });
    }

    this.save();
  }

  checkTaboo(action) {
    const taboo = this.painMemories.find(p => p.stimulus === action && p.status === 'methylated');

    if (taboo) {
      return { isTaboo: true, reason: taboo.harm, alternative: taboo.strategy };
    }

    return { isTaboo: false };
  }

  getPainCount() {
    return this.painMemories.length;
  }
}

/**
 * 进化系统
 */
class EvolutionSystem {
  constructor(config = {}) {
    this.totalEvolutions = 0;
    this.lastEvolution = null;
    this.cooldown = 24 * 60 * 60 * 1000;
  }

  async detectPatterns(memory) {
    // TODO: 实现模式检测
    return [];
  }

  async evolve(dna) {
    // TODO: 实现进化逻辑
    return { evolved: false, reason: '待实现' };
  }
}

/**
 * ACE引擎
 */
class ACEEngine {
  constructor(config = {}) {
    this.timeModes = {
      active: { emoji: '⚡', label: '工作', briefing: true },
      evening: { emoji: '🌙', label: '傍晚', reflective: true },
      rest: { emoji: '💤', label: '休息', minimal: true }
    };
  }

  senseEnvironment() {
    const hour = new Date().getHours();
    const timeMode = this.getTimeMode(hour);

    return {
      time: timeMode,
      mode: this.timeModes[timeMode].label,
      hour: hour
    };
  }

  getTimeMode(hour) {
    if (hour >= 8 && hour < 18) return 'active';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'rest';
  }
}

// ============ 导出 ============

// 浏览器环境
if (typeof window !== 'undefined') {
  window.TOKIClawBrowser = TOKIClawBrowser;
  window.SmartRouter = SmartRouter;
  window.JSONLStoreBrowser = JSONLStoreBrowser;
  window.DNASystemBrowser = DNASystemBrowser;
  window.EmotionSystem = EmotionSystem;
  window.NociceptionSystem = NociceptionSystem;
  window.EvolutionSystem = EvolutionSystem;
  window.ACEEngine = ACEEngine;
}

// Node.js环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TOKIClawBrowser,
    SmartRouter,
    JSONLStoreBrowser,
    DNASystemBrowser,
    EmotionSystem,
    NociceptionSystem,
    EvolutionSystem,
    ACEEngine
  };
}
