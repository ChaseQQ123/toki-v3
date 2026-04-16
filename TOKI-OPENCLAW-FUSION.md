# 🦞 TOKI × OpenClaw 融合方案

**核心理念**: OpenClaw 的强大功能 + TOKI 的隐私保护 = 下一代个人 AI 助手

**创建日期**: 2026-04-16  
**定位**: 有记忆、会进化、超私人的 OpenClaw

---

## 🎯 核心分析

### OpenClaw 的优势

| 功能 | 说明 | 可否本地化 |
|------|------|-----------|
| 🧠 **记忆系统** | JSONL 长期记忆 | ✅ 完全本地 |
| 🧬 **DNA 染色体** | 8 条染色体学习用户 | ✅ 完全本地 |
| 😊 **情绪系统** | PAD 三维情绪 | ✅ 完全本地 |
| ⚡ **工具系统** | 30+ 工具（搜索、天气等） | ✅ 大部分本地 |
| 🤖 **Agent 编排** | 多 Agent 协作 | ✅ 本地路由 |
| 🔄 **智能路由** | 自动选择模型 | ✅ 本地决策 |
| 🎭 **角色系统** | 多角色切换 | ✅ 本地配置 |
| 📊 **ACE 引擎** | 时间/环境感知 | ✅ 本地传感器 |
| 💔 **痛觉记忆** | 从错误学习 | ✅ 完全本地 |
| 🔌 **模型集成** | 30+ LLM 支持 | ⚠️ 需要 API |

### 需要重新设计的部分

```
OpenClaw（服务器版）          TOKI V6（手机版）
┌─────────────────┐          ┌─────────────────┐
│  文件系统       │   →      │  IndexedDB      │
│  环境变量       │   →      │  本地配置       │
│  长期运行的 Bot │   →      │  PWA 后台任务   │
│  完整工具链     │   →      │  精简工具集     │
│  多用户支持     │   →      │  单用户 + 加密  │
└─────────────────┘          └─────────────────┘
```

---

## 🏗️ 融合架构

### 1. 核心层（100% 本地）

```javascript
// TOKIClaw Mobile - 精简版核心
class TOKIClawMobile {
  constructor() {
    // 核心模块（全部本地）
    this.memory = new JSONLStore('indexeddb');  // 记忆
    this.dna = new DNASystem(8);                // 8 条染色体
    this.emotion = new EmotionSystem();         // 情绪
    this.nociception = new PainSystem();        // 痛觉
    this.ace = new ACEEngine();                 // 环境感知
    
    // 本地工具
    this.tools = new LocalToolSystem([
      'calculator',    // 计算器
      'calendar',      // 日历
      'weather',       // 天气（API）
      'search',        // 搜索（API）
      'translate',     // 翻译（API）
      'file-manager',  // 文件管理
      'voice-input',   // 语音输入
      'image-ocr',     // 图像识别（API）
      'privacy-filter' // 隐私脱敏 ⭐
    ]);
    
    // 智能路由（本地决策）
    this.router = new SmartRouter({
      costOptimization: true,
      privacyFirst: true  // 新增：隐私优先
    });
  }
}
```

---

### 2. 工具层（分级处理）

#### Level 1: 纯本地工具（无需 API）

```javascript
const localTools = {
  // 计算器
  calculator: {
    name: '计算器',
    icon: '🧮',
    execute: (expr) => eval(expr),
    privacy: 'safe'
  },
  
  // 日历
  calendar: {
    name: '日历',
    icon: '📅',
    execute: () => new Date().toLocaleString('zh-CN'),
    privacy: 'safe'
  },
  
  // 文件管理
  fileManager: {
    name: '文件管理',
    icon: '📁',
    execute: async (action) => {
      // 使用 File System Access API
      const handle = await window.showOpenFilePicker();
      const file = await handle.getFile();
      return await file.text();
    },
    privacy: 'safe'
  },
  
  // 本地搜索（搜索记忆）
  memorySearch: {
    name: '搜索记忆',
    icon: '🔍',
    execute: async (query) => {
      return await memory.search(query);
    },
    privacy: 'safe'
  },
  
  // 数据导出
  dataExport: {
    name: '导出数据',
    icon: '📤',
    execute: async () => {
      const data = {
        messages: await memory.getAll(),
        dna: dna.export(),
        timestamp: Date.now()
      };
      // 下载为加密文件
      download(JSON.stringify(data));
    },
    privacy: 'safe'
  },
  
  // 一键清除
  dataWipe: {
    name: '清除所有数据',
    icon: '🗑️',
    execute: async () => {
      if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
        await memory.clear();
        await dna.clear();
        localStorage.clear();
        alert('所有数据已清除 ✅');
      }
    },
    privacy: 'safe'
  }
};
```

#### Level 2: 需要 API 的工具（脱敏后调用）

```javascript
const apiTools = {
  // 天气查询
  weather: {
    name: '天气查询',
    icon: '🌤️',
    execute: async (city) => {
      // 城市名不需要脱敏
      const response = await fetch(
        `https://api.weather.com?q=${city}&key=${API_KEY}`
      );
      return await response.json();
    },
    privacy: 'needs-filter'
  },
  
  // 网络搜索
  search: {
    name: '网络搜索',
    icon: '🔍',
    execute: async (query) => {
      // 脱敏后搜索
      const sanitized = PrivacyFilter.sanitize(query);
      const results = await webSearch(sanitized);
      return results;
    },
    privacy: 'needs-filter'
  },
  
  // 翻译
  translate: {
    name: '翻译',
    icon: '🌐',
    execute: async (text, targetLang) => {
      // 脱敏后翻译
      const sanitized = PrivacyFilter.sanitize(text);
      return await translateAPI(sanitized, targetLang);
    },
    privacy: 'needs-filter'
  },
  
  // 图像识别（OCR）
  imageOCR: {
    name: '图像识别',
    icon: '📸',
    execute: async (imageBlob) => {
      // 图片上传到阿里云识别
      const formData = new FormData();
      formData.append('image', imageBlob);
      const result = await aliyun.vision(imageBlob);
      return result.content;
    },
    privacy: 'needs-review'  // 图片可能包含隐私
  },
  
  // AI 对话
  chat: {
    name: 'AI 对话',
    icon: '💬',
    execute: async (message, history) => {
      // 1. 脱敏处理
      const sanitized = PrivacyFilter.sanitize(message);
      
      // 2. 智能路由选择模型
      const route = router.selectModel(sanitized, history);
      
      // 3. 调用 AI（只发送脱敏内容）
      const response = await aliyunClient.chat([
        { role: 'system', content: '你是 TOKI，用户的 AI 助手' },
        ...history.map(h => ({
          ...h,
          content: PrivacyFilter.sanitize(h.content)  // 历史也脱敏
        })),
        { role: 'user', content: sanitized }
      ], { model: route.model });
      
      // 4. 记录到本地记忆（原始内容，加密存储）
      await memory.add({
        role: 'user',
        content: message,  // 原始内容
        sanitized: sanitized,  // 脱敏版本
        timestamp: Date.now()
      });
      
      return response;
    },
    privacy: 'needs-filter'
  }
};
```

---

### 3. Agent 系统（本地编排）

```javascript
// 多 Agent 协作（全部本地）
class AgentSystem {
  constructor() {
    this.agents = {
      // 私人秘书
      secretary: {
        name: '私人秘书',
        icon: '💼',
        systemPrompt: '你是用户的私人秘书，负责日程管理、邮件处理等。',
        tools: ['calendar', 'email', 'reminder'],
        memory: true
      },
      
      // 学习导师
      tutor: {
        name: '学习导师',
        icon: '📚',
        systemPrompt: '你是用户的学习导师，负责解答问题、制定学习计划。',
        tools: ['search', 'translate', 'calculator'],
        memory: true
      },
      
      // 编程助手
      coder: {
        name: '编程助手',
        icon: '💻',
        systemPrompt: '你是编程助手，负责写代码、Debug、技术解答。',
        tools: ['code-executor', 'search'],
        memory: true
      },
      
      // 健康顾问
      health: {
        name: '健康顾问',
        icon: '💪',
        systemPrompt: '你是健康顾问，提供健康建议、用药提醒等。',
        tools: ['reminder', 'calendar'],
        memory: true,
        extraPrivacy: true  // 健康数据额外保护
      },
      
      // 财务助手
      finance: {
        name: '财务助手',
        icon: '💰',
        systemPrompt: '你是财务助手，帮助记账、理财规划。',
        tools: ['calculator', 'file-manager'],
        memory: true,
        extraPrivacy: true  // 财务数据额外保护
      }
    };
    
    this.currentAgent = 'secretary';
  }
  
  // 切换 Agent
  switchAgent(agentName) {
    this.currentAgent = agentName;
    const agent = this.agents[agentName];
    
    // 加载该 Agent 的专属记忆
    if (agent.memory) {
      this.loadAgentMemory(agentName);
    }
    
    return agent;
  }
  
  // Agent 专属记忆（隔离存储）
  async loadAgentMemory(agentName) {
    const key = `agent_${agentName}_memory`;
    const memory = await indexedDB.get(key);
    return memory || [];
  }
  
  async saveAgentMemory(agentName, memory) {
    const key = `agent_${agentName}_memory`;
    await indexedDB.put(key, memory);
  }
}
```

---

### 4. 记忆系统（OpenClaw 核心）

```javascript
// JSONL 记忆存储（OpenClaw 核心，适配 IndexedDB）
class JSONLStore {
  constructor(dbName = 'TOKI_Memory') {
    this.dbName = dbName;
    this.db = null;
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建记忆存储
        if (!db.objectStoreNames.contains('messages')) {
          const store = db.createObjectStore('messages', {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('role', 'role', { unique: false });
          store.createIndex('agent', 'agent', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('[JSONLStore] 初始化完成');
        resolve(this.db);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // 添加记忆（加密存储）
  async add(message) {
    const tx = this.db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    
    // 加密敏感内容
    const encrypted = await security.encrypt({
      content: message.content,
      sanitized: message.sanitized || message.content
    });
    
    store.add({
      role: message.role,
      content: encrypted,  // 加密存储
      timestamp: message.timestamp || Date.now(),
      agent: message.agent || 'default'
    });
    
    return tx.complete;
  }
  
  // 获取历史（解密读取）
  async getHistory(limit = 50) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      
      const results = [];
      request.onsuccess = async (event) => {
        const cursor = event.target.result;
        if (cursor && results.length < limit) {
          try {
            // 解密内容
            const decrypted = await security.decrypt(cursor.value.content);
            results.push({
              ...cursor.value,
              content: decrypted.content
            });
          } catch (e) {
            // 解密失败，使用原始内容
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(results.reverse());
        }
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // 搜索记忆
  async search(query) {
    const all = await this.getHistory(1000);
    return all.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  // 清除所有记忆
  async clear() {
    const tx = this.db.transaction('messages', 'readwrite');
    tx.objectStore('messages').clear();
    return tx.complete;
  }
  
  // 导出记忆
  async export() {
    const all = await this.getHistory(10000);
    return {
      messages: all,
      count: all.length,
      timestamp: Date.now()
    };
  }
  
  // 统计
  async getStats() {
    return new Promise((resolve) => {
      const tx = this.db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        resolve({
          total: countRequest.result,
          storage: 'IndexedDB'
        });
      };
    });
  }
}
```

---

### 5. DNA 系统（OpenClaw 核心）

```javascript
// 8 条染色体（本地存储）
class DNASystem {
  constructor() {
    this.chromosomes = {
      preferences: {},    // 偏好（喜欢的风格、食物等）
      habits: {},        // 习惯（作息时间、使用频率）
      knowledge: {},     // 知识领域（专业、兴趣）
      personality: {},   // 性格特征（幽默/严肃等）
      pain: [],          // 痛觉记忆（从错误学习）
      emotion: {},       // 情绪模式（容易生气/开心等）
      environment: {},   // 环境适应（时间、地点偏好）
      relationships: {}  // 人际关系（联系人、社交模式）
    };
    this.version = 1;
  }
  
  // 从对话中学习
  async learn(message, response) {
    // 学习偏好
    if (message.includes('喜欢') || message.includes('不喜欢')) {
      this.chromosomes.preferences[message] = {
        content: response,
        timestamp: Date.now()
      };
    }
    
    // 学习习惯
    const hour = new Date().getHours();
    const timeSlot = this.getTimeSlot(hour);
    this.chromosomes.habits[timeSlot] = 
      (this.chromosomes.habits[timeSlot] || 0) + 1;
    
    // 学习知识领域
    const topics = this.extractTopics(message);
    topics.forEach(topic => {
      this.chromosomes.knowledge[topic] = 
        (this.chromosomes.knowledge[topic] || 0) + 1;
    });
    
    // 保存（加密）
    await this.save();
  }
  
  // 保存到 IndexedDB
  async save() {
    const encrypted = await security.encrypt({
      chromosomes: this.chromosomes,
      version: this.version
    });
    
    const tx = db.transaction('dna', 'readwrite');
    tx.objectStore('dna').put({
      userId: 'default',
      data: encrypted,
      timestamp: Date.now()
    });
  }
  
  // 从 IndexedDB 加载
  async load() {
    return new Promise(async (resolve) => {
      const tx = db.transaction('dna', 'readonly');
      const request = tx.objectStore('dna').get('default');
      
      request.onsuccess = async (event) => {
        const record = event.target.result;
        if (record) {
          try {
            const decrypted = await security.decrypt(record.data);
            this.chromosomes = decrypted.chromosomes;
            this.version = decrypted.version;
          } catch (e) {
            console.error('[DNA] 解密失败');
          }
        }
        resolve(this.chromosomes);
      };
    });
  }
  
  // 导出（用户可下载）
  async export() {
    return {
      chromosomes: this.chromosomes,
      version: this.version,
      timestamp: Date.now()
    };
  }
  
  // 导入（用户可恢复）
  async import(data) {
    this.chromosomes = data.chromosomes;
    this.version = data.version;
    await this.save();
  }
  
  // 清除
  async clear() {
    this.chromosomes = {
      preferences: {},
      habits: {},
      knowledge: {},
      personality: {},
      pain: [],
      emotion: {},
      environment: {},
      relationships: {}
    };
    await this.save();
  }
  
  getTimeSlot(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 23) return 'evening';
    return 'night';
  }
  
  extractTopics(text) {
    // 简单关键词提取
    const topics = ['编程', '音乐', '电影', '运动', '旅行', '美食', '科技', '金融'];
    return topics.filter(t => text.includes(t));
  }
}
```

---

## 🔐 隐私保护流程

### 完整数据流

```
1. 用户输入
   "我住在北京朝阳区，手机号 13812345678"
   
   ↓
   
2. 隐私脱敏（本地）
   PrivacyFilter.sanitize()
   "我住在 [地址]，手机号 [手机号]"
   
   ↓
   
3. 智能路由（本地）
   router.selectModel()
   → 选择 qwen-plus
   
   ↓
   
4. 发送 AI（脱敏内容）
   阿里云 API 收到：
   "我住在 [地址]，手机号 [手机号]"
   
   ↓
   
5. AI 回复
   "好的，我记不住你的具体地址和手机号"
   
   ↓
   
6. 加密存储（本地）
   security.encrypt(原始内容)
   → IndexedDB（加密）
   
   ↓
   
7. DNA 学习（本地）
   dna.learn(原始内容，回复)
   → 更新用户画像
```

---

## 🎯 融合后的竞争优势

### vs 豆包

| 功能 | 豆包 | TOKI V6 |
|------|------|---------|
| 记忆 | ❌ 短期 | ✅ **永久记忆** |
| 个性化 | ❌ 通用 | ✅ **DNA 画像** |
| 隐私 | ❌ 云端 | ✅ **纯本地** |
| 工具 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 进化 | ❌ | ✅ **痛觉学习** |

### vs OpenClaw

| 功能 | OpenClaw | TOKI V6 |
|------|----------|---------|
| 隐私 | ⚠️ 本地但无加密 | ✅ **本地 + 加密** |
| 易用性 | ❌ 复杂 | ✅ **手机友好** |
| 脱敏 | ❌ 无 | ✅ **自动过滤** |
| 用户控制 | ⚠️ 部分 | ✅ **完全控制** |
| 离线 | ✅ | ✅ **PWA** |

### vs 文心一言/通义千问

| 功能 | 传统 AI | TOKI V6 |
|------|--------|---------|
| 数据存储 | 云端 | **纯本地** |
| 数据加密 | ❌ | **硬件级** |
| 一键清除 | ❌ | **彻底删除** |
| 数据导出 | ❌ | **随时带走** |

---

## 🚀 开发优先级

### P0 - 核心功能（本周）

1. ✅ IndexedDB 记忆存储
2. ✅ Web Crypto 加密
3. ✅ 隐私脱敏过滤器
4. ✅ 基础工具集（计算器、日历等）
5. ✅ DNA 系统（8 染色体）

### P1 - 增强功能（下周）

6. ✅ Agent 系统（5 个角色）
7. ✅ 智能路由（阿里云）
8. ✅ 数据导出/导入
9. ✅ 一键清除
10. ✅ PWA 离线支持

### P2 - 高级功能（2 周后）

11. ✅ 记忆可视化
12. ✅ DNA 画像展示
13. ✅ 情绪系统
14. ✅ 痛觉学习
15. ✅ ACE 环境感知

---

## 💡 总结

**TOKI V6 = OpenClaw 的核心能力 × 隐私保护 × 手机适配**

### 我们保留了 OpenClaw 的：
- ✅ JSONL 记忆系统
- ✅ DNA 染色体学习
- ✅ 情绪系统
- ✅ 痛觉记忆
- ✅ Agent 编排
- ✅ 智能路由
- ✅ 工具系统

### 我们重新设计了：
- 🔐 纯本地存储（IndexedDB）
- 🔐 硬件级加密（Web Crypto）
- 🔐 自动隐私脱敏
- 🔐 用户完全控制
- 📱 手机界面优化
- 📱 PWA 离线支持

### 我们的创新：
- 💡 隐私优先架构
- 💡 分级工具系统
- 💡 Agent 专属记忆
- 💡 一键清除功能
- 💡 数据可导出

---

**愿景**: 让每个人都能拥有一个既强大又安全的私人 AI 助手

**使命**: 在绝对保护隐私的前提下，提供 OpenClaw 级别的 AI 能力

---

创建者：Yuanzi  
日期：2026-04-16  
版本：V6.0 融合方案
