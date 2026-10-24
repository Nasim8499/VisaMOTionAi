# VisaMOTionAi - iOS Mobile App

A fully-featured iOS mobile application built with React Native that embeds the NextChat web interface with Mistral AI integration.

## Features

- **WebView Integration**: Embed NextChat web interface for seamless chat experience
- **Mistral AI Agent**: Full integration with Mistral AI API
- **Native Features**: Camera, file picker, share, notifications
- **Theme Support**: Light, dark, and system theme modes
- **Offline Support**: Local conversation storage
- **Push Notifications**: OneSignal integration for push notifications
- **Deep Linking**: Support for deep links
- **Biometric Authentication**: Face ID and Touch ID support

## Getting Started

### Prerequisites

- Node.js >= 18
- Yarn or npm
- Xcode >= 15.0 (for iOS development)
- CocoaPods >= 1.12.0
- iOS Simulator or physical device

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nasim8499/VisaMOTionAi.git
   cd VisaMOTionAi/ios-app
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Install CocoaPods dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MISTRAL_API_KEY=your_mistral_api_key_here
   MISTRAL_API_URL=https://api.mistral.ai/v1
   WEBVIEW_URL=https://app.nextchat.club
   ONESIGNAL_APP_ID=your_onesignal_app_id_here
   ```

5. **Run the app**
   
   **iOS Simulator:**
   ```bash
   npx react-native run-ios
   ```
   
   **Physical iOS Device:**
   ```bash
   npx react-native run-ios --device "Your Device Name"
   ```

## Project Structure

```
ios-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ChatHeader.tsx
│   │   ├── ChatInput.tsx
│   │   └── WebViewContainer.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useMistral.ts
│   │   ├── useTheme.ts
│   │   └── useWebView.ts
│   ├── navigators/         # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/            # App screens
│   │   ├── MainScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── services/           # API and business logic services
│   │   ├── mistral.ts
│   │   └── storage.ts
│   ├── store/              # State management
│   ├── theme/             # Theme and styling
│   │   ├── colors.ts
│   │   └── index.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── utils/             # Utility functions
│       ├── config.ts
│       └── ...
├── ios/                  # iOS native code
│   ├── VisaMOTionAi/     # Xcode project
│   │   ├── Resources/
│   │   │   └── Info.plist
│   │   ├── Supporting/
│   │   │   └── LaunchScreen.storyboard
│   │   ├── Images.xcassets/
│   │   │   ├── AppIcon.appiconset/
│   │   │   └── LaunchScreen.imageset/
│   │   └── VisaMOTionAi.entitlements
│   ├── Podfile
│   └── VisaMOTionAi.xcworkspace/
├── app.json             # Expo configuration
├── package.json
├── tsconfig.json
└── babel.config.js
```

## Configuration

### App Configuration

Edit `app.json` to configure:
- App name and display name
- Bundle identifier
- Version and build numbers
- Permissions
- iOS and Android specific settings

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MISTRAL_API_KEY` | Your Mistral AI API key | Yes |
| `MISTRAL_API_URL` | Mistral AI API endpoint | No (default: https://api.mistral.ai/v1) |
| `WEBVIEW_URL` | URL for the WebView | No (default: https://app.nextchat.club) |
| `ONESIGNAL_APP_ID` | OneSignal app ID for push notifications | No |
| `ENABLE_CAMERA` | Enable camera functionality | No (default: true) |
| `ENABLE_FILE_PICKER` | Enable file picker | No (default: true) |
| `ENABLE_SHARE` | Enable share functionality | No (default: true) |
| `ENABLE_NOTIFICATIONS` | Enable notifications | No (default: true) |
| `ENABLE_BIOMETRIC_AUTH` | Enable biometric authentication | No (default: false) |

### iOS Configuration

Edit `ios/VisaMOTionAi/Resources/Info.plist` to configure:
- App permissions
- Background modes
- App transport security
- Deep linking
- Associated domains

## Building for Production

### iOS App Store Build

1. **Configure App Store metadata**
   - Open the Xcode project: `ios/VisaMOTionAi.xcworkspace`
   - Configure signing and provisioning profiles
   - Update app icons and launch screens

2. **Archive the app**
   ```bash
   cd ios
   xcodebuild archive -workspace VisaMOTionAi.xcworkspace -scheme VisaMOTionAi -archivePath $PWD/build/VisaMOTionAi.xcarchive
   ```

3. **Upload to App Store Connect**
   ```bash
   xcodebuild -exportArchive -archivePath $PWD/build/VisaMOTionAi.xcarchive -exportPath $PWD/build -exportOptionsPlist ExportOptions.plist
   ```

### Android Build (Future)

```bash
npx react-native run-android --variant=release
```

## API Integration

### Mistral AI API

The app integrates with Mistral AI API for:
- Chat completions (streaming and non-streaming)
- Model listing
- Model details

Example usage:

```typescript
import { mistralService } from './services/mistral';

// List available models
const models = await mistralService.listModels();

// Send chat completion
const response = await mistralService.chatCompletion({
  model: 'mistral-tiny',
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
  temperature: 0.7,
  max_tokens: 4096,
});

// Stream chat completion
const generator = mistralService.streamChatCompletion({
  model: 'mistral-tiny',
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
});

for await (const chunk of generator) {
  console.log('Chunk:', chunk);
}
```

## Native Features

### Camera
Access the device camera to take photos:

```typescript
import { launchCamera } from 'react-native-image-picker';

const result = await launchCamera({
  mediaType: 'photo',
  quality: 0.8,
});
```

### File Picker
Pick files from the device:

```typescript
import DocumentPicker from 'react-native-document-picker';

const result = await DocumentPicker.pick({
  type: [DocumentPicker.types.allFiles],
});
```

### Share
Share content with other apps:

```typescript
import { Share } from 'react-native';

await Share.share({
  message: 'Check out VisaMOTionAi!',
  url: 'https://visamotionai.com',
});
```

### Notifications
Receive push notifications:

```typescript
import OneSignal from 'react-native-onesignal';

OneSignal.setAppId('YOUR_ONESIGNAL_APP_ID');
OneSignal.setNotificationWillShowInForegroundHandler(notification => {
  // Handle foreground notifications
});
```

## Theming

The app supports light, dark, and system theme modes:

```typescript
import { useTheme } from './hooks/useTheme';

const { theme, themeType, isDark, toggleTheme, setTheme } = useTheme();

// theme.colors.primary
// theme.colors.background
// theme.colors.text
```

## Navigation

The app uses React Navigation for navigation:

```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

// Navigate to a screen
navigation.navigate('Settings');

// Go back
navigation.goBack();
```

## Storage

Local storage using AsyncStorage:

```typescript
import { storageService } from './services/storage';

// Save user settings
await storageService.saveUserSettings({ theme: 'dark' });

// Get user settings
const settings = await storageService.getUserSettings();

// Save conversation
await storageService.saveConversation(conversation);

// Get all conversations
const conversations = await storageService.getAllConversations();
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the project maintainers.

## Acknowledgments

- Built with React Native
- Powered by Mistral AI
- Inspired by NextChat
