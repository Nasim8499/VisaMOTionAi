import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, ChatConversation } from '../types';

const STORAGE_KEYS = {
  USER_SETTINGS: '@visamotionai_user_settings',
  CHAT_CONVERSATIONS: '@visamotionai_chat_conversations',
  API_KEY: '@visamotionai_api_key',
  AUTH_TOKEN: '@visamotionai_auth_token',
};

export const storageService = {
  // User Settings
  async getUserSettings(): Promise<UserSettings | null> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error getting user settings:', error);
      return null;
    }
  },

  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  },

  async updateUserSettings(updates: Partial<UserSettings>): Promise<void> {
    try {
      const currentSettings = await this.getUserSettings();
      const newSettings = { ...currentSettings, ...updates };
      await this.saveUserSettings(newSettings as UserSettings);
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  },

  // Chat Conversations
  async getAllConversations(): Promise<ChatConversation[]> {
    try {
      const conversations = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_CONVERSATIONS);
      return conversations ? JSON.parse(conversations) : [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  },

  async saveConversation(conversation: ChatConversation): Promise<void> {
    try {
      const conversations = await this.getAllConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      let updatedConversations;
      if (existingIndex >= 0) {
        updatedConversations = [...conversations];
        updatedConversations[existingIndex] = conversation;
      } else {
        updatedConversations = [...conversations, conversation];
      }
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.CHAT_CONVERSATIONS,
        JSON.stringify(updatedConversations)
      );
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  },

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const conversations = await this.getAllConversations();
      const filteredConversations = conversations.filter(c => c.id !== conversationId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.CHAT_CONVERSATIONS,
        JSON.stringify(filteredConversations)
      );
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  },

  async clearAllConversations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_CONVERSATIONS);
    } catch (error) {
      console.error('Error clearing conversations:', error);
    }
  },

  // API Key
  async getApiKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  },

  async saveApiKey(apiKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  },

  async deleteApiKey(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.API_KEY);
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  },

  // Auth Token
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  },

  async deleteAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error deleting auth token:', error);
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(
        Object.values(STORAGE_KEYS)
      );
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  },
};
