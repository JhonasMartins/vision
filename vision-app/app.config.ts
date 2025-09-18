import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const config: ExpoConfig = {
  name: 'vision-app',
  slug: 'vision-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription: 'Este app usa a câmera para reconhecer e descrever roupas por voz.',
      NSMicrophoneUsageDescription: 'Este app solicita acesso ao microfone para habilitar funcionalidades de áudio quando necessário.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ['CAMERA'],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    OPENAI_API_KEY,
  },
};

export default config;