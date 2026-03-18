# VirtualCompanion - 虚拟人物聊天应用

一个基于 React Native + Expo 的虚拟人物聊天应用，支持实时音量显示和语音对话。

## 功能特性

- 🎤 实时音量检测 - 说话时显示音量条
- 💬 AI 对话 - 集成阿里云通义千问
- 🔊 语音合成 - AI 回复自动朗读
- 👤 2D 虚拟人物 - 可自定义立绘

## 技术栈

- **框架**: React Native + Expo
- **语言**: TypeScript
- **AI**: 阿里云通义千问 (DashScope)
- **语音识别**: 阿里云 ASR
- **语音合成**: Expo Speech / 阿里云 TTS

## 快速开始

### 1. 安装依赖

```bash
cd VirtualCompanion
npm install
```

### 2. 配置 API Key

复制配置文件并填入你的阿里云 API Key：

```bash
cp src/config.example.ts src/config.ts
```

编辑 `src/config.ts`，填入你的：
- `DASHSCOPE_API_KEY` - 阿里云 DashScope API Key
- `ALIYUN_ASR_TOKEN` - 阿里云语音识别 Token

### 3. 启动开发服务器

```bash
npx expo start
```

### 4. 运行应用

- **iOS**: 按 `i` 在 Simulator 中打开
- **Android**: 按 `a` 在 Android 设备/模拟器中打开
- **Web**: 按 `w` 在浏览器中打开

## 项目结构

```
VirtualCompanion/
├── App.tsx                 # 主应用入口
├── app.json               # Expo 配置
├── package.json           # 依赖配置
├── src/
│   ├── config.example.ts  # 配置示例
│   ├── types/
│   │   └── index.ts      # 类型定义
│   └── services/
│       ├── qwen.ts       # 通义千问 API
│       ├── asr.ts        # 语音识别服务
│       └── tts.ts        # 语音合成服务
└── README.md
```

## 阿里云服务配置

### 通义千问 (Qwen)

1. 访问 [阿里云 DashScope](https://dashscope.console.aliyun.com)
2. 开通服务并获取 API Key
3. 支持模型: qwen-turbo, qwen-plus, qwen-max 等

### 语音识别 (ASR)

1. 访问 [阿里云语音交互服务](https://nls-portal.console.aliyun.com)
2. 开通「一句话识别」服务
3. 获取 AppKey 和 Token

### 语音合成 (TTS)

1. 可使用 Expo 内置的 `expo-speech` (免费，无需配置)
2. 或使用阿里云 TTS 服务获取更自然的声音

## 注意事项

- 麦克风权限是必须的，首次使用会提示授权
- 语音识别需要网络连接
- 请确保 API Key 配置正确，否则无法使用 AI 对话功能

## 后续优化方向

- [ ] 接入阿里云 ASR 实现真正的语音转文字
- [ ] 使用更酷炫的 2D 虚拟人物/动画
- [ ] 添加对话历史记录
- [ ] 支持多角色切换
- [ ] 添加音色选择功能
- [ ] 适配平板设备
