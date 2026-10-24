import React, { useState, useCallback, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TextInputProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  showAttachmentOptions?: boolean;
  onImageSelect?: (uri: string, type: string, name: string) => void;
  onFileSelect?: (uri: string, type: string, name: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  showAttachmentOptions = true,
  onImageSelect,
  onFileSelect,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = useCallback(() => {
    if (value.trim() && !disabled) {
      onSubmit(value);
      onChangeText('');
    }
  }, [value, disabled, onSubmit, onChangeText]);

  const handleImagePick = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri && asset.type && asset.fileName) {
          onImageSelect?.(asset.uri, asset.type, asset.fileName || 'image');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  }, [onImageSelect]);

  const handleFilePick = useCallback(async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      if (result && result.length > 0) {
        const file = result[0];
        if (file.uri && file.type && file.name) {
          onFileSelect?.(file.uri, file.type, file.name);
        }
      }
    } catch (error) {
      if (DocumentPicker.isCancelError(error)) {
        // User cancelled
      } else {
        console.error('Error picking file:', error);
      }
    }
  }, [onFileSelect]);

  const handleAttachmentPress = useCallback(() => {
    // Show attachment options
    // For now, just trigger image picker
    handleImagePick();
  }, [handleImagePick]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 60 : 0}
      style={styles.keyboardAvoidingView}
    >
      <View style={[styles.container, { 
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        paddingBottom: Math.max(insets.bottom, 16),
      }]}>
        <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
          {showAttachmentOptions && (
            <TouchableOpacity style={styles.attachmentButton} onPress={handleAttachmentPress}>
              <Icon name="attachment" size={24} color={colors.gray[500]} />
            </TouchableOpacity>
          )}
          
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: theme.colors.text }]}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            placeholderTextColor={colors.gray[400]}
            multiline
            blurOnSubmit={false}
            onSubmitEditing={handleSubmit}
            editable={!disabled}
            returnKeyType="send"
          />

          <TouchableOpacity
            style={[styles.sendButton, (!value.trim() || disabled) && styles.sendButtonDisabled]}
            onPress={handleSubmit}
            disabled={!value.trim() || disabled}
          >
            <Icon name="send" size={20} color={!value.trim() || disabled ? colors.gray[400] : colors.mistral.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.gray[100],
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    minHeight: 48,
  },
  inputContainerFocused: {
    backgroundColor: colors.gray[200],
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 8,
    maxHeight: 120,
  },
  attachmentButton: {
    padding: 8,
    opacity: 0.6,
  },
  sendButton: {
    padding: 8,
    backgroundColor: colors.mistral.primary + '20',
    borderRadius: 20,
    opacity: 0.8,
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
});

export default ChatInput;
