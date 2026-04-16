/**
 * TOKI 配置文件
 * 集成阿里云百炼智能路由
 * 创建日期：2026-04-16
 */

// 加载环境变量
const ALIYUN_API_KEY = process.env.ALIYUN_API_KEY || 'sk-ebea5eacead94e65aaec23f101a20a44';
const ALIYUN_BASE_URL = process.env.ALIYUN_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1';

module.exports = {
  // 阿里云百炼配置
  aliyun: {
    apiKey: ALIYUN_API_KEY,
    baseUrl: ALIYUN_BASE_URL
  },
  
  // 智能路由配置
  router: {
    // 成本优化模式（自动选择性价比最高的模型）
    costOptimization: true,
    
    // 性能模式（优先速度，可能增加成本）
    performanceMode: false,
    
    // 用户偏好
    userPreferences: {
      // 默认模型（可选，留空则自动选择）
      favoriteModel: null,
      
      // 避免使用的模型
      avoidModels: []
    }
  },
  
  // 默认模型配置
  models: {
    // 对话模型
    chat: {
      default: 'qwen-plus',      // 默认使用 qwen-plus
      fast: 'qwen-turbo',        // 快速响应
      complex: 'qwen-max'        // 复杂推理
    },
    
    // 视觉模型
    vision: {
      default: 'qwen-vl-max',    // 最强视觉
      lite: 'qwen-vl-plus'       // 性价比
    },
    
    // 语音模型
    audio: {
      asr: 'paraformer-v2',      // 语音识别
      tts: 'cosyvoice-v1'        // 语音合成
    },
    
    // 文档处理
    document: {
      default: 'qwen-long'       // 长文本
    },
    
    // 代码编程
    code: {
      default: 'qwen-coder'      // 代码专用
    },
    
    // 图像生成
    image: {
      default: 'wanx2.1-t2i-turbo'  // 文生图
    },
    
    // 向量嵌入
    embedding: {
      default: 'text-embedding-v3'  // 记忆系统
    }
  },
  
  // 记忆系统配置
  memory: {
    // 记忆文件路径
    storagePath: './data/memory.jsonl',
    
    // 最大记忆条数
    maxMessages: 1000,
    
    // 向量模型
    embeddingModel: 'text-embedding-v3'
  },
  
  // Agent 配置
  agent: {
    // 用户 ID
    userId: 'tony',
    
    // 用户名
    userName: 'Tony',
    
    // 系统提示词
    systemPrompt: '你是 TOKI，一个智能、友好、乐于助人的 AI 助手。你是 Tony 的 24 小时智能秘书。'
  },
  
  // 成本优化配置
  costOptimization: {
    // 启用节省计划优化
    enabled: true,
    
    // 月承诺金额（用于计算最优折扣）
    monthlyCommitment: 10000,
    
    // 承诺周期（月）
    commitmentPeriod: 12,
    
    // 折扣率（根据节省计划）
    discountRate: 0.8  // 8 折
  }
};
