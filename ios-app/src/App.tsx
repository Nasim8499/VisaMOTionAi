import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'styled-components/native';
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
          style={themeType === 'dark' ? 'light' : 'dark'}
          backgroundColor={theme.colors.background}
          translucent={false}
        />
        <AppNavigator />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

// Export the app
import { registerRootComponent } from 'expo';

// For React Native CLI
import { AppRegistry } from 'react-native';
import { name as appName } from '../app.json';

// Create a styled components theme provider
const StyledApp: React.FC = () => {
  return <AppWrapper />;
};

// Register the app
if (Platform.OS === 'web') {
  // Web specific
} else {
  AppRegistry.registerComponent(appName, () => StyledApp);
}

export default StyledApp;
