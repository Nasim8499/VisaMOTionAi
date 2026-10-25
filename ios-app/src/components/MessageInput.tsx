import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  TextInputProps,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showAttachmentOptions?: boolean;
  onImageSelect?: (uri: string, type: string, name: string) => void;
  onFileSelect?: (uri: string, type: string, name: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  disabled = false,
  placeholder = 'Type a message...',
  showAttachmentOptions = true,
  onImageSelect,
  onFileSelect,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isFocused, setIsFocused] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
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
        includeBase64: false,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri && asset.type && asset.fileName) {
          onImageSelect?.(asset.uri, asset.type, asset.fileName || 'image');
        }
      }
      setShowAttachments(false);
    } catch (error) {
      console.error('Error picking image:', error);
    }
  }, [onImageSelect]);

  const handleCameraPick = useCallback(async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri && asset.type && asset.fileName) {
          onImageSelect?.(asset.uri, asset.type, asset.fileName || 'image');
        }
      }
      setShowAttachments(false);
    } catch (error) {
      console.error('Error capturing image:', error);
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
      setShowAttachments(false);
    } catch (error) {
      if (DocumentPicker.isCancelError(error)) {
        // User cancelled
      } else {
        console.error('Error picking file:', error);
      }
    }
  }, [onFileSelect]);

  const toggleAttachments = useCallback(() => {
    setShowAttachments(prev => !prev);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 70 : 0}
      style={styles.keyboardAvoidingView}
    >
      <View style={[styles.container, { 
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        paddingBottom: Math.max(insets.bottom, 16),
      }]}>
        {/* Attachment Options */}
        {showAttachments && (
          <View style={[styles.attachmentsContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.attachmentsRow}>
              <TouchableOpacity style={styles.attachmentOption} onPress={handleCameraPick}>
                <View style={[styles.attachmentIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name="camera-alt" size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.attachmentLabel, { color: theme.colors.text }]}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachmentOption} onPress={handleImagePick}>
                <View style={[styles.attachmentIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                  <Icon name="image" size={24} color={theme.colors.secondary} />
                </View>
                <Text style={[styles.attachmentLabel, { color: theme.colors.text }]}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachmentOption} onPress={handleFilePick}>
                <View style={[styles.attachmentIcon, { backgroundColor: colors.info[500] + '20' }]}>
                  <Icon name="insert-drive-file" size={24} color={colors.info[500]} />
                </View>
                <Text style={[styles.attachmentLabel, { color: theme.colors.text }]}>File</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main Input */}
        <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
          {showAttachmentOptions && (
            <TouchableOpacity style={styles.attachmentButton} onPress={toggleAttachments}>
              <Icon name="attachment" size={24} color={colors.gray[500]} />
            </TouchableOpacity>
          )}
          
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: theme.colors.text }]}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => {
              setIsFocused(true);
              setShowAttachments(false);
            }}
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
            <Icon name="send" size={20} color={!value.trim() || disabled ? colors.gray[400] : '#FFFFFF'} />
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
  attachmentsContainer: {
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
  },
  attachmentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  attachmentOption: {
    alignItems: 'center',
    padding: 8,
    minWidth: 80,
  },
  attachmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  attachmentLabel: {
    fontSize: 12,
    textAlign: 'center',
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
    includeFontPadding: false,
  },
  attachmentButton: {
    padding: 8,
    opacity: 0.6,
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
});

export default MessageInput;
