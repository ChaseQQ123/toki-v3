# iPhone测试方案

## 🚀 方案1：PWA（立即可用，推荐）

### 步骤

1. **打开Safari**
   - 访问：https://chaseqq123.github.io/toki-v3/

2. **添加到主屏幕**
   - 点击底部"分享"按钮 📤
   - 选择"添加到主屏幕"
   - 点击"添加"

3. **像APP一样使用**
   - 桌面会出现TOKI图标
   - 点击打开，全屏体验
   - 支持离线使用

### 优势
- ✅ 无需安装
- ✅ 像原生APP一样
- ✅ 自动更新
- ✅ 支持离线

---

## 📱 方案2：iOS原生APP（需要Mac）

### 前置要求
- **Mac电脑**（必需）
- **Xcode 12+**（免费）
- **Apple开发者账号**（$99/年，可选）

### 构建步骤

#### 1. 在Mac上克隆项目
```bash
git clone https://github.com/ChaseQQ123/toki-v3.git
cd toki-v3/native-build
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 添加iOS平台
```bash
npx cap add ios
npx cap sync
```

#### 4. 打开Xcode
```bash
npx cap open ios
```

#### 5. 配置签名
- 在Xcode中选择你的Team
- 配置Bundle Identifier: `com.toknm.toki`

#### 6. 安装到iPhone
- 连接iPhone到Mac
- 选择你的设备
- 点击运行按钮 ▶️

---

## 🆓 无需开发者账号（测试）

如果没有Apple开发者账号（$99/年），可以：

### 免费测试（7天有效期）
1. 使用个人Apple ID
2. 在Xcode中配置
3. 安装到iPhone测试
4. 每7天需要重新安装

### 正式发布（需要$99）
- 上传到App Store
- 或TestFlight测试
- 1年有效期

---

## 📊 对比

| 方案 | 时间 | 费用 | 限制 |
|------|------|------|------|
| **PWA** | 立即 | 免费 | 无 |
| **iOS测试版** | 需Mac | 免费 | 7天 |
| **iOS正式版** | 需Mac | $99/年 | 1年 |

---

## 🎯 推荐方案

**立即测试**：使用PWA方式
- 无需任何费用
- 无需Mac
- 像APP一样体验

**长期使用**：iOS原生APP
- 需要Mac + Xcode
- 更流畅的体验
- 推送通知等原生功能

---

## 🔗 相关链接

- **PWA地址**：https://chaseqq123.github.io/toki-v3/
- **GitHub仓库**：https://github.com/ChaseQQ123/toki-v3/
- **Capacitor iOS文档**：https://capacitorjs.com/docs/ios

---

**现在就用Safari打开链接，添加到主屏幕吧！** 🚀
