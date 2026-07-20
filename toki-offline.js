/**
 * TOKI 离线系统入口
 * 集成本地向量记忆、知识图谱、复盘引擎、离线ASR
 */

// 引用模块（Node.js 环境）
let LocalVectorMemory, LocalKnowledgeGraph, ReviewEngine, LocalModelManager, OfflineASR, TOKIWebViewBridge;

try {
  const vm = require('./local-vector-memory.js');
  LocalVectorMemory = vm.LocalVectorMemory;
  const kg = require('./local-knowledge-graph.js');
  LocalKnowledgeGraph = kg.LocalKnowledgeGraph;
  const re = require('./review-engine.js');
  ReviewEngine = re.ReviewEngine;
  const mm = require('./local-model-manager.js');
  LocalModelManager = mm.LocalModelManager;
  const asr = require('./offline-asr.js');
  OfflineASR = asr.OfflineASR;
  const wb = require('./webview-bridge.js');
  TOKIWebViewBridge = wb.TOKIWebViewBridge;
} catch (e) {
  // 浏览器环境，全局变量
}

class TOKIOfflineSystem {
  constructor() {
    this.vectorMemory = null;
    this.knowledgeGraph = null;
    this.reviewEngine = null;
    this.modelManager = null;
    this.offlineASR = null;
    this.webViewBridge = null;
    
    this.initialized = false;
  }

  /**
   * 初始化所有模块
   */
  async init(config = {}) {
    console.log('🚀 TOKI 离线系统初始化中...');
    
    try {
      // 1. 初始化向量记忆
      if (LocalVectorMemory) {
        this.vectorMemory = new LocalVectorMemory();
        await this.vectorMemory.init({ apiKey: config.embeddingApiKey });
        console.log('✅ 向量记忆已初始化');
      } else {
        console.warn('⚠️ LocalVectorMemory 未定义');
      }
      
      // 2. 初始化知识图谱
      if (LocalKnowledgeGraph) {
        this.knowledgeGraph = new LocalKnowledgeGraph();
        await this.knowledgeGraph.init();
        console.log('✅ 知识图谱已初始化');
      } else {
        console.warn('⚠️ LocalKnowledgeGraph 未定义');
      }
      
      // 3. 初始化复盘引擎
      if (ReviewEngine) {
        this.reviewEngine = new ReviewEngine();
        await this.reviewEngine.init();
        console.log('✅ 复盘引擎已初始化');
      } else {
        console.warn('⚠️ ReviewEngine 未定义');
      }
      
      // 4. 初始化模型管理器
      if (LocalModelManager) {
        this.modelManager = new LocalModelManager();
        await this.modelManager.init();
        console.log('✅ 模型管理器已初始化');
      }
      
      // 5. 初始化离线ASR
      if (OfflineASR) {
        this.offlineASR = new OfflineASR();
        await this.offlineASR.init();
        console.log('✅ 离线ASR已初始化');
      }
      
      // 6. 初始化WebView桥接
      if (TOKIWebViewBridge) {
        this.webViewBridge = new TOKIWebViewBridge();
        console.log('✅ WebView桥接已准备');
      }
      
      this.initialized = true;
      console.log('🎉 TOKI 离线系统初始化完成');
      
      return true;
    } catch (error) {
      console.error('❌ TOKI 离线系统初始化失败:', error);
      return false;
    }
  }

  /**
   * 记忆功能
   */
  async remember(content, metadata = {}) {
    if (!this.vectorMemory) {
      throw new Error('向量记忆未初始化');
    }
    
    // 记录操作
    this.reviewEngine?.log('remember', { content: content.substring(0, 50) });
    
    // 存入向量记忆
    const id = await this.vectorMemory.addMemory(content, metadata);
    
    // 同时提取实体存入知识图谱
    if (this.knowledgeGraph) {
      this.extractEntities(content);
    }
    
    return id;
  }

  /**
   * 回忆功能
   */
  async recall(query, topK = 5) {
    if (!this.vectorMemory) {
      throw new Error('向量记忆未初始化');
    }
    
    // 记录操作
    this.reviewEngine?.log('recall', { query: query.substring(0, 50), topK });
    
    // 搜索向量记忆
    const vectorResults = await this.vectorMemory.search(query, topK);
    
    // 搜索知识图谱
    const graphResults = this.knowledgeGraph?.search(query) || { entities: [], facts: [] };
    
    return {
      memories: vectorResults,
      knowledge: graphResults
    };
  }

  /**
   * 从文本提取实体（简化版）
   */
  extractEntities(text) {
    // 简化版实体提取 - 生产环境需用NLP模型
    const patterns = {
      person: /[张王李刘陈杨黄赵吴周徐孙马朱胡林郭何高罗郑梁谢宋唐许邓冯曹彭曾萧田董潘袁蔡蒋卢余][一-龥]{1,3}/g,
      place: /[北京上海广州深圳杭州南京成都武汉西安重庆][市区县]/g,
      organization: /[一-龥]{2,6}(公司|集团|大学|学院|医院|银行)/g
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern) || [];
      matches.forEach(name => {
        this.knowledgeGraph.addEntity(name, type);
      });
    }
  }

  /**
   * 学习知识
   */
  async learn(fact, entities = []) {
    if (!this.knowledgeGraph) {
      throw new Error('知识图谱未初始化');
    }
    
    // 记录操作
    this.reviewEngine?.log('learn', { fact: fact.substring(0, 50) });
    
    // 添加事实
    const factId = this.knowledgeGraph.addFact(fact, entities);
    
    // 同时存入向量记忆
    if (this.vectorMemory) {
      await this.vectorMemory.addMemory(fact, { type: 'knowledge' });
    }
    
    return factId;
  }

  /**
   * 复盘分析
   */
  async review() {
    if (!this.reviewEngine) {
      throw new Error('复盘引擎未初始化');
    }
    
    // 检测模式
    const patterns = await this.reviewEngine.detectPatterns();
    
    // 生成技能建议
    const skills = await this.reviewEngine.generateSkillSuggestions();
    
    // 返回报告
    return this.reviewEngine.getReport();
  }

  /**
   * 获取系统状态
   */
  getStatus() {
    return {
      initialized: this.initialized,
      modules: {
        vectorMemory: this.vectorMemory ? this.vectorMemory.getStats() : null,
        knowledgeGraph: this.knowledgeGraph ? this.knowledgeGraph.getStats() : null,
        modelManager: this.modelManager ? this.modelManager.getStatus() : null,
        reviewEngine: this.reviewEngine ? this.reviewEngine.getReport() : null,
        offlineASR: this.offlineASR ? this.offlineASR.getStatus() : null
      }
    };
  }

  /**
   * 语音识别
   */
  async transcribe(audio) {
    if (!this.offlineASR) {
      throw new Error('离线ASR未初始化');
    }
    this.reviewEngine?.log('transcribe', {});
    return await this.offlineASR.recognize(audio);
  }

  /**
   * 实时语音识别
   */
  startRealtimeTranscription(onResult, onError) {
    if (!this.offlineASR) {
      onError?.(new Error('离线ASR未初始化'));
      return null;
    }
    return this.offlineASR.startRealtimeRecognition(
      onResult,
      onError,
      () => this.reviewEngine?.log('transcribe_end', {})
    );
  }

  /**
   * 导出所有数据
   */
  async exportAll() {
    return {
      memories: this.vectorMemory ? await this.vectorMemory.export() : null,
      knowledge: this.knowledgeGraph ? this.knowledgeGraph.export() : null,
      review: this.reviewEngine ? this.reviewEngine.getReport() : null,
      exportedAt: Date.now()
    };
  }

  /**
   * 清空所有数据
   */
  async clearAll() {
    this.vectorMemory?.clearAll();
    this.knowledgeGraph?.clear();
    this.reviewEngine?.clear();
    console.log('🗑️ 已清空所有离线数据');
  }
}

// 全局实例
let tokiOffline = null;

// 初始化函数
async function initTOKIOffline(config = {}) {
  tokiOffline = new TOKIOfflineSystem();
  await tokiOffline.init(config);
  return tokiOffline;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TOKIOfflineSystem, initTOKIOffline };
}
