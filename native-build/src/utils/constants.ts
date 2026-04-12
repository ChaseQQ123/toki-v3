// 常量配置

export const APP_CONFIG = {
  name: 'TOKI',
  version: '1.0.0',
  author: 'TOKNM Team'
};

export const API_CONFIG = {
  // 智谱AI（免费API，从TOKI V3.0继承）
  zhipu: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: 'c4911cf15f844167bd26301e25622cf1.n1BU10ytXbnQ6N5d',
    models: {
      chat: 'glm-4-flash',        // 对话模型
      image: 'cogview-3-flash',   // 图像生成
      video: 'cogvideox-flash',   // 视频生成
      vision: 'glm-4v-flash'      // 图像识别
    }
  },
  
  // 讯飞星火（无限免费）
  xunfei: {
    appId: '375ffe02',
    apiKey: 'a5f5156fb7cb051d55866912f67178d0',
    apiSecret: 'ZGNkYWM3MmYyNmIzYjUwYTYwZGZmZjA5',
    model: 'spark-lite'  // 无限免费
  },

  // 智能路由配置
  routing: {
    default: 'zhipu',  // 默认使用智谱
    rules: [
      { type: 'image', provider: 'zhipu', model: 'cogview-3-flash' },
      { type: 'video', provider: 'zhipu', model: 'cogvideox-flash' },
      { type: 'vision', provider: 'zhipu', model: 'glm-4v-flash' },
      { type: 'voice', provider: 'xunfei', model: 'spark-lite' },
      { type: 'chat', provider: 'zhipu', model: 'glm-4-flash' }
    ]
  }
};

export const MEMORY_CONFIG = {
  maxMemories: 1000,
  decayDays: 7,
  syncEnabled: true
};

export const THEME = {
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  errorColor: '#dc3545',
  successColor: '#28a745'
};

// Token套餐方案（TOKNM平台）
export const TOKEN_PACKAGES = [
  { 
    id: 'free', 
    name: '免费体验', 
    tokens: 10_000_000,  // 1000万token
    price: 0, 
    period: '永久',
    description: '系统起步配置1000万免费token'
  },
  { 
    id: 'payg', 
    name: '按量付费', 
    tokens: -1,  // 无限（按实际使用计费）
    price: 0, 
    period: '按量',
    description: '预存港币，按量计费',
    rate: '1 HKD = 100,000 tokens'  // 1港币 = 10万token
  },
  { 
    id: 'standard', 
    name: '标准套餐', 
    tokens: 50_000_000,  // 5000万token
    price: 99, 
    currency: 'HKD',
    period: '单月',
    description: '99港币5000万token'
  },
  { 
    id: 'premium', 
    name: '尊享套餐', 
    tokens: 120_000_000,  // 12000万token
    price: 199, 
    currency: 'HKD',
    period: '两个月',
    description: '199港币12000万token两个月'
  }
];

// Token计费配置
export const BILLING_CONFIG = {
  freeQuota: 10_000_000,        // 免费额度：1000万
  standardRate: 100_000,        // 标准汇率：1港币 = 10万token
  hkdrate: 1,                   // 港币计费
  currencies: ['HKD', 'USD', 'CNY']
};