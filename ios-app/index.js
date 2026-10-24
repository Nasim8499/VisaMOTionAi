import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// For React Native CLI
AppRegistry.registerComponent(appName, () => App);

// For Expo
import { registerRootComponent } from 'expo';
registerRootComponent(App);
