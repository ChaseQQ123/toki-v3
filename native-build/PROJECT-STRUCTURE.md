# TOKI 原生APP - React Native 项目结构

## 📁 目录结构

```
toki-native/
├── App.tsx                 # 主应用入口
├── src/
│   ├── components/
│   │   ├── ChatScreen.tsx  # 对话界面
│   │   ├── MemoryScreen.tsx # 记忆管理界面
│   │   ├── VoiceButton.tsx # 语音按钮
│   │   └── TokenIndicator.tsx # Token显示
│   ├── services/
│   │   ├── PicoClaw.ts     # PicoClaw集成
│   │   ├── TOKNM_API.ts    # TOKNM API调用
│   │   └── VoiceService.ts # 语音服务
│   ├── types/
│   │   └── index.ts        # 类型定义
│   └── utils/
│   │   └── constants.ts    # 常量配置
├── assets/
│   └── logo.png            # 应用图标
├── package.json            # 依赖配置
├── tsconfig.json           # TypeScript配置
└── app.json                # Expo配置
```

---

## 🔧 核心集成步骤

### 1. 安装依赖
```bash
npm install @react-native-async-storage/async-storage
npm install expo-av expo-speech
```

### 2. 复制 PicoClaw
```bash
cp picoclaw/memory.js toki-native/src/services/PicoClaw.ts
cp picoclaw/react-native.js toki-native/src/services/PicoClawRN.ts
```

### 3. 配置 API
修改 `src/utils/constants.ts` 设置 TOKNM API

---

## 📱 主要功能

### ChatScreen
- 对话界面
- 集成 PicoClaw 记忆
- 语音输入
- Token 计费

### MemoryScreen
- 记忆列表
- DNA 查看
- 数据导入导出
- 云端同步

### VoiceButton
- 语音识别
- 语音合成
- 实时对话

---

## 🚀 开发流程

### Phase 1: 基础框架 (2天)
- React Native 项目初始化
- PicoClaw 集成
- 基础 UI

### Phase 2: 核心功能 (3天)
- 对话功能
- 记忆管理
- 语音服务

### Phase 3: API集成 (2天)
- TOKNM API
- Token 计费
- 云端同步

### Phase 4: 测试优化 (3天)
- 功能测试
- 性能优化
- UI 优化

---

## 💡 关键技术点

### 1. PicoClaw 初始化
```typescript
import { PicoClawRN } from './services/PicoClawRN';

const memory = new PicoClawRN({
  maxMemories: 1000,
  decayDays: 7
});

// 等待初始化
await memory.initPromise;
```

### 2. 对话流程
```typescript
// 1. 查询记忆
const context = await memory.recall(userMessage, 5);

// 2. 调用 TOKNM API
const response = await TOKNM_API.chat(userMessage, context);

// 3. 保存记忆
await memory.memorize(userMessage, response.content);

// 4. 更新情绪状态
memory.updateAffect('task', true);
```

### 3. 语音服务
```typescript
// 语音识别
const text = await VoiceService.recognize();

// 语音合成
await VoiceService.speak(response);
```

---

## 📊 预期效果

| 功能 | 实现方式 | 状态 |
|------|----------|------|
| 对话 | TOKNM API | 📋 |
| 记忆 | PicoClaw | ✅ |
| 语音 | Expo AV | 📋 |
| 计费 | Token系统 | 📋 |
| 同步 | 云端API | 📋 |

---

准备开始创建项目！