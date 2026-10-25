import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useMistral } from '../hooks/useMistral';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { storageService } from '../services/storage';
import { ChatConversation, MistralMessage } from '../types';
import { nanoid } from 'nanoid';

interface MessageBubbleProps {
  message: MistralMessage;
  isUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.messageContainer, { 
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      marginRight: isUser ? 0 : 60,
      marginLeft: isUser ? 60 : 0,
    }]}>
      <View style={[styles.messageBubble, {
        backgroundColor: isUser ? theme.colors.primary : theme.colors.surface,
        borderTopLeftRadius: isUser ? 16 : 0,
        borderTopRightRadius: isUser ? 0 : 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
      }]}>
        <Text style={[styles.messageText, {
          color: isUser ? '#FFFFFF' : theme.colors.text,
        }]}>
          {message.content}
        </Text>
      </View>
      <View style={[styles.messageMeta, { alignSelf: isUser ? 'flex-end' : 'flex-start' }]}>
        <Text style={[styles.messageTime, { color: theme.colors.textSecondary }]}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {isUser && (
          <View style={[styles.messageStatus, { marginLeft: 8 }]}>
            <Icon name="check" size={14} color={colors.success[500]} />
          </View>
        )}
      </View>
    </View>
  );
};

interface ChatScreenProps {
  conversationId?: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ conversationId }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<MistralMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('New Chat');
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { sendStreamMessage, error, clearMessages } = useMistral({});

  // Load conversation
  useEffect(() => {
    const loadConversation = async () => {
      if (conversationId) {
        const conversations = await storageService.getAllConversations();
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
          setMessages(conversation.messages);
          setConversationTitle(conversation.title);
        }
      }
    };
    loadConversation();
  }, [conversationId]);

  // Save conversation
  useEffect(() => {
    const saveConversation = async () => {
      if (messages.length > 0) {
        const newConversation: ChatConversation = {
          id: conversationId || nanoid(),
          title: conversationTitle,
          messages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await storageService.saveConversation(newConversation);
        if (!conversationId) {
          // Update the ID after first save
        }
      }
    };
    
    const debounceTimer = setTimeout(saveConversation, 500);
    return () => clearTimeout(debounceTimer);
  }, [messages, conversationTitle, conversationId]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: MistralMessage = {
      role: 'user',
      content: inputText.trim(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Send to Mistral AI
      const chunks: string[] = [];
      
      await sendStreamMessage(inputText.trim(), (chunk) => {
        chunks.push(chunk);
        // Update assistant message in real-time
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          
          // Find the last assistant message or create one
          let assistantIndex = updated.findLastIndex(m => m.role === 'assistant');
          
          if (assistantIndex === -1) {
            // Add new assistant message
            updated.push({ role: 'assistant', content: chunk });
          } else {
            // Update existing assistant message
            updated[assistantIndex] = {
              ...updated[assistantIndex],
              content: updated[assistantIndex].content + chunk,
            };
          }
          return updated;
        });
      });

      // Update the final assistant message
      setMessages(prev => {
        const updated = [...prev];
        const assistantIndex = updated.findLastIndex(m => m.role === 'assistant');
        if (assistantIndex !== -1) {
          updated[assistantIndex] = {
            ...updated[assistantIndex],
            content: chunks.join(''),
          };
        }
        return updated;
      });

    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  }, [inputText, loading, sendStreamMessage]);

  const handleNewChat = useCallback(() => {
    clearMessages();
    setMessages([]);
    setInputText('');
    setConversationTitle('New Chat');
  }, [clearMessages]);

  const handleMenuPress = useCallback(() => {
    // Open drawer or navigation menu
  }, []);

  const handleSettingsPress = useCallback(() => {
    // Navigate to settings
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.background,
      paddingTop: insets.top,
    }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface,
        borderBottomColor: theme.colors.border,
      }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerButton} onPress={handleMenuPress}>
            <Icon name="menu" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {conversationTitle}
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {messages.length > 0 ? `${messages.length} messages` : 'Start a new conversation'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleNewChat}>
            <Icon name="add" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleSettingsPress}>
            <Icon name="settings" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <View style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.emptyStateIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="chat" size={48} color={theme.colors.primary} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
              Welcome to VisaMOTionAi
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
              Start a conversation with Mistral AI
            </Text>
            <View style={styles.emptyStateSuggestions}>
              {['Tell me a joke', 'Explain quantum computing', 'Write a poem', 'Help me code'].map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => setInputText(suggestion)}
                >
                  <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={[styles.messagesContent, { 
              paddingBottom: 20,
            }]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message, index) => (
              <MessageBubble
                key={`${message.role}-${index}`}
                message={message}
                isUser={message.role === 'user'}
              />
            ))}
            {loading && (
              <View style={[styles.loadingIndicator, { alignSelf: 'flex-start' }]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
                  Thinking...
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 70 : 0}
        style={styles.inputContainer}
      >
        <View style={[styles.inputWrapper, { 
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, 16),
        }]}>
          <View style={[styles.inputBox, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity style={styles.inputIcon}>
              <Icon name="attachment" size={24} color={colors.gray[500]} />
            </TouchableOpacity>
            <View style={styles.textInputContainer}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.textInputScroll}
              >
                <Text style={[styles.inputText, { color: theme.colors.text }]}>
                  {inputText || 'Type a message...'}
                </Text>
              </ScrollView>
            </View>
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Error Display */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
          <Icon name="error-outline" size={20} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        </View>
      )}
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    opacity: 0.7,
  },
  headerTitleContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  messageStatus: {
    flexDirection: 'row',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyStateSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  suggestionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  suggestionText: {
    fontSize: 14,
  },
  inputContainer: {
    flex: 0,
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    minHeight: 48,
  },
  inputIcon: {
    padding: 8,
    opacity: 0.6,
  },
  textInputContainer: {
    flex: 1,
    marginHorizontal: 8,
    maxHeight: 120,
  },
  textInputScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    includeFontPadding: false,
  },
  sendButton: {
    padding: 8,
    backgroundColor: colors.mistral.primary,
    borderRadius: 20,
    opacity: 0.9,
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default ChatScreen;
