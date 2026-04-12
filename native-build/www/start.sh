#!/bin/bash
# TOKI V2 - 快速启动脚本

echo "🚀 TOKI V2 视频通话系统启动..."
echo ""

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装"
    exit 1
fi

# 检查依赖
echo "📦 检查依赖..."
pip3 install --user fastapi uvicorn websockets 2>&1 | grep -v "Requirement already satisfied" || true

# 启动信令服务器
echo ""
echo "🔌 启动信令服务器..."
python3 signaling_server.py &
SERVER_PID=$!

sleep 2

# 启动前端服务器
echo ""
echo "🌐 启动前端服务器..."
python3 -m http.server 8080 &
HTTP_PID=$!

sleep 1

echo ""
echo "✅ 系统已启动！"
echo ""
echo "📋 信息："
echo "  信令服务器: ws://localhost:8000/ws/{user_id}"
echo "  前端地址: http://localhost:8080"
echo "  服务器PID: $SERVER_PID"
echo "  HTTP PID: $HTTP_PID"
echo ""
echo "🎯 测试步骤："
echo "  1. 打开浏览器: http://localhost:8080"
echo "  2. 点击'创建房间'"
echo "  3. 在另一个浏览器窗口打开相同地址"
echo "  4. 输入房间ID，点击'加入房间'"
echo "  5. 开始视频通话！"
echo ""
echo "⏹️  停止服务: kill $SERVER_PID $HTTP_PID"
echo ""

# 等待用户输入
read -p "按Enter键停止服务..."

# 停止服务
echo ""
echo "🛑 停止服务..."
kill $SERVER_PID
kill $HTTP_PID

echo "✅ 服务已停止"