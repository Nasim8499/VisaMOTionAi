import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Platform, BackHandler, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import WebViewContainer from '../components/WebViewContainer';
import ChatHeader from '../components/ChatHeader';
import { APP_CONFIG } from '../utils/config';
import { WebViewMessage } from '../types';
import { storageService } from '../services/storage';
import NetInfo from '@react-native-community/netinfo';

const MainScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setShowOffline(!state.isConnected);
    });

    // Check initial state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setShowOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Handle back button on Android
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // Show confirmation before exiting
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp(), style: 'destructive' },
          ]
        );
        return true;
      });

      return () => backHandler.remove();
    }
  }, []);

  const handleWebViewMessage = useCallback((message: WebViewMessage) => {
    console.log('WebView message:', message);
    
    switch (message.type) {
      case 'webview_loaded':
        console.log('WebView loaded successfully');
        break;
      case 'console':
        // Handle console messages from webview
        if (message.level === 'error') {
          console.error('WebView error:', ...(message.args || []));
        } else if (message.level === 'warn') {
          console.warn('WebView warning:', ...(message.args || []));
        } else {
          console.log('WebView log:', ...(message.args || []));
        }
        break;
      case 'navigate':
        // Handle navigation requests
        console.log('Navigation request:', message.data);
        break;
      case 'api_request':
        // Handle API requests from webview
        console.log('API request:', message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const handleNavigationChange = useCallback((url: string) => {
    console.log('Navigation changed to:', url);
  }, []);

  const handleMenuPress = useCallback(() => {
    // Open drawer or show menu
    console.log('Menu pressed');
  }, []);

  const handleSettingsPress = useCallback(() => {
    // Navigate to settings
    console.log('Settings pressed');
  }, []);

  const handleNewChatPress = useCallback(() => {
    // Start new chat
    console.log('New chat pressed');
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ChatHeader
        title={APP_CONFIG.appName}
        onMenuPress={handleMenuPress}
        onSettingsPress={handleSettingsPress}
        onNewChatPress={handleNewChatPress}
      />

      <View style={styles.content}>
        <WebViewContainer
          url={APP_CONFIG.webviewUrl}
          onMessage={handleWebViewMessage}
          onNavigationChange={handleNavigationChange}
          showNavigation={false}
        />
      </View>

      {/* Offline indicator */}
      {showOffline && (
        <View style={[styles.offlineIndicator, { backgroundColor: theme.colors.error }]}>
          <View style={styles.offlineContent}>
            <View style={[styles.offlineDot, { backgroundColor: theme.colors.surface }]} />
            <View style={styles.offlineTextContainer}>
              <View style={[styles.offlineText, { backgroundColor: theme.colors.surface }]} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  offlineIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  offlineTextContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  offlineText: {
    width: 100,
    height: 20,
    borderRadius: 10,
  },
});

export default MainScreen;
