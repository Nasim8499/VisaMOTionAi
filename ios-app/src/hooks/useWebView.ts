import { useState, useCallback, useRef } from 'react';
import { WebViewMessage, WebViewNavigationState } from '../types';
import { WebView } from 'react-native-webview';

interface UseWebViewProps {
  initialUrl: string;
  onMessage?: (message: WebViewMessage) => void;
  onNavigationStateChange?: (navState: WebViewNavigationState) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

export const useWebView = ({
  initialUrl,
  onMessage,
  onNavigationStateChange,
  onLoadStart,
  onLoadEnd,
  onError,
}: UseWebViewProps) => {
  const webViewRef = useRef<WebView>(null);
  const [url, setUrl] = useState(initialUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  const handleNavigationStateChange = useCallback((navState: WebViewNavigationState) => {
    setUrl(navState.url);
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setTitle(navState.title);
    onNavigationStateChange?.(navState);
  }, [onNavigationStateChange]);

  const handleMessage = useCallback((event: any) => {
    try {
      const message: WebViewMessage = JSON.parse(event.nativeEvent.data);
      onMessage?.(message);
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  }, [onMessage]);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

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

  const injectJavaScript = useCallback((script: string) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(script);
    }
  }, []);

  const postMessage = useCallback((message: WebViewMessage) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  }, []);

  return {
    webViewRef,
    url,
    canGoBack,
    canGoForward,
    loading,
    title,
    goBack,
    goForward,
    reload,
    injectJavaScript,
    postMessage,
    handlers: {
      onNavigationStateChange: handleNavigationStateChange,
      onMessage: handleMessage,
      onLoadStart: handleLoadStart,
      onLoadEnd: handleLoadEnd,
      onError,
    },
  };
};
