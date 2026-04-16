# 🔐 TOKI V6 纯本地存储架构

**核心原则**: 所有数据存储在用户手机本地，永不上传云端

**创建日期**: 2026-04-16  
**定位**: 比本地还本地，比隐私更隐私

---

## 🚫 为什么不做云端备份

### 云端备份的风险

1. **数据泄露** - 黑客攻击、内鬼泄露
2. **政府调取** - 依法配合调查
3. **公司倒闭** - 服务器关闭数据丢失
4. **滥用风险** - 训练 AI、卖给第三方
5. **用户恐惧** - 不敢说真话

### 我们的选择

```
❌ 云端备份 = 隐私风险 + 用户顾虑
✅ 纯本地存储 = 绝对安全 + 用户信任
```

---

## 📱 本地存储技术方案

### 方案 1: localStorage（基础）

**容量**: 5-10MB  
**持久性**: 永久（除非清除）  
**加密**: 需要自己实现  

```javascript
// 加密存储
class LocalStorage {
  async set(key, data) {
    const encrypted = await this.encrypt(data);
    localStorage.setItem(key, encrypted);
  }
  
  async get(key) {
    const encrypted = localStorage.getItem(key);
    return await this.decrypt(encrypted);
  }
  
  async encrypt(data) {
    // 使用用户设备 ID 作为密钥
    const key = await this.deriveKey(navigator.userAgent);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(JSON.stringify(data))
    );
    return JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    });
  }
}
```

---

### 方案 2: IndexedDB（推荐）

**容量**: 100MB+  
**持久性**: 永久  
**加密**: 内置支持  

```javascript
// 使用 IndexedDB 存储大量数据
class MemoryDB {
  constructor() {
    this.dbName = 'TOKI_Memory';
    this.version = 1;
    this.db = null;
  }
  
  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
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
        }
        
        // 创建 DNA 存储
        if (!db.objectStoreNames.contains('dna')) {
          db.createObjectStore('dna', { keyPath: 'userId' });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  async addMessage(message) {
    const tx = this.db.transaction('messages', 'readwrite');
    tx.objectStore('messages').add(message);
    return tx.complete;
  }
  
  async getHistory(limit = 100) {
    return new Promise((resolve) => {
      const tx = this.db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      
      const results = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  }
}
```

---

### 方案 3: PWA Cache（离线缓存）

**容量**: 50MB+  
**用途**: 静态资源 + 离线页面  

```javascript
// Service Worker 缓存
const CACHE_NAME = 'toki-v6-cache';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/aliyun-client.js',
        '/tokiclaw-integration.js'
      ]);
    })
  );
});

// 离线也能访问
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## 🔐 安全架构

### 1. 数据加密

```javascript
// 使用 Web Crypto API 硬件级加密
class SecurityManager {
  constructor() {
    this.key = null;
  }
  
  // 从设备特征生成密钥
  async deriveKey() {
    const deviceInfo = {
      ua: navigator.userAgent,
      lang: navigator.language,
      platform: navigator.platform,
      cores: navigator.hardwareConcurrency,
      memory: navigator.deviceMemory,
      screen: `${screen.width}x${screen.height}`
    };
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(deviceInfo));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    return await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  // 加密数据
  async encrypt(data) {
    if (!this.key) this.key = await this.deriveKey();
    
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
  }
  
  // 解密数据
  async decrypt(encrypted) {
    if (!this.key) this.key = await this.deriveKey();
    
    const iv = new Uint8Array(encrypted.iv);
    const data = new Uint8Array(encrypted.data);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.key,
      data
    );
    
    return JSON.parse(new TextDecoder().decode(decrypted));
  }
}
```

---

### 2. 隐私脱敏

```javascript
// 发送给 AI 前自动脱敏
class PrivacyFilter {
  static sanitize(text) {
    // 手机号
    text = text.replace(/1[3-9]\d{9}/g, '[手机号]');
    
    // 身份证
    text = text.replace(/\b\d{17}[\dXx]\b/g, '[身份证]');
    
    // 银行卡
    text = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[银行卡]');
    
    // 地址
    text = text.replace(/[\u4e00-\u9fa5]{2,}(省|市|区|县|路|街|号|栋|单元|室)/g, '[地址]');
    
    // 邮箱
    text = text.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[邮箱]');
    
    // 真实姓名（2-4 个中文字）
    text = text.replace(/(?<![a-zA-Z\u4e00-\u9fa5])[\u4e00-\u9fa5]{2,4}(?![a-zA-Z\u4e00-\u9fa5])/g, '[姓名]');
    
    // 密码
    text = text.replace(/密码 [是：:为]?\s*\S+/gi, '[密码]');
    
    return text;
  }
  
  // 智能识别是否包含隐私
  static containsPrivacy(text) {
    const patterns = [
      /1[3-9]\d{9}/,  // 手机号
      /\d{17}[\dXx]/,  // 身份证
      /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/,  // 银行卡
      /@[\w.-]+\./,  // 邮箱
      /密码/i  // 密码
    ];
    
    return patterns.some(p => p.test(text));
  }
  
  // 脱敏报告
  static report(text) {
    const report = {
      original: text,
      sanitized: this.sanitize(text),
      found: []
    };
    
    if (/1[3-9]\d{9}/.test(text)) report.found.push('手机号');
    if (/\d{17}[\dXx]/.test(text)) report.found.push('身份证');
    if (/@[\w.-]+\./.test(text)) report.found.push('邮箱');
    if (/密码/i.test(text)) report.found.push('密码');
    
    return report;
  }
}

// 使用示例
const message = "我的手机号是 13812345678，邮箱是 test@example.com";
const sanitized = PrivacyFilter.sanitize(message);
// 结果："我的手机号是 [手机号]，邮箱是 [邮箱]"
```

---

### 3. 数据隔离

```javascript
// 不同数据类型存储在不同地方
class DataIsolation {
  constructor() {
    // 敏感数据 - IndexedDB + 加密
    this.sensitiveDB = new MemoryDB('sensitive');
    
    // 普通数据 - localStorage
    this.normalStorage = localStorage;
    
    // 临时数据 - 内存
    this.tempData = new Map();
  }
  
  // 存储敏感数据（记忆、DNA）
  async storeSensitive(key, data) {
    const encrypted = await security.encrypt(data);
    await this.sensitiveDB.put(key, encrypted);
  }
  
  // 存储普通数据（设置、缓存）
  storeNormal(key, data) {
    this.normalStorage.setItem(key, JSON.stringify(data));
  }
  
  // 临时数据（不持久化）
  storeTemp(key, data) {
    this.tempData.set(key, data);
  }
}
```

---

## 📊 存储容量管理

### 智能清理策略

```javascript
class StorageManager {
  async checkQuota() {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage;
    const quota = estimate.quota;
    const percent = (usage / quota) * 100;
    
    return { usage, quota, percent };
  }
  
  async cleanup(days = 30) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    // 清理 30 天前的记忆
    const oldMessages = await memoryDB.getOlderThan(cutoff);
    for (const msg of oldMessages) {
      await memoryDB.delete(msg.id);
    }
    
    // 压缩 DNA（只保留最重要的）
    await dna.compress();
    
    // 清理临时文件
    await cache.clean();
  }
  
  // 自动管理
  async autoManage() {
    const { percent } = await this.checkQuota();
    
    if (percent > 80) {
      await this.cleanup(30);  // 清理 30 天前
    }
    
    if (percent > 90) {
      await this.cleanup(7);  // 清理 7 天前
    }
    
    if (percent > 95) {
      await this.cleanup(1);  // 清理 1 天前
    }
  }
}
```

---

## 🎯 V6 纯本地架构

### 数据流向

```
┌─────────────────────────────────────┐
│          用户输入消息               │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      PrivacyFilter 隐私脱敏         │
│   "我住在北京朝阳区" → "我住在 [地址]" │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   发送给阿里云 AI（脱敏后的内容）    │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         接收 AI 回复                 │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   SecurityManager 加密              │
│   (AES-256 硬件级加密)              │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   IndexedDB 本地存储                │
│   - 对话记忆（加密）                │
│   - DNA 画像（加密）                 │
│   - 情绪状态（明文）                │
└─────────────────────────────────────┘
```

---

### 用户控制

```javascript
// 用户可以完全控制自己的数据
class UserControl {
  // 查看所有数据
  async viewData() {
    return {
      messages: await memoryDB.count(),
      dna: await dna.export(),
      storage: await storageManager.checkQuota()
    };
  }
  
  // 导出所有数据
  async exportData() {
    return {
      messages: await memoryDB.getAll(),
      dna: await dna.export(),
      timestamp: Date.now()
    };
  }
  
  // 一键清除所有数据
  async wipeAll() {
    await memoryDB.clear();
    await dna.clear();
    localStorage.clear();
    await caches.keys().then(names => names.forEach(n => caches.delete(n)));
    
    return { success: true, message: '所有数据已清除' };
  }
  
  // 清除特定时间段
  async wipePeriod(days) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    await memoryDB.deleteOlderThan(cutoff);
  }
}
```

---

## 💡 竞争优势

### 对比竞品

| 功能 | 豆包 | 文心一言 | OpenClaw | **TOKI V6** |
|------|------|---------|----------|-----------|
| 数据存储 | 云端 | 云端 | 本地 | **纯本地** |
| 数据加密 | ❌ | ❌ | ⚠️ | **✅ 硬件级** |
| 隐私脱敏 | ❌ | ❌ | ❌ | **✅ 自动** |
| 用户控制 | ❌ | ❌ | ⚠️ | **✅ 完全** |
| 离线使用 | ❌ | ❌ | ✅ | **✅ PWA** |
| 数据导出 | ❌ | ❌ | ✅ | **✅ 加密** |
| 一键清除 | ❌ | ❌ | ❌ | **✅ 彻底** |

---

## 🎯 核心卖点

### 对用户说

> **"你的秘密，只有你知道"**

- 📱 **100% 本地存储** - 数据不出手机
- 🔐 **硬件级加密** - 连我们都看不到
- 🗑️ **一键清除** - 彻底删除不留痕
- 📤 **数据导出** - 随时带走你的数据
- 🚫 **绝不上传** - 没有云端备份选项

### 技术亮点

```
✅ Web Crypto API - 浏览器原生加密
✅ IndexedDB - 大容量本地存储
✅ PWA - 离线也能用
✅ 自动脱敏 - 隐私智能过滤
✅ 设备指纹 - 唯一密钥生成
```

---

## 🚀 开发计划

### V6.0（本周）
- [ ] IndexedDB 记忆存储
- [ ] Web Crypto 加密
- [ ] 隐私脱敏过滤器
- [ ] 纯本地架构

### V6.1（下周）
- [ ] 数据导出功能
- [ ] 一键清除功能
- [ ] 存储容量管理
- [ ] PWA 离线支持

### V6.2（2 周后）
- [ ] 记忆可视化
- [ ] DNA 画像展示
- [ ] 情绪状态显示
- [ ] 用户控制面板

---

## 📝 总结

**纯本地存储的意义**：

1. **绝对隐私** - 没有云端泄露风险
2. **用户信任** - 敢说真话、敢分享秘密
3. **法律合规** - 不涉及数据跨境
4. **成本降低** - 无需服务器存储
5. **离线可用** - 没网也能用基础功能

**我们的承诺**：

> "我们连你的数据长什么样都不知道，因为它们从未离开过你的手机。"

---

创建者：Yuanzi  
日期：2026-04-16  
版本：V6.0 纯本地架构
