import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './navigators/AppNavigator';
import { useTheme } from './hooks/useTheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from './theme/colors';

const AppWrapper: React.FC = () => {
  const { theme, themeType } = useTheme();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar
          barStyle={themeType === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
          translucent={false}
        />
        <AppNavigator />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

// For React Native CLI
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

// Register the app
AppRegistry.registerComponent(appName, () => AppWrapper);

export default AppWrapper;
