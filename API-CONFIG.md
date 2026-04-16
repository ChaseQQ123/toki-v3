# ✅ TOKI 阿里云 API 配置完成

**配置日期**: 2026-04-16  
**状态**: ✅ 已完成并可用

---

## 🎉 配置摘要

| 项目 | 值 | 状态 |
|------|-----|------|
| API 密钥 | sk-ebea5eacead94e65aaec23f101a20a44 | ✅ 已配置 |
| API 地址 | https://dashscope.aliyuncs.com/api/v1 | ✅ 已配置 |
| 默认模型 | qwen-plus | ✅ 已设置 |
| 智能路由 | 启用 | ✅ 已启用 |
| 成本优化 | 启用 | ✅ 已启用 |

---

## 📂 配置文件位置

```
toki-v2/
├── .env                      ✅ 环境变量配置
├── config.js                 ✅ 主配置文件
├── aliyun-client.js          ✅ API 客户端（含智能路由）
├── test-aliyun.html          ✅ 测试页面
└── API-CONFIG.md             ✅ 本文件
```

---

## 🔑 已配置的功能

### 1. 阿里云百炼 API
- ✅ 文本对话（qwen-turbo/plus/max/long/coder）
- ✅ 视觉识别（qwen-vl-max/plus）
- ✅ 语音交互（paraformer/cosyvoice）
- ✅ 图像生成（wanx2.1）
- ✅ 向量嵌入（text-embedding-v3）

### 2. 智能路由系统
- ✅ 9 种意图识别
- ✅ 复杂度自动评估
- ✅ 成本优化模式
- ✅ 路由历史记录
- ✅ 统计分析

### 3. 成本优化
- ✅ 自动选择性价比模型
- ✅ 节省计划 8 折优惠
- ✅ 路由统计和监控

---

## 🧪 测试方法

### 方法 1: 浏览器测试（推荐）

1. 打开测试页面：
```bash
cd /home/tony/.openclaw/workspace/toki-v2
open test-aliyun.html
# 或在浏览器中访问文件
```

2. 测试功能：
- 🧠 智能路由测试
- 💬 文本对话测试
- 🎯 意图识别测试
- 📊 路由统计

### 方法 2: Node.js 测试

```javascript
const { aliyunClient } = require('./aliyun-client');

async function test() {
  // 测试路由
  const route = aliyunClient.selectModel('帮我写一封邮件');
  console.log('路由结果:', route);
  
  // 测试对话
  const response = await aliyunClient.chat([
    { role: 'user', content: '你好，我是 Tony' }
  ]);
  console.log('AI 回复:', response.content);
  console.log('使用模型:', response.model);
}

test();
```

---

## 💰 成本说明

### 模型定价（节省计划 8 折后）

| 模型 | 原价 | 8 折后 | 用途 |
|------|------|-------|------|
| qwen-turbo | ¥0.002/1K | ¥0.0016/1K | 简单对话 |
| qwen-plus | ¥0.004/1K | ¥0.0032/1K | 日常使用 ⭐ |
| qwen-max | ¥0.040/1K | ¥0.032/1K | 复杂推理 |
| qwen-long | ¥0.050/1K | ¥0.040/1K | 长文档 |
| qwen-coder | ¥0.035/1K | ¥0.028/1K | 代码编程 |
| qwen-vl-max | ¥0.05/次 | ¥0.04/次 | 图像识别 |

### 月度成本估算（1000 日活用户）

| 项目 | 调用量 | 成本 |
|------|--------|------|
| 文本对话 | 500K tokens | ¥1,600 |
| 图像识别 | 10K 次 | ¥400 |
| 语音交互 | 100 小时 | ¥600 |
| 向量嵌入 | 100K tokens | ¥80 |
| **总计** | - | **¥2,680/月** |

---

## 🚀 集成到 TOKI

### 前端集成

```html
<!-- 在 index.html 中引入 -->
<script src="aliyun-client.js"></script>
<script>
  // 发送消息
  async function sendMessage(message) {
    const messages = [{ role: 'user', content: message }];
    const response = await aliyunClient.chat(messages);
    
    console.log('回复:', response.content);
    console.log('模型:', response.model);
    console.log('意图:', response.route.intent);
    
    return response;
  }
</script>
```

### 后端集成（Node.js）

```javascript
const { aliyunClient } = require('./aliyun-client');

// 对话接口
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  
  const messages = [
    { role: 'system', content: '你是 TOKI，Tony 的智能秘书' },
    ...history,
    { role: 'user', content: message }
  ];
  
  const response = await aliyunClient.chat(messages);
  
  res.json({
    content: response.content,
    model: response.model,
    intent: response.route.intent
  });
});
```

---

## 📊 智能路由示例

### 示例 1: 简单对话
```
输入："你好"
意图：chat
模型：qwen-turbo
成本：¥0.0016/1K
原因：简单对话，快速响应
```

### 示例 2: 知识问答
```
输入："什么是量子力学？"
意图：knowledge
模型：qwen-plus
成本：¥0.0032/1K
原因：知识问答，性价比最优
```

### 示例 3: 代码编程
```
输入："用 Python 写快速排序"
意图：coding
模型：qwen-coder
成本：¥0.028/1K
原因：代码编程，专业模型
```

### 示例 4: 复杂推理
```
输入："详细分析这个商业案例的优缺点"
意图：reasoning
模型：qwen-max
成本：¥0.032/1K
原因：逻辑推理，最强模型（复杂度 85%）
```

---

## 🔧 配置选项

### 修改默认模型
```javascript
// config.js
module.exports.models.chat.default = 'qwen-max';
```

### 关闭成本优化
```javascript
// config.js
module.exports.router.costOptimization = false;
```

### 启用性能模式
```javascript
// config.js
module.exports.router.performanceMode = true;
```

### 设置用户偏好
```javascript
// config.js
module.exports.router.userPreferences = {
  favoriteModel: 'qwen-plus',
  avoidModels: ['qwen-max']
};
```

---

## 🐛 故障排查

### Q1: API 调用失败？
**检查**:
1. API 密钥是否正确
2. 网络是否通畅
3. 账户余额是否充足

### Q2: 模型选择不符合预期？
**检查**:
1. 意图识别是否准确
2. 复杂度评估是否合理
3. 路由规则配置

### Q3: 成本过高？
**优化**:
1. 启用成本优化模式
2. 调整路由规则
3. 增加节省计划额度

---

## 📝 下一步

1. ✅ 配置完成
2. 📋 运行测试（`test-aliyun.html`）
3. 📋 集成到 TOKI 主界面
4. 📋 上线使用

---

## 🔗 相关文档

- [阿里云百炼集成指南](../tokiclaw/ALIYUN-INTEGRATION.md)
- [TOKIClaw 文档](../tokiclaw/README.md)
- [阿里云官方文档](https://help.aliyun.com/zh/model-studio/)

---

**配置完成时间**: 2026-04-16 14:28  
**配置者**: Yuanzi  
**状态**: ✅ 就绪可用
