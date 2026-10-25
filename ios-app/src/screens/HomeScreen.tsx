import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { storageService } from '../services/storage';
import { ChatConversation } from '../types';
import { nanoid } from 'nanoid';
import { RootStackParamList } from '../types';

interface ConversationItemProps {
  conversation: ChatConversation;
  onPress: () => void;
  onDelete: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onPress, onDelete }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.conversationLeft}>
        <View style={[styles.conversationIcon, { backgroundColor: theme.colors.primary + '20' }]}>
          <Icon name="chat" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.conversationInfo}>
          <Text style={[styles.conversationTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {conversation.title}
          </Text>
          <Text style={[styles.conversationPreview, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {conversation.messages.length > 0 ? 
              conversation.messages[conversation.messages.length - 1].content.slice(0, 50) + '...' : 
              'New conversation'}
          </Text>
          <Text style={[styles.conversationDate, { color: theme.colors.textSecondary }]}>
            {new Date(conversation.updatedAt).toLocaleDateString([], { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
      <View style={styles.conversationRight}>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Icon name="delete-outline" size={20} color={colors.gray[400]} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const convs = await storageService.getAllConversations();
      // Sort by updatedAt descending
      convs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const handleNewChat = useCallback(() => {
    const newId = nanoid();
    navigation.navigate('Chat', { conversationId: newId });
  }, [navigation]);

  const handleConversationPress = useCallback((conversationId: string) => {
    navigation.navigate('Chat', { conversationId });
  }, [navigation]);

  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    try {
      await storageService.deleteConversation(conversationId);
      await loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [loadConversations]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.background,
      paddingTop: insets.top,
    }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface,
        borderBottomColor: theme.colors.border,
        paddingTop: 16,
        paddingBottom: 12,
      }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Chats
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {conversations.length} conversations
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSettingsPress}>
            <Icon name="settings" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.emptyStateIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="chat-bubble-outline" size={64} color={theme.colors.primary} />
          </View>
          <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
            No conversations yet
          </Text>
          <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
            Start a new chat to begin
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              onPress={() => handleConversationPress(item.id)}
              onDelete={() => handleDeleteConversation(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      {/* New Chat Button */}
      <View style={[styles.newChatButtonContainer, { 
        paddingBottom: Math.max(insets.bottom, 20),
        paddingHorizontal: 20,
      }]}>
        <TouchableOpacity
          style={[styles.newChatButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleNewChat}
        >
          <Icon name="add" size={28} color="#FFFFFF" />
          <Text style={styles.newChatButtonText}>New Chat</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    opacity: 0.7,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  conversationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  conversationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  conversationPreview: {
    fontSize: 14,
    marginBottom: 2,
  },
  conversationDate: {
    fontSize: 12,
  },
  conversationRight: {
    paddingLeft: 12,
  },
  deleteButton: {
    padding: 8,
    opacity: 0.6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  newChatButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default HomeScreen;
