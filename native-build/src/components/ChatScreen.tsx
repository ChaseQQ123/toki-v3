import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PicoClawRN } from '../services/PicoClawRN';
import TOKNM_API from '../services/TOKNM_API';
import VoiceService from '../services/VoiceService';
import { Message } from '../types';
import { THEME } from '../utils/constants';

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [memory, setMemory] = useState<PicoClawRN | null>(null);

  // 初始化
  useEffect(() => {
    initMemory();
  }, []);

  const initMemory = async () => {
    const pico = new PicoClawRN({ maxMemories: 1000 });
    await pico.initPromise;
    setMemory(pico);
    console.log('✅ PicoClaw 初始化完成');
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputText.trim() || !memory) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 1. 查询记忆
      const contextMemories = await memory.recall(inputText, 5);
      const context = contextMemories
        .map(m => `Q: ${m.input}\nA: ${m.output}`)
        .join('\n\n');

      // 2. 调用 TOKNM API
      const reply = await TOKNM_API.chat(inputText, context);

      // 3. 保存记忆
      await memory.memorize(inputText, reply);

      // 4. 更新情绪状态
      memory.updateAffect('task', true);

      // 5. 添加回复
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 6. 语音朗读
      await VoiceService.speak(reply);
    } catch (error) {
      console.error('发送消息错误:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，发生了错误，请重试。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 语音输入
  const toggleRecording = async () => {
    if (isRecording) {
      // 停止录音
      const text = await VoiceService.stopRecordingAndRecognize();
      setInputText(text);
      setIsRecording(false);
    } else {
      // 开始录音
      await VoiceService.startRecording();
      setIsRecording(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 消息列表 */}
      <ScrollView style={styles.messageList}>
        {messages.map(message => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <Text style={styles.messageText}>{message.content}</Text>
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <Text>思考中...</Text>
          </View>
        )}
      </ScrollView>

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.voiceButton, isRecording && styles.recordingButton]}
          onPress={toggleRecording}
        >
          <Text style={styles.voiceButtonText}>
            {isRecording ? '⏹️' : '🎤'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入消息..."
          multiline
        />

        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>发送</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: THEME.primaryColor,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
  },
  loadingIndicator: {
    padding: 10,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recordingButton: {
    backgroundColor: THEME.errorColor,
  },
  voiceButtonText: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: THEME.primaryColor,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen;