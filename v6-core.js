/**
 * TOKI V6 核心 - OpenClaw 功能 + 纯本地隐私保护
 * 包含：记忆系统、DNA 染色体、隐私脱敏、加密存储
 * 创建日期：2026-04-16
 */

// ============ 隐私脱敏过滤器 ============

class PrivacyFilter {
  // 脱敏处理
  static sanitize(text) {
    if (!text) return '';
    
    let result = text;
    
    // 手机号：138****5678
    result = result.replace(/1[3-9]\d{9}/g, '[手机号]');
    
    // 身份证：110101********1234
    result = result.replace(/\b\d{6}(\d{8})\d{4}[\dXx]?\b/g, '[身份证]');
    
    // 银行卡：6222 **** **** 1234
    result = result.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[银行卡]');
    
    // 邮箱
    result = result.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[邮箱]');
    
    // 地址（省市区路街号）
    result = result.replace(/[\u4e00-\u9fa5]{2,}(省|市|区|县|路|街|号|栋|单元|室|镇|乡|村)/g, '[地址]');
    
    // 姓名（2-4 个中文字，前后不是中文或字母）
    result = result.replace(/(?<![a-zA-Z\u4e00-\u9fa5])[\u4e00-\u9fa5]{2,4}(?![a-zA-Z\u4e00-\u9fa5])/g, '[姓名]');
    
    // 密码相关
    result = result.replace(/密码 [是：:为]?\s*\S+/gi, '[密码]');
    result = result.replace(/账号 [是：:为]?\s*\S+/gi, '[账号]');
    
    // URL
    result = result.replace(/https?:\/\/\S+/gi, '[链接]');
    
    return result;
  }
  
  // 检测是否包含隐私
  static containsPrivacy(text) {
    const patterns = [
      { name: '手机号', regex: /1[3-9]\d{9}/ },
      { name: '身份证', regex: /\d{17}[\dXx]/ },
      { name: '银行卡', regex: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/ },
      { name: '邮箱', regex: /@[\w.-]+\./ },
      { name: '地址', regex: /[省市区县路街号]/ },
      { name: '密码', regex: /密码/i }
    ];
    
    const found = [];
    patterns.forEach(p => {
      if (p.regex.test(text)) found.push(p.name);
    });
    
    return {
      hasPrivacy: found.length > 0,
      found: found
    };
  }
  
  // 脱敏报告
  static report(text) {
    const check = this.containsPrivacy(text);
    return {
      original: text,
      sanitized: this.sanitize(text),
      ...check
    };
  }
}

// ============ 安全加密管理器 ============

class SecurityManager {
  constructor() {
    this.key = null;
    this.initialized = false;
  }
  
  // 初始化（从设备特征生成密钥）
  async init() {
    if (this.initialized) return this.key;
    
    try {
      // 使用设备特征生成唯一密钥
      const deviceInfo = JSON.stringify({
        ua: navigator.userAgent,
        lang: navigator.language,
        platform: navigator.platform,
        cores: navigator.hardwareConcurrency || 4,
        memory: navigator.deviceMemory || 4,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      const encoder = new TextEncoder();
      const data = encoder.encode(deviceInfo);
      
      // SHA-256 哈希
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // 导入为 AES 密钥
      this.key = await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
      
      this.initialized = true;
      console.log('[Security] 加密系统初始化完成 🔐');
      return this.key;
      
    } catch (e) {
      console.error('[Security] 初始化失败:', e);
      throw e;
    }
  }
  
  // 加密数据
  async encrypt(data) {
    if (!this.initialized) await this.init();
    
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(JSON.stringify(data));
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.key,
        encoded
      );
      
      return {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted))
      };
    } catch (e) {
      console.error('[Security] 加密失败:', e);
      throw e;
    }
  }
  
  // 解密数据
  async decrypt(encrypted) {
    if (!this.initialized) await this.init();
    
    try {
      const iv = new Uint8Array(encrypted.iv);
      const data = new Uint8Array(encrypted.data);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.key,
        data
      );
      
      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (e) {
      console.error('[Security] 解密失败:', e);
      throw e;
    }
  }
}

// ============ JSONL 记忆存储（IndexedDB） ============

class JSONLStore {
  constructor(dbName = 'TOKI_Memory') {
    this.dbName = dbName;
    this.db = null;
    this.version = 1;
  }
  
  // 初始化数据库
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建消息存储
        if (!db.objectStoreNames.contains('messages')) {
          const store = db.createObjectStore('messages', {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('role', 'role', { unique: false });
          store.createIndex('agent', 'agent', { unique: false });
        }
        
        // 创建 DNA 存储
        if (!db.objectStoreNames.contains('dna')) {
          db.createObjectStore('dna', { keyPath: 'userId' });
        }
        
        console.log('[JSONLStore] 数据库结构创建完成');
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('[JSONLStore] 数据库打开成功');
        resolve(this.db);
      };
      
      request.onerror = (event) => {
        console.error('[JSONLStore] 数据库打开失败:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  // 添加消息（加密存储）
  async add(message) {
    if (!this.db) await this.init();
    
    return new Promise(async (resolve, reject) => {
      try {
        const tx = this.db.transaction('messages', 'readwrite');
        const store = tx.objectStore('messages');
        
        // 加密内容
        const encrypted = await security.encrypt({
          content: message.content,
          sanitized: message.sanitized || PrivacyFilter.sanitize(message.content)
        });
        
        store.add({
          role: message.role,
          content: encrypted,
          sanitized: PrivacyFilter.sanitize(message.content),
          timestamp: message.timestamp || Date.now(),
          agent: message.agent || 'default',
          model: message.model || null,
          tokens: message.tokens || null
        });
        
        tx.oncomplete = () => {
          console.log('[JSONLStore] 消息已保存');
          resolve(true);
        };
        
        tx.onerror = (event) => {
          reject(event.target.error);
        };
        
      } catch (e) {
        reject(e);
      }
    });
  }
  
  // 获取历史消息（解密读取）
  async getHistory(limit = 50) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('messages', 'readonly');
        const store = tx.objectStore('messages');
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev');
        
        const results = [];
        let count = 0;
        
        request.onsuccess = async (event) => {
          const cursor = event.target.result;
          
          if (cursor && count < limit) {
            try {
              // 解密内容
              const decrypted = await security.decrypt(cursor.value.content);
              results.push({
                id: cursor.value.id,
                role: cursor.value.role,
                content: decrypted.content,
                sanitized: decrypted.sanitized,
                timestamp: cursor.value.timestamp,
                agent: cursor.value.agent,
                model: cursor.value.model
              });
              count++;
              cursor.continue();
            } catch (e) {
              // 解密失败，使用脱敏版本
              results.push({
                id: cursor.value.id,
                role: cursor.value.role,
                content: cursor.value.sanitized,
                sanitized: cursor.value.sanitized,
                timestamp: cursor.value.timestamp,
                agent: cursor.value.agent,
                model: cursor.value.model
              });
              count++;
              cursor.continue();
            }
          } else {
            resolve(results.reverse());
          }
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
        
      } catch (e) {
        reject(e);
      }
    });
  }
  
  // 搜索记忆
  async search(query, limit = 20) {
    const all = await this.getHistory(1000);
    const queryLower = query.toLowerCase();
    
    const results = all.filter(msg => 
      msg.content.toLowerCase().includes(queryLower) ||
      (msg.sanitized && msg.sanitized.toLowerCase().includes(queryLower))
    );
    
    return results.slice(0, limit);
  }
  
  // 获取统计
  async getStats() {
    if (!this.db) await this.init();
    
    return new Promise((resolve) => {
      const tx = this.db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        resolve({
          total: countRequest.result,
          storage: 'IndexedDB',
          encrypted: true
        });
      };
      
      countRequest.onerror = () => {
        resolve({ total: 0, storage: 'IndexedDB', encrypted: true });
      };
    });
  }
  
  // 清除所有消息
  async clear() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('messages', 'readwrite');
      tx.objectStore('messages').clear();
      
      tx.oncomplete = () => {
        console.log('[JSONLStore] 所有消息已清除');
        resolve(true);
      };
      
      tx.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // 导出所有数据
  async export() {
    const all = await this.getHistory(10000);
    const stats = await this.getStats();
    
    return {
      messages: all,
      stats: stats,
      timestamp: Date.now(),
      version: 'TOKI-V6'
    };
  }
  
  // 删除旧消息（清理）
  async deleteOlderThan(timestamp) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('messages', 'readwrite');
      const store = tx.objectStore('messages');
      const index = store.index('timestamp');
      
      const request = index.openCursor(IDBKeyRange.upperBound(timestamp));
      let deleted = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          console.log(`[JSONLStore] 已删除 ${deleted} 条旧消息`);
          resolve(deleted);
        }
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
}

// ============ DNA 染色体系统 ============

class DNASystem {
  constructor() {
    this.chromosomes = {
      preferences: {},    // 偏好
      habits: {},        // 习惯
      knowledge: {},     // 知识
      personality: {},   // 性格
      pain: [],          // 痛觉
      emotion: {},       // 情绪模式
      environment: {},   // 环境适应
      relationships: {}  // 人际关系
    };
    this.version = 1;
    this.userId = 'default';
  }
  
  // 初始化（加载 DNA）
  async init() {
    if (!memoryStore.db) await memoryStore.init();
    
    return new Promise((resolve) => {
      const tx = memoryStore.db.transaction('dna', 'readonly');
      const request = tx.objectStore('dna').get(this.userId);
      
      request.onsuccess = (event) => {
        const record = event.target.result;
        if (record) {
          try {
            // 解密 DNA 数据
            security.decrypt(record.data).then(decrypted => {
              this.chromosomes = decrypted.chromosomes || this.chromosomes;
              this.version = decrypted.version || this.version;
              console.log('[DNA] DNA 加载完成', this.getStats());
              resolve(this.chromosomes);
            });
          } catch (e) {
            console.error('[DNA] 解密失败');
            resolve(this.chromosomes);
          }
        } else {
          console.log('[DNA] 首次使用，创建新 DNA');
          resolve(this.chromosomes);
        }
      };
      
      request.onerror = () => {
        resolve(this.chromosomes);
      };
    });
  }
  
  // 从对话中学习
  async learn(message, response) {
    const now = Date.now();
    const hour = new Date().getHours();
    const timeSlot = this.getTimeSlot(hour);
    
    // 1. 学习偏好
    if (message.includes('喜欢') || message.includes('不喜欢') || message.includes('爱') || message.includes('讨厌')) {
      const key = message.slice(0, 50);
      this.chromosomes.preferences[key] = {
        response: response.slice(0, 100),
        timestamp: now
      };
    }
    
    // 2. 学习习惯（时间段活跃度）
    this.chromosomes.habits[timeSlot] = (this.chromosomes.habits[timeSlot] || 0) + 1;
    
    // 3. 学习知识领域
    const topics = this.extractTopics(message);
    topics.forEach(topic => {
      this.chromosomes.knowledge[topic] = (this.chromosomes.knowledge[topic] || 0) + 1;
    });
    
    // 4. 学习性格特征（根据表达方式）
    if (message.includes('哈哈') || message.includes('嘻嘻')) {
      this.chromosomes.personality.humorous = (this.chromosomes.personality.humorous || 0) + 1;
    }
    if (message.includes('谢谢') || message.includes('感谢')) {
      this.chromosomes.personality.polite = (this.chromosomes.personality.polite || 0) + 1;
    }
    
    // 保存
    await this.save();
  }
  
  // 记录痛觉（从错误学习）
  async recordPain(error, context) {
    this.chromosomes.pain.push({
      error: error.message || String(error),
      context: context.slice(0, 200),
      timestamp: Date.now(),
      avoided: false
    });
    
    // 只保留最近 50 条痛觉记忆
    if (this.chromosomes.pain.length > 50) {
      this.chromosomes.pain = this.chromosomes.pain.slice(-50);
    }
    
    await this.save();
  }
  
  // 保存 DNA（加密）
  async save() {
    if (!memoryStore.db) await memoryStore.init();
    
    return new Promise(async (resolve, reject) => {
      try {
        const tx = memoryStore.db.transaction('dna', 'readwrite');
        const store = tx.objectStore('dna');
        
        const encrypted = await security.encrypt({
          chromosomes: this.chromosomes,
          version: this.version
        });
        
        store.put({
          userId: this.userId,
          data: encrypted,
          timestamp: Date.now()
        });
        
        tx.oncomplete = () => {
          console.log('[DNA] DNA 已保存');
          resolve(true);
        };
        
        tx.onerror = (event) => {
          reject(event.target.error);
        };
        
      } catch (e) {
        reject(e);
      }
    });
  }
  
  // 导出 DNA
  async export() {
    return {
      chromosomes: this.chromosomes,
      version: this.version,
      stats: this.getStats(),
      timestamp: Date.now()
    };
  }
  
  // 获取统计
  getStats() {
    return {
      preferences: Object.keys(this.chromosomes.preferences).length,
      habits: Object.keys(this.chromosomes.habits).length,
      knowledge: Object.keys(this.chromosomes.knowledge).length,
      pain: this.chromosomes.pain.length,
      version: this.version
    };
  }
  
  // 清除 DNA
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
    this.version = 1;
    await this.save();
  }
  
  // 时间段分类
  getTimeSlot(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 23) return 'evening';
    return 'night';
  }
  
  // 提取话题
  extractTopics(text) {
    const topics = [
      '编程', '技术', '代码', '软件',
      '音乐', '电影', '游戏', '运动',
      '旅行', '美食', '读书', '学习',
      '工作', '生活', '健康', '金融',
      '科技', 'AI', '科学'
    ];
    
    return topics.filter(t => text.includes(t));
  }
}

// ============ 全局实例 ============

const security = new SecurityManager();
const memoryStore = new JSONLStore('TOKI_Memory_V6');
const dnaSystem = new DNASystem();

// ============ 初始化函数 ============

async function initTOKIV6() {
  console.log('🚀 TOKI V6 核心初始化中...');
  
  try {
    // 1. 初始化加密系统
    await security.init();
    
    // 2. 初始化记忆存储
    await memoryStore.init();
    
    // 3. 初始化 DNA 系统
    await dnaSystem.init();
    
    console.log('✅ TOKI V6 核心初始化完成');
    console.log('📊 记忆条数:', (await memoryStore.getStats()).total);
    console.log('🧬 DNA 统计:', dnaSystem.getStats());
    
    return true;
  } catch (e) {
    console.error('❌ TOKI V6 初始化失败:', e);
    return false;
  }
}

// ============ 导出 ============

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PrivacyFilter,
    SecurityManager,
    JSONLStore,
    DNASystem,
    security,
    memoryStore,
    dnaSystem,
    initTOKIV6
  };
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.PrivacyFilter = PrivacyFilter;
  window.SecurityManager = SecurityManager;
  window.JSONLStore = JSONLStore;
  window.DNASystem = DNASystem;
  window.security = security;
  window.memoryStore = memoryStore;
  window.dnaSystem = dnaSystem;
  window.initTOKIV6 = initTOKIV6;
}

console.log('📦 TOKI V6 核心已加载');
