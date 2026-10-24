import React, { useCallback, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Text, TouchableOpacity } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useWebView } from '../hooks/useWebView';
import { APP_CONFIG } from '../utils/config';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface WebViewContainerProps {
  url: string;
  onMessage?: (message: any) => void;
  onNavigationChange?: (url: string) => void;
  showNavigation?: boolean;
}

const INJECTED_JAVASCRIPT = `
  (function() {
    // Override console methods to use native logging
    const originalConsole = window.console;
    window.console = {
      ...originalConsole,
      log: function(...args) {
        originalConsole.log(...args);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'console',
          level: 'log',
          args: args.map(arg => {
            if (typeof arg === 'object') {
              return JSON.stringify(arg);
            }
            return String(arg);
          })
        }));
      },
      error: function(...args) {
        originalConsole.error(...args);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'console',
          level: 'error',
          args: args.map(arg => String(arg))
        }));
      },
      warn: function(...args) {
        originalConsole.warn(...args);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'console',
          level: 'warn',
          args: args.map(arg => String(arg))
        }));
      }
    };

    // Inject custom CSS for mobile
    const style = document.createElement('style');
    style.innerHTML = `
      @media (max-width: 768px) {
        body {
          font-size: 16px !important;
        }
        .mobile-hide {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Set viewport for mobile
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    // Notify native that webview is loaded
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'webview_loaded',
      data: { loaded: true }
    }));
  })();
`;

const WebViewContainer: React.FC<WebViewContainerProps> = ({
  url,
  onMessage,
  onNavigationChange,
  showNavigation = true,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      onMessage?.(message);
    } catch (error) {
      console.error('Error parsing webview message:', error);
    }
  }, [onMessage]);

  const handleNavigationStateChange = useCallback((navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    onNavigationChange?.(navState.url);
  }, [onNavigationChange]);

  const handleLoadProgress = useCallback((event: any) => {
    setProgress(event.nativeEvent.progress);
  }, []);

  const goBack = useCallback(() => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  }, [canGoBack]);

  const goForward = useCallback(() => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  }, [canGoForward]);

  const reload = useCallback(() => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Navigation Bar */}
      {showNavigation && (
        <View style={[styles.navigationBar, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
              onPress={goBack}
              disabled={!canGoBack}
            >
              <Icon name="arrow-back" size={24} color={!canGoBack ? colors.gray[400] : theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
              onPress={goForward}
              disabled={!canGoForward}
            >
              <Icon name="arrow-forward" size={24} color={!canGoForward ? colors.gray[400] : theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={reload}>
              <Icon name="refresh" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* WebView */}
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={[styles.webview, { backgroundColor: theme.colors.background }]}
          onMessage={handleMessage}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadProgress={handleLoadProgress}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          scalesPageToFit={true}
          mixedContentMode="always"
          originWhitelist={['*']}
          injectedJavaScript={INJECTED_JAVASCRIPT}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
          }}
          renderLoading={() => (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              {progress > 0 && progress < 1 && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
              )}
            </View>
          )}
        />
      </View>

      {/* Loading indicator for iOS */}
      {Platform.OS === 'ios' && progress > 0 && progress < 1 && (
        <View style={[styles.progressBarContainer, { top: insets.top + (showNavigation ? 50 : 0) }]}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    opacity: 0.7,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  webviewContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.mistral.primary,
    borderRadius: 2,
  },
  progressBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.gray[200],
    zIndex: 1000,
  },
});

export default WebViewContainer;
