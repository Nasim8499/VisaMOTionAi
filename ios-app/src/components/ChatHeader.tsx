import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ChatHeaderProps {
  title: string;
  onMenuPress?: () => void;
  onSettingsPress?: () => void;
  onNewChatPress?: () => void;
  showMenu?: boolean;
  showSettings?: boolean;
  showNewChat?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  onMenuPress,
  onSettingsPress,
  onNewChatPress,
  showMenu = true,
  showSettings = true,
  showNewChat = true,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.surface,
      borderBottomColor: theme.colors.border,
      paddingTop: insets.top + 8,
      paddingBottom: 8,
    }]}>
      <View style={styles.leftContainer}>
        {showMenu && (
          <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
            <Icon name="menu" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {showNewChat && (
          <TouchableOpacity style={styles.iconButton} onPress={onNewChatPress}>
            <Icon name="add" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        {showSettings && (
          <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
            <Icon name="settings" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    opacity: 0.7,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
});

export default ChatHeader;
