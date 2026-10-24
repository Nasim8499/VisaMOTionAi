import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { colors } from '../theme/colors';
import { APP_CONFIG } from '../utils/config';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <View style={styles.logo}>
            <Text style={[styles.logoText, { color: theme.colors.primary }]}>
              {APP_CONFIG.appName}
            </Text>
          </View>
        </View>

        {/* Loading indicator */}
        <ActivityIndicator
          size={Platform.OS === 'ios' ? 'large' : 48}
          color={theme.colors.primary}
          style={styles.loader}
        />

        {/* App description */}
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {APP_CONFIG.appDescription}
        </Text>

        {/* Version */}
        <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
          v{APP_CONFIG.appVersion}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    padding: 32,
    borderRadius: 32,
    marginBottom: 40,
    shadowColor: colors.mistral.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  loader: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    maxWidth: '80%',
  },
  version: {
    fontSize: 12,
    opacity: 0.6,
  },
});

export default SplashScreen;
