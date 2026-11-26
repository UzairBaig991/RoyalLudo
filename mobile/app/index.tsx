import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';

const LiveWebView = WebView as any;

function resolveServerGameUrl(): string {
  // 1. Prefer EXPO_PUBLIC_SOCKET_URL injected dynamically by scripts/start-mobile.mjs
  const envUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
  if (envUrl && envUrl.startsWith('http') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return `${envUrl.replace(/\/$/, '')}/play`;
  }
  // 2. Auto-detect PC LAN/Hotspot IP from Expo Metro hostUri (works even without env var!)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost ||
    '';
  const hostIp = hostUri.split(':')[0];
  if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
    return `http://${hostIp}:4000/play`;
  }
  return 'http://localhost:4000/play';
}

export default function RoyalLudoUnifiedScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const gameUrl = resolveServerGameUrl();

  const handleRetry = () => {
    setLoadError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {loadError ? (
        <View style={styles.errorBox}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>ROYAL LUDO</Text>
          <Text style={styles.errorText}>Could not reach game server at:</Text>
          <Text style={styles.urlText}>{gameUrl}</Text>
          <Text style={styles.hintText}>
            Make sure your PC is running npm run start:mobile (which starts port 4000 automatically) and Windows Firewall allows port 4000.
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleRetry} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>🔄 Retry Live Server</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>📱 Open Offline Native Mode</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.webWrap}>
          <LiveWebView
            key={reloadKey}
            ref={webViewRef}
            source={{ uri: gameUrl }}
            style={styles.webView}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            startInLoadingState={false}
            bounces={false}
            overScrollMode="never"
            onLoadEnd={() => setLoading(false)}
            onError={(e: any) => {
              setLoading(false);
              setLoadError(e?.nativeEvent?.description || 'Connection failed');
            }}
            onHttpError={(e: any) => {
              if (e?.nativeEvent?.statusCode >= 500) {
                setLoading(false);
                setLoadError(`Server HTTP ${e.nativeEvent.statusCode}`);
              }
            }}
          />

          {loading && (
            <View style={styles.loadingOverlay} pointerEvents="none">
              <Text style={styles.crown}>👑</Text>
              <Text style={styles.title}>ROYAL LUDO</Text>
              <ActivityIndicator size="large" color="#FFDF00" style={{ marginTop: 14 }} />
              <Text style={styles.loadingText}>Connecting to Royal Arena…</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#220322',
  },
  webWrap: {
    flex: 1,
    backgroundColor: '#220322',
  },
  webView: {
    flex: 1,
    backgroundColor: '#220322',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#220322',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  crown: {
    fontSize: 52,
    marginBottom: 8,
  },
  title: {
    color: '#FFDF00',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 2,
  },
  loadingText: {
    color: '#D9A0D7',
    fontSize: 13,
    marginTop: 10,
    fontWeight: '700',
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
  },
  urlText: {
    color: '#FFDF00',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 12,
  },
  hintText: {
    color: '#D9A0D7',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 22,
  },
  primaryBtn: {
    backgroundColor: '#2ECC71',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 14,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryBtn: {
    backgroundColor: '#521350',
    borderWidth: 1.5,
    borderColor: '#752273',
    paddingVertical: 11,
    paddingHorizontal: 26,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#FFDF00',
    fontSize: 13,
    fontWeight: '800',
  },
});
