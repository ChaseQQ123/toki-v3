# 📱 TOKI Native 快速启动指南

## 🚨 重要提示

**此项目需要在本地电脑上运行，不能在远程服务器上运行**

---

## 📋 前提条件

### 电脑要求
- Node.js 16+ 已安装
- npm 或 yarn 已安装

### 手机准备
- ✅ 已安装 Expo Go
  - Android: 华为应用市场搜索 "Expo Go"
  - iPhone: App Store 搜索 "Expo Go"

---

## 🚀 快速启动（3步骤）

### 步骤1：下载项目

```bash
# 从服务器下载项目
scp -r user@server:/home/tony/.openclaw/workspace/toki-native ./

# 或者从 GitHub 克隆（如果已推送）
git clone https://github.com/your-repo/toki-native.git
```

### 步骤2：安装依赖

```bash
cd toki-native
npm install --legacy-peer-deps
```

**等待 2-5 分钟**

### 步骤3：启动服务器

```bash
npm start
```

**或使用脚本**:
```bash
./LOCAL-START.sh
```

---

## 📱 扫码连接

### 服务器启动后会显示二维码

**Android**:
- 打开 Expo Go
- 点击 "Scan QR Code"
- 扫描二维码

**iPhone**:
- 打开相机
- 对准二维码
- 点击通知打开 Expo Go

---

## ⏱️ 预期时间

| 步骤 | 时间 |
|------|------|
| 下载项目 | 1-2 分钟 |
| 安装依赖 | 2-5 分钟 |
| 启动服务器 | 10-30 秒 |
| 扫码连接 | 10 秒 |
| **总计** | **3-8 分钟** |

---

## ❓ 常见问题

### Q: 为什么不能在远程服务器上运行？
**A**: Expo 开发服务器需要：
- 本地网络连接（手机和电脑同一WiFi）
- 实时热重载（低延迟要求）
- 二维码生成（需要图形界面）

### Q: 没有本地电脑怎么办？
**A**: 可以：
1. 使用云IDE（如 CodeSandbox）+ 隧道模式
2. 构建 APK/IPA 后直接安装
3. 使用网页版预览

### Q: npm install 很慢？
**A**: 尝试：
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install --legacy-peer-deps
```

---

## 🔗 相关文档

- [Android 测试指南](./TESTING-ANDROID.md)
- [iPhone 测试指南](./TESTING-IOS.md)
- [完整测试指南](./TESTING-GUIDE.md)

---

## 📧 需要帮助？

如果遇到问题：
1. 检查 Node.js 版本: `node -v`
2. 检查 npm 版本: `npm -v`
3. 清除缓存: `npm cache clean --force`
4. 删除 node_modules 重装: `rm -rf node_modules && npm install`

---

**推荐使用本地电脑运行，获得最佳体验！** 🚀