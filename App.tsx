import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { ChatMessage, VirtualCharacter } from './src/types';
import { sendToQwen } from './src/services/qwen';
import { speechToText } from './src/services/asr';
import { textToSpeech } from './src/services/tts';

const DEFAULT_CHARACTER: VirtualCharacter = {
  id: '1',
  name: '小雪',
  image: 'https://i.pravatar.cc/300?img=1',
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isAITyping, setIsAITyping] = useState(false);
  const [character] = useState<VirtualCharacter>(DEFAULT_CHARACTER);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const volumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // 请求麦克风权限
  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要麦克风权限才能使用语音功能');
      return false;
    }
    return true;
  };

  // 开始录音
  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);

      // 实时更新音量
      volumeIntervalRef.current = setInterval(async () => {
        if (recordingRef.current) {
          const status = await recordingRef.current.getStatusAsync();
          if (status.isRecording) {
            // expo-av 没有直接的音量 API，我们用录音的 metering 来模拟
            const metering = status.metering ?? -160;
            // 将分贝值转换为 0-1 的音量级别
            // -160 dB = 0, 0 dB = 1
            const normalizedVolume = Math.max(0, Math.min(1, (metering + 60) / 60));
            setVolumeLevel(normalizedVolume);
          }
        }
      }, 100);
    } catch (error) {
      console.error('录音失败:', error);
      Alert.alert('错误', '无法开始录音');
    }
  };

  // 停止录音
  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
        volumeIntervalRef.current = null;
      }

      setIsRecording(false);
      setVolumeLevel(0);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        // 语音转文字
        const userText = await speechToText(uri);
        if (userText) {
          handleSendMessage(userText);
        }
      }
    } catch (error) {
      console.error('停止录音失败:', error);
    } finally {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    }
  };

  // 发送消息
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAITyping(true);

    try {
      const aiResponse = await sendToQwen(text);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // 语音合成播放
      await textToSpeech(aiResponse);
    } catch (error) {
      console.error('AI 回复失败:', error);
      Alert.alert('错误', 'AI 回复失败，请检查网络和 API 配置');
    } finally {
      setIsAITyping(false);
    }
  };

  // 手动发送文字消息
  const handleTextSubmit = () => {
    if (inputText.trim()) {
      handleSendMessage(inputText.trim());
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部栏 */}
      <View style={styles.header}>
        <Image source={{ uri: character.image }} style={styles.characterAvatar} />
        <Text style={styles.characterName}>{character.name}</Text>
      </View>

      {/* 聊天区域 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.role === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={msg.role === 'user' ? styles.userText : styles.aiText}>
              {msg.content}
            </Text>
          </View>
        ))}
        {isAITyping && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.typingText}>对方正在输入...</Text>
          </View>
        )}
      </ScrollView>

      {/* 音量条 */}
      <View style={styles.volumeContainer}>
        <View style={styles.volumeBarOuter}>
          <View style={[styles.volumeBarInner, { width: `${volumeLevel * 100}%` }]} />
        </View>
        <Text style={styles.volumeText}>
          {isRecording ? `音量: ${Math.round(volumeLevel * 100)}%` : '按住说话'}
        </Text>
      </View>

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <Text style={styles.micButtonText}>{isRecording ? '🔴' : '🎤'}</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入文字..."
          onSubmitEditing={handleTextSubmit}
        />
        
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleTextSubmit}
        >
          <Text style={styles.sendButtonText}>发送</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  characterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  characterName: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  aiText: {
    color: '#333',
    fontSize: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  typingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  volumeContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  volumeBarOuter: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  volumeBarInner: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  volumeText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#ff3b30',
  },
  micButtonText: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    marginHorizontal: 12,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
