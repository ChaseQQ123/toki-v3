// TOKI V2 - WebRTC视频通话客户端

class TOKIVideoCall {
    constructor() {
        // WebRTC配置
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        // 连接状态
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.socket = null;
        this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
        this.roomId = null;
        
        // 信令服务器地址
        this.signalingServer = 'wss://api.toknm.hk/ws';
        // 本地测试：'ws://localhost:8000/ws'
    }
    
    /**
     * 初始化本地视频
     */
    async initializeLocalVideo() {
        try {
            console.log('📹 请求摄像头和麦克风权限...');
            
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
            
            console.log('✅ 获得本地视频流');
            
            // 显示本地视频
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
            }
            
            return true;
        } catch (error) {
            console.error('❌ 无法访问摄像头:', error);
            throw error;
        }
    }
    
    /**
     * 连接信令服务器
     */
    connectSignalingServer() {
        console.log('🔌 连接信令服务器...');
        
        this.socket = new WebSocket(`${this.signalingServer}/${this.userId}`);
        
        this.socket.onopen = () => {
            console.log('✅ 信令服务器连接成功');
            this.onSignalingConnected();
        };
        
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleSignalingMessage(message);
        };
        
        this.socket.onerror = (error) => {
            console.error('❌ 信令服务器错误:', error);
            this.onSignalingError(error);
        };
        
        this.socket.onclose = () => {
            console.log('🔌 信令服务器连接关闭');
            this.onSignalingDisconnected();
        };
    }
    
    /**
     * 加入房间
     */
    joinRoom(roomId) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('❌ 信令服务器未连接');
            return;
        }
        
        this.roomId = roomId || 'room_' + Date.now();
        
        console.log('👥 加入房间:', this.roomId);
        
        this.socket.send(JSON.stringify({
            type: 'join_room',
            room_id: this.roomId
        }));
    }
    
    /**
     * 处理信令消息
     */
    async handleSignalingMessage(message) {
        console.log('📨 收到信令消息:', message.type);
        
        switch (message.type) {
            case 'user_joined':
                // 有新用户加入，创建Offer
                console.log('👤 新用户加入:', message.user_id);
                await this.createOffer();
                break;
            
            case 'offer':
                // 收到Offer，创建Answer
                console.log('📋 收到Offer');
                await this.handleOffer(message.offer);
                break;
            
            case 'answer':
                // 收到Answer
                console.log('✅ 收到Answer');
                await this.handleAnswer(message.answer);
                break;
            
            case 'ice_candidate':
                // 收到ICE Candidate
                console.log('🧊 收到ICE Candidate');
                await this.handleIceCandidate(message.candidate);
                break;
            
            case 'user_left':
                // 用户离开
                console.log('👋 用户离开:', message.user_id);
                this.onUserLeft(message.user_id);
                break;
        }
    }
    
    /**
     * 创建WebRTC连接
     */
    async createPeerConnection() {
        console.log('🔗 创建WebRTC连接...');
        
        this.peerConnection = new RTCPeerConnection(this.configuration);
        
        // 添加本地流
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }
        
        // 监听远程流
        this.peerConnection.ontrack = (event) => {
            console.log('📹 收到远程流');
            this.remoteStream = event.streams[0];
            
            const remoteVideo = document.getElementById('remoteVideo');
            if (remoteVideo) {
                remoteVideo.srcObject = this.remoteStream;
            }
            
            this.onRemoteStreamReceived(this.remoteStream);
        };
        
        // 监听ICE Candidate
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('🧊 发送ICE Candidate');
                this.socket.send(JSON.stringify({
                    type: 'ice_candidate',
                    candidate: event.candidate
                }));
            }
        };
        
        // 监听连接状态
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            console.log('📊 连接状态:', state);
            this.onConnectionStateChanged(state);
        };
    }
    
    /**
     * 创建Offer
     */
    async createOffer() {
        if (!this.peerConnection) {
            await this.createPeerConnection();
        }
        
        console.log('📝 创建Offer...');
        
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        
        this.socket.send(JSON.stringify({
            type: 'offer',
            offer: offer
        }));
        
        console.log('✅ Offer已发送');
    }
    
    /**
     * 处理Offer
     */
    async handleOffer(offer) {
        if (!this.peerConnection) {
            await this.createPeerConnection();
        }
        
        console.log('📝 处理Offer...');
        
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        
        this.socket.send(JSON.stringify({
            type: 'answer',
            answer: answer
        }));
        
        console.log('✅ Answer已发送');
    }
    
    /**
     * 处理Answer
     */
    async handleAnswer(answer) {
        console.log('📝 处理Answer...');
        
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        
        console.log('✅ Answer已设置');
    }
    
    /**
     * 处理ICE Candidate
     */
    async handleIceCandidate(candidate) {
        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }
    
    /**
     * 切换音频
     */
    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                console.log('🎤 音频状态:', audioTrack.enabled ? '开启' : '关闭');
                return audioTrack.enabled;
            }
        }
        return false;
    }
    
    /**
     * 切换视频
     */
    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                console.log('📹 视频状态:', videoTrack.enabled ? '开启' : '关闭');
                return videoTrack.enabled;
            }
        }
        return false;
    }
    
    /**
     * 结束通话
     */
    endCall() {
        console.log('🔚 结束通话');
        
        // 离开房间
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'leave_room'
            }));
        }
        
        // 关闭连接
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        // 停止本地流
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        // 关闭WebSocket
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        
        this.onCallEnded();
    }
    
    // === 回调函数（由外部实现）===
    
    onSignalingConnected() {}
    onSignalingError(error) {}
    onSignalingDisconnected() {}
    onRemoteStreamReceived(stream) {}
    onConnectionStateChanged(state) {}
    onUserLeft(userId) {}
    onCallEnded() {}
}

// 导出
window.TOKIVideoCall = TOKIVideoCall;
