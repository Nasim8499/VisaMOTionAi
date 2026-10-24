// App Types
export interface AppConfig {
  appName: string;
  appVersion: string;
  appDescription: string;
  webviewUrl: string;
  enableCamera: boolean;
  enableFilePicker: boolean;
  enableShare: boolean;
  enableNotifications: boolean;
  enableBiometricAuth: boolean;
  onesignalAppId: string;
  deepLinkScheme: string;
}

// Mistral AI Types
export interface MistralMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MistralChatRequest {
  model: string;
  messages: MistralMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface MistralChatResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: MistralMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface MistralModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

// WebView Types
export interface WebViewMessage {
  type: string;
  data?: any;
}

export interface WebViewNavigationState {
  url: string;
  title: string;
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  Chat: { conversationId?: string };
  Settings: undefined;
  Auth: undefined;
};

export type MainTabParamList = {
  Chat: undefined;
  History: undefined;
  Settings: undefined;
};

// UI Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

// Storage Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: number;
  enableNotifications: boolean;
  biometricAuthEnabled: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: MistralMessage[];
  createdAt: string;
  updatedAt: string;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
