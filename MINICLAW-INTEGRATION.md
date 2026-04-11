# MiniClaw + TOKI 整合方案

## 🎯 整合目标

将MiniClaw的记忆系统集成到TOKI，让TOKI具备：
- ✅ 长期记忆
- ✅ 跨会话记忆
- ✅ 项目理解
- ✅ 自动进化

---

## 📋 MiniClaw核心能力

### 1. 记忆系统（Entity Graph）
- 跨会话、跨IDE记忆
- 记住项目细节和个人偏好
- 自动整理和归类

### 2. MCP Server
- 可被Claude Desktop、Cursor集成
- 标准化协议
- 未来可扩展

### 3. 守护进程
- 后台自动复盘
- 深夜整理记忆
- 自动进化

### 4. 技能系统
- 自动发现技能
- 技能进化
- 同化外部技能

---

## 🚀 整合方案

### 方案1：快速集成（推荐）⭐

**步骤：**

1. **安装MiniClaw**
```bash
cd /home/tony/.openclaw/workspace/toki-v2
npm init -y
npm install @miniclaw_official/openclaw
```

2. **创建MiniClaw配置**
```javascript
// miniclaw-config.js
import { MiniClaw } from '@miniclaw_official/openclaw';

const claw = new MiniClaw({
  memory: {
    path: './memory',
    budget: 12000
  },
  evolution: {
    enabled: true,
    schedule: '0 2 * * *' // 凌晨2点进化
  }
});

export default claw;
```

3. **集成到TOKI**
```javascript
// index.html - 添加记忆功能
import claw from './miniclaw-config.js';

// 发送消息时调用记忆
async function sendMessage(text) {
  // 1. 查询相关记忆
  const context = await claw.recall(text);
  
  // 2. 发送给AI（带上下文）
  const response = await fetch(API_URL, {
    body: JSON.stringify({
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: text }
      ]
    })
  });
  
  // 3. 保存新记忆
  await claw.memorize({
    input: text,
    output: response.content,
    timestamp: Date.now()
  });
  
  return response;
}
```

---

### 方案2：完整集成（长期）

**架构：**

```
TOKI PWA
├── 前端（HTML/JS）
├── MiniClaw核心
│   ├── 记忆系统
│   ├── 技能系统
│   └── 进化系统
└── API层
    ├── 智谱AI
    ├── 讯飞星火
    └── 多模态模型
```

**功能：**
1. **长期记忆** - 记住所有对话
2. **项目理解** - 自动分析用户项目
3. **技能进化** - 学习用户习惯
4. **智能路由** - 选择最合适的模型

---

## 💻 示例代码

### 记忆API

```javascript
// 记忆某个信息
await claw.memorize({
  type: 'preference',
  content: '用户喜欢简洁的回答',
  tags: ['user', 'preference']
});

// 回忆相关信息
const memories = await claw.recall('用户偏好');
// 返回：[{ content: '用户喜欢简洁的回答', ... }]

// 查询项目结构
const project = await claw.analyzeProject();
// 返回：{ type: 'web', framework: 'vanilla', files: [...] }
```

### 技能API

```javascript
// 注册技能
await claw.registerSkill({
  name: 'image-recognition',
  description: '图像识别能力',
  handler: async (image) => {
    return await analyzeImage(image);
  }
});

// 调用技能
const result = await claw.useSkill('image-recognition', imageData);
```

---

## 🎨 UI集成

### 添加记忆指示器

```html
<!-- 在对话界面添加 -->
<div class="memory-indicator">
  <span id="memoryCount">📝 0 条记忆</span>
  <button onclick="viewMemories()">查看</button>
</div>
```

### 添加记忆管理

```html
<!-- 新增记忆标签页 -->
<div id="memoryTab" class="tab-content">
  <h2>🧠 我的记忆</h2>
  <div id="memoryList"></div>
  <button onclick="clearMemories()">清除记忆</button>
</div>
```

---

## 📊 效果对比

| 功能 | 整合前 | 整合后 |
|------|--------|--------|
| 记忆 | ❌ 无 | ✅ 长期记忆 |
| 上下文 | ⚠️ 单次会话 | ✅ 跨会话 |
| 个性化 | ❌ 无 | ✅ 学习偏好 |
| 项目理解 | ❌ 无 | ✅ 自动分析 |
| 技能 | ❌ 固定 | ✅ 自动进化 |

---

## 🚀 立即开始

**第一步：安装**
```bash
cd /home/tony/.openclaw/workspace/toki-v2
npm install @miniclaw_official/openclaw
```

**第二步：配置**
创建 `miniclaw-config.js`

**第三步：集成**
修改 `index.html` 添加记忆功能

---

## 💡 下一步

1. **先整合MiniClaw到TOKI PWA**（立即开始）
2. **测试记忆功能**（验证效果）
3. **如果效果好，再做PicoClaw版本**（原生APP）

---

**要我现在开始整合MiniClaw吗？** 🚀
