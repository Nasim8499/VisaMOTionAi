import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList, MainTabParamList } from '../types';
import SplashScreen from '../screens/SplashScreen';
import MainScreen from '../screens/MainScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { APP_CONFIG } from '../utils/config';
import { storageService } from '../services/storage';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Icons
const TabIcons: Record<keyof MainTabParamList, { active: string; inactive: string }> = {
  Chat: { active: 'chat', inactive: 'chat-bubble-outline' },
  History: { active: 'history', inactive: 'history' },
  Settings: { active: 'settings', inactive: 'settings' },
};

// Tab Bar Component
const TabBar: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { 
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.border,
      paddingBottom: Math.max(insets.bottom, 16),
    }]}>
      {/* This will be replaced by the actual tab bar */}
    </View>
  );
};

// Tab Navigator
const MainTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TabIcons[route.name as keyof MainTabParamList];
          return (
            <Icon
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false,
      })}
      initialRouteName="Chat"
    >
      <Tab.Screen
        name="Chat"
        component={MainScreen}
        options={{ title: 'Chat' }}
      />
      <Tab.Screen
        name="History"
        component={MainScreen} // Placeholder, replace with actual History screen
        options={{ title: 'History' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Deep Link Handler
const useDeepLinkHandler = () => {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log('Deep link URL:', url);

      // Handle deep links
      if (url.includes('chat/')) {
        const conversationId = url.split('chat/')[1];
        navigationRef?.navigate('Main', {
          screen: 'Chat',
          params: { conversationId },
        });
      } else if (url.includes('settings')) {
        navigationRef?.navigate('Main', {
          screen: 'Settings',
        });
      }
    };

    // Check initial URL
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for incoming deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => subscription.remove();
  }, [navigationRef]);
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const { theme } = useTheme();

  useDeepLinkHandler();

  useEffect(() => {
    // Check if we should show splash
    const checkSplash = async () => {
      // Simulate initialization
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsReady(true);
    };

    checkSplash();
  }, []);

  const handleSplashFinish = useCallback(() => {
    setIsSplashVisible(false);
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingIndicator} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
        initialRouteName="Splash"
      >
        {isSplashVisible ? (
          <Stack.Screen
            name="Splash"
            component={() => <SplashScreen onFinish={handleSplashFinish} />}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat"
              component={MainScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Auth"
              component={MainScreen} // Placeholder
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mistral.primary + '30',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default AppNavigator;
