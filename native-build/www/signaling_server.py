#!/usr/bin/env python3
"""
TOKI V2 - 视频通话信令服务器
用于WebRTC P2P连接的信号交换
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json
import uuid

app = FastAPI(title="TOKI Video Call Signaling Server")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 在线用户和房间管理
class ConnectionManager:
    def __init__(self):
        # 用户连接 {user_id: websocket}
        self.active_connections: Dict[str, WebSocket] = {}
        
        # 房间 {room_id: [user_id1, user_id2]}
        self.rooms: Dict[str, List[str]] = {}
        
        # 用户所在房间 {user_id: room_id}
        self.user_rooms: Dict[str, str] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """用户连接"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"✅ 用户连接: {user_id}")
    
    def disconnect(self, user_id: str):
        """用户断开"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        
        # 离开房间
        if user_id in self.user_rooms:
            room_id = self.user_rooms[user_id]
            if room_id in self.rooms:
                self.rooms[room_id].remove(user_id)
                if len(self.rooms[room_id]) == 0:
                    del self.rooms[room_id]
            del self.user_rooms[user_id]
        
        print(f"❌ 用户断开: {user_id}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        """发送个人消息"""
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)
    
    async def broadcast_to_room(self, message: dict, room_id: str, exclude_user: str = None):
        """向房间广播消息"""
        if room_id in self.rooms:
            for user_id in self.rooms[room_id]:
                if exclude_user and user_id == exclude_user:
                    continue
                await self.send_personal_message(message, user_id)

manager = ConnectionManager()

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "TOKI Video Call Signaling Server",
        "version": "2.0.0",
        "active_users": len(manager.active_connections),
        "active_rooms": len(manager.rooms)
    }

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket连接端点"""
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 处理不同类型的消息
            message_type = message.get("type")
            
            if message_type == "join_room":
                # 加入房间
                room_id = message.get("room_id")
                
                # 创建房间（如果不存在）
                if room_id not in manager.rooms:
                    manager.rooms[room_id] = []
                
                # 检查房间人数
                if len(manager.rooms[room_id]) >= 2:
                    await manager.send_personal_message({
                        "type": "error",
                        "message": "房间已满"
                    }, user_id)
                    continue
                
                # 加入房间
                manager.rooms[room_id].append(user_id)
                manager.user_rooms[user_id] = room_id
                
                # 通知房间内其他人
                await manager.broadcast_to_room({
                    "type": "user_joined",
                    "user_id": user_id
                }, room_id, exclude_user=user_id)
                
                print(f"👥 用户 {user_id} 加入房间 {room_id}")
            
            elif message_type == "leave_room":
                # 离开房间
                if user_id in manager.user_rooms:
                    room_id = manager.user_rooms[user_id]
                    
                    # 通知房间内其他人
                    await manager.broadcast_to_room({
                        "type": "user_left",
                        "user_id": user_id
                    }, room_id)
                    
                    # 离开房间
                    manager.rooms[room_id].remove(user_id)
                    del manager.user_rooms[user_id]
                    
                    print(f"🚪 用户 {user_id} 离开房间 {room_id}")
            
            elif message_type == "offer":
                # 转发SDP Offer
                room_id = manager.user_rooms.get(user_id)
                if room_id:
                    await manager.broadcast_to_room({
                        "type": "offer",
                        "user_id": user_id,
                        "offer": message.get("offer")
                    }, room_id, exclude_user=user_id)
            
            elif message_type == "answer":
                # 转发SDP Answer
                room_id = manager.user_rooms.get(user_id)
                if room_id:
                    await manager.broadcast_to_room({
                        "type": "answer",
                        "user_id": user_id,
                        "answer": message.get("answer")
                    }, room_id, exclude_user=user_id)
            
            elif message_type == "ice_candidate":
                # 转发ICE Candidate
                room_id = manager.user_rooms.get(user_id)
                if room_id:
                    await manager.broadcast_to_room({
                        "type": "ice_candidate",
                        "user_id": user_id,
                        "candidate": message.get("candidate")
                    }, room_id, exclude_user=user_id)
    
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        print(f"🔌 WebSocket断开: {user_id}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 TOKI 视频通话信令服务器启动...")
    print("📡 WebSocket地址: ws://localhost:8000/ws/{user_id}")
    print("🌐 HTTP地址: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
