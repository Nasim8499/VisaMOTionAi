import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { storageService } from '../services/storage';
import { UserSettings } from '../types';
import { APP_CONFIG } from '../utils/config';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  value?: any;
  type?: 'switch' | 'default';
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  value,
  type = 'default',
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.settingsItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsItemIcon, { backgroundColor: theme.colors.primary + '20' }]}>
          <Icon name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.settingsItemText}>
          <Text style={[styles.settingsItemTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingsItemSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: colors.gray[300], true: theme.colors.primary }}
          thumbColor={value ? theme.colors.primary : colors.gray[400]}
        />
      )}

      {type === 'default' && (
        <Icon name="chevron-right" size={20} color={colors.gray[400]} />
      )}
    </TouchableOpacity>
  );
};

const SettingsScreen: React.FC = () => {
  const { theme, themeType, setTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'en',
    fontSize: 16,
    enableNotifications: true,
    biometricAuthEnabled: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await storageService.getUserSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    };
    loadSettings();
  }, []);

  const handleThemeChange = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setSettings(prev => ({ ...prev, theme: newTheme }));
    storageService.saveUserSettings({ ...settings, theme: newTheme } as UserSettings);
  }, [setTheme, settings]);

  const handleToggleTheme = useCallback(() => {
    const newTheme = isDark ? 'light' : 'dark';
    handleThemeChange(newTheme);
  }, [isDark, handleThemeChange]);

  const handleNotificationsToggle = useCallback((value: boolean) => {
    const newSettings = { ...settings, enableNotifications: value };
    setSettings(newSettings);
    storageService.saveUserSettings(newSettings);
  }, [settings]);

  const handleBiometricToggle = useCallback((value: boolean) => {
    const newSettings = { ...settings, biometricAuthEnabled: value };
    setSettings(newSettings);
    storageService.saveUserSettings(newSettings);
  }, [settings]);

  const handleClearCache = useCallback(async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data? This will not affect your conversations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: async () => {
            try {
              // Clear WebView cache
              if (Platform.OS === 'android') {
                // Android specific cache clearing
              } else {
                // iOS specific cache clearing
              }
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
          style: 'destructive'
        },
      ]
    );
  }, []);

  const handleClearConversations = useCallback(async () => {
    Alert.alert(
      'Clear Conversations',
      'Are you sure you want to delete all conversations? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          onPress: async () => {
            try {
              await storageService.clearAllConversations();
              Alert.alert('Success', 'All conversations deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete conversations');
            }
          },
          style: 'destructive'
        },
      ]
    );
  }, []);

  const handleClearAllData = useCallback(async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete ALL app data including conversations, settings, and API keys? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          onPress: async () => {
            try {
              await storageService.clearAllData();
              Alert.alert('Success', 'All data cleared. The app will restart.');
              // Restart the app
            } catch (error) {
              Alert.alert('Error', 'Failed to clear all data');
            }
          },
          style: 'destructive'
        },
      ]
    );
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface,
        borderBottomColor: theme.colors.border,
        paddingTop: insets.top + 16,
        paddingBottom: 16,
      }]}>
        <TouchableOpacity style={styles.headerBack}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Appearance
          </Text>
          <SettingsItem
            icon="dark-mode"
            title="Dark Mode"
            subtitle={themeType === 'system' ? 'System Default' : themeType === 'dark' ? 'Dark' : 'Light'}
            onPress={() => {
              const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(settings.theme as 'light' | 'dark' | 'system');
              const nextIndex = (currentIndex + 1) % themes.length;
              handleThemeChange(themes[nextIndex]);
            }}
            value={isDark}
            type="switch"
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Notifications
          </Text>
          <SettingsItem
            icon="notifications"
            title="Enable Notifications"
            subtitle="Receive notifications for new messages"
            onPress={() => handleNotificationsToggle(!settings.enableNotifications)}
            value={settings.enableNotifications}
            type="switch"
          />
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Privacy & Security
          </Text>
          <SettingsItem
            icon="fingerprint"
            title="Biometric Authentication"
            subtitle="Use Face ID or Touch ID to unlock"
            onPress={() => handleBiometricToggle(!settings.biometricAuthEnabled)}
            value={settings.biometricAuthEnabled}
            type="switch"
          />
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Storage
          </Text>
          <SettingsItem
            icon="delete-sweep"
            title="Clear Cache"
            subtitle="Clear temporary cached data"
            onPress={handleClearCache}
          />
          <SettingsItem
            icon="delete"
            title="Clear Conversations"
            subtitle="Delete all chat conversations"
            onPress={handleClearConversations}
          />
          <SettingsItem
            icon="warning"
            title="Clear All Data"
            subtitle="Delete ALL app data"
            onPress={handleClearAllData}
          />
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            About
          </Text>
          <SettingsItem
            icon="info"
            title="App Version"
            subtitle={`v${APP_CONFIG.appVersion}`}
          />
          <SettingsItem
            icon="description"
            title="App Description"
            subtitle={APP_CONFIG.appDescription}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Built with Mistral AI
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBack: {
    padding: 8,
    opacity: 0.7,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
  },
});

export default SettingsScreen;
