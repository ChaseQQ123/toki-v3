# TOKI + MiniClaw 集成指南

## 📋 集成概览

本文档说明如何将增强记忆系统集成到 TOKI V3.0

---

## ✅ 已完成

### 1. 增强记忆系统
**文件**: `enhanced-memory-system.js`

**核心功能**:
- ✅ DNA系统（8对染色体）
- ✅ 长期记忆 + 衰减机制
- ✅ 痛觉记忆（Nociception）
- ✅ 情绪状态系统（Affect）
- ✅ 用户画像系统
- ✅ 自动修剪机制

---

## 📋 待实施步骤

### 阶段2：集成到HTML（30分钟）

#### 2.1 加载记忆系统

在 `index.html` 的 `<head>` 部分添加：

```html
<!-- 增强记忆系统 -->
<script src="enhanced-memory-system.js"></script>
```

#### 2.2 修改对话发送函数

在发送消息时调用记忆系统：

```javascript
// 在 sendMessage 函数中添加
async function sendMessage(text) {
  // 1. 查询相关记忆
  const context = enhancedMemory.buildContext(text);
  
  // 2. 检查是否应该避免此操作
  const avoidCheck = enhancedMemory.shouldAvoid(text);
  if (avoidCheck.avoid) {
    addMessage('assistant', `⚠️ ${avoidCheck.reason}`);
    return;
  }
  
  // 3. 发送给AI（带上下文）
  const messages = [
    { role: 'system', content: context },
    { role: 'user', content: text }
  ];
  
  const response = await callAI(messages);
  
  // 4. 保存新记忆
  enhancedMemory.memorize(text, response.content);
  
  // 5. 更新情绪状态
  enhancedMemory.updateAffect('task_complete', true);
  
  // 6. 显示回复
  addMessage('assistant', response.content);
}
```

#### 2.3 添加记忆管理UI

在"🧠 记忆"标签页添加：

```html
<!-- 记忆管理界面 -->
<div id="memoryManagement" class="memory-section">
  <h3>📊 记忆统计</h3>
  <div id="memoryStats" class="stats-grid">
    <div class="stat-item">
      <span class="stat-label">总记忆</span>
      <span id="totalMemories" class="stat-value">0</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">痛点记录</span>
      <span id="totalNociception" class="stat-value">0</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">用户偏好</span>
      <span id="userPreferences" class="stat-value">0</span>
    </div>
  </div>
  
  <h3>💭 当前状态</h3>
  <div id="affectState" class="affect-display">
    <!-- 动态显示情绪状态 -->
  </div>
  
  <h3>📝 最近记忆</h3>
  <div id="recentMemories" class="memory-list">
    <!-- 显示最近记忆 -->
  </div>
  
  <div class="memory-actions">
    <button onclick="exportMemoryData()">📤 导出记忆</button>
    <button onclick="clearMemoryData()">🗑️ 清除记忆</button>
  </div>
</div>
```

#### 2.4 添加样式

```css
/* 记忆管理样式 */
.memory-section {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 12px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.affect-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.memory-list {
  max-height: 300px;
  overflow-y: auto;
}

.memory-item {
  background: white;
  border: 1px solid #e0e0e0;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.memory-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.memory-timestamp {
  font-size: 12px;
  color: #999;
}

.memory-tags {
  display: flex;
  gap: 5px;
  margin-top: 8px;
}

.memory-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.memory-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.memory-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.memory-actions button:first-child {
  background: #667eea;
  color: white;
}

.memory-actions button:last-child {
  background: #ff5252;
  color: white;
}
```

#### 2.5 添加JavaScript函数

```javascript
// 更新记忆统计
function updateMemoryStats() {
  const stats = enhancedMemory.getStats();
  
  document.getElementById('totalMemories').textContent = stats.totalMemories;
  document.getElementById('totalNociception').textContent = stats.totalNociception;
  document.getElementById('userPreferences').textContent = stats.userPreferences;
  
  // 显示情绪状态
  document.getElementById('affectState').textContent = enhancedMemory.getAffectSummary();
  
  // 显示最近记忆
  const recentMemories = enhancedMemory.memories.slice(-10).reverse();
  const memoriesHtml = recentMemories.map(memory => `
    <div class="memory-item">
      <div class="memory-item-header">
        <span>${memory.input.substring(0, 50)}...</span>
        <span class="memory-timestamp">${new Date(memory.timestamp).toLocaleString()}</span>
      </div>
      <div class="memory-tags">
        ${memory.tags.map(tag => `<span class="memory-tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');
  
  document.getElementById('recentMemories').innerHTML = memoriesHtml;
}

// 导出记忆数据
function exportMemoryData() {
  const data = enhancedMemory.exportData();
  const json = JSON.stringify(data, null, 2);
  
  // 创建下载
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `toki_memory_${Date.now()}.json`;
  a.click();
  
  alert('✅ 记忆数据已导出');
}

// 清除记忆数据
function clearMemoryData() {
  if (confirm('⚠️ 确定要清除所有记忆吗？此操作不可恢复。')) {
    enhancedMemory.clearMemories();
    updateMemoryStats();
    alert('🗑️ 记忆已清除');
  }
}

// 页面加载时更新统计
window.addEventListener('load', updateMemoryStats);
```

---

### 阶段3：高级功能（可选）

#### 3.1 记忆搜索功能

```javascript
// 添加搜索界面
<div class="memory-search">
  <input type="text" id="memorySearchInput" placeholder="搜索记忆...">
  <button onclick="searchMemories()">🔍</button>
</div>

// 搜索函数
function searchMemories() {
  const query = document.getElementById('memorySearchInput').value;
  const results = enhancedMemory.recall(query, 20);
  
  const resultsHtml = results.map(memory => `
    <div class="memory-item">
      <div><strong>问题:</strong> ${memory.input}</div>
      <div><strong>回答:</strong> ${memory.output.substring(0, 150)}...</div>
      <div class="memory-tags">
        ${memory.tags.map(tag => `<span class="memory-tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');
  
  document.getElementById('recentMemories').innerHTML = resultsHtml;
}
```

#### 3.2 记忆进化机制

```javascript
// 每日进化函数（参考MiniClaw）
function dailyEvolution() {
  const now = new Date();
  const lastEvolution = localStorage.getItem('last_evolution');
  
  // 检查是否需要进化
  if (!lastEvolution || 
      new Date(lastEvolution).getDate() !== now.getDate()) {
    
    // 1. 整理用户画像
    analyzeUserPatterns();
    
    // 2. 提取长期记忆
    extractLongTermMemories();
    
    // 3. 清理过期痛点
    decayNociception();
    
    // 4. 更新进化时间
    localStorage.setItem('last_evolution', now.toISOString());
    
    console.log('🧬 记忆系统已进化');
  }
}

// 分析用户模式
function analyzeUserPatterns() {
  const userDNA = enhancedMemory.chromosomes.USER;
  const memories = enhancedMemory.memories;
  
  // 统计常见关键词
  const keywords = {};
  memories.forEach(memory => {
    const words = memory.input.split(/\s+/);
    words.forEach(word => {
      keywords[word] = (keywords[word] || 0) + 1;
    });
  });
  
  // 提取高频词作为用户习惯
  const topKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => word);
  
  userDNA.habits.push({
    type: 'inferred',
    keywords: topKeywords,
    date: new Date().toISOString()
  });
  
  enhancedMemory.saveChromosome('USER', userDNA);
}

// 提取长期记忆
function extractLongTermMemories() {
  const memoryDNA = enhancedMemory.chromosomes.MEMORY;
  
  // 找出高重要性记忆
  const importantMemories = enhancedMemory.memories
    .filter(m => m.importance > 0.8)
    .slice(-20);
  
  memoryDNA.longTerm = importantMemories.map(m => ({
    input: m.input,
    importance: m.importance,
    timestamp: m.timestamp
  }));
  
  enhancedMemory.saveChromosome('MEMORY', memoryDNA);
}

// 痛点衰减
function decayNociception() {
  const now = Date.now();
  const halfLife = 7 * 24 * 60 * 60 * 1000; // 7天
  
  enhancedMemory.nociceptionLog = enhancedMemory.nociceptionLog.filter(pain => {
    const age = now - new Date(pain.lastOccurrence).getTime();
    const decay = Math.pow(0.5, age / halfLife);
    return decay > 0.1; // 保留衰减值 > 0.1 的痛点
  });
  
  enhancedMemory.saveNociception();
}

// 每小时检查一次进化
setInterval(dailyEvolution, 60 * 60 * 1000);
```

---

## 🎯 使用示例

### 示例1：记录用户偏好

```javascript
// 用户说："我喜欢简洁的回答"
sendMessage("我喜欢简洁的回答，不要太啰嗦")

// 系统会自动：
// 1. 记录到记忆系统
// 2. 提取"喜欢简洁的回答"作为用户偏好
// 3. 写入USER染色体
// 4. 下次对话时会参考此偏好
```

### 示例2：痛觉记忆

```javascript
// 用户反馈："这个命令执行失败了，不要再用这个方法"
sendMessage("执行某个命令失败了")

// 系统会：
// 1. 记录痛觉（命令执行失败）
// 2. 下次遇到类似操作时会提醒
// 3. 如果多次失败，会写入DNA永久避免
```

### 示例3：情绪状态

```javascript
// 查看当前情绪状态
const summary = enhancedMemory.getAffectSummary();
// 输出："当前状态：⚠️ 高度警觉 😊 情绪良好 🔍 好奇心强"

// 获取详细状态
const stats = enhancedMemory.getStats();
console.log(stats.affectState);
// 输出：{ alertness: 0.8, mood: 0.7, curiosity: 0.8, confidence: 0.6 }
```

---

## 📊 效果对比

| 功能 | 集成前 | 集成后 |
|------|--------|--------|
| 记忆 | ❌ 单次会话 | ✅ 长期记忆 |
| 用户画像 | ❌ 无 | ✅ 自动学习 |
| 痛觉记忆 | ❌ 无 | ✅ 避免重复错误 |
| 情绪状态 | ❌ 无 | ✅ 动态情绪 |
| 记忆管理 | ❌ 无 | ✅ 完整UI |
| 数据导出 | ❌ 无 | ✅ JSON导出 |

---

## 🚀 下一步

1. **立即执行**：将上述代码集成到 `index.html`
2. **测试验证**：测试记忆、痛觉、情绪功能
3. **优化调整**：根据实际使用调整参数
4. **PicoClaw**：如效果好，开发原生APP版本

---

**准备好开始集成了吗？** 🚀
