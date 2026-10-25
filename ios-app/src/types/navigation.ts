import { ChatConversation } from './index';

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  Home: undefined;
  Chat: { conversationId?: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};

export declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
