const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// react-native-agora Expo Go ile uyumsuz (TurboModule kaydı gerektirir).
// Metro stub dosyasına yönlendir; asıl Agora yüklemesi useAgoraLive.ts
// içinde NativeModules.AgoraRtcNg kontrolü ile runtime'da yapılır.
// Development build'de NativeModules.AgoraRtcNg mevcut olacağından
// useAgoraLive.ts gerçek modülü doğrudan require ile yükler.
config.resolver = config.resolver ?? {};
const upstream = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-agora') {
    return {
      filePath: path.resolve(__dirname, 'lib/agora-stub.js'),
      type: 'sourceFile',
    };
  }
  if (upstream) return upstream(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
