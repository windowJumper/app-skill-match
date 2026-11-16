import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';

type StateProps = {
  kind: 'loading' | 'empty' | 'error' | 'offline';
  title: string;
  message: string;
  onRetry?: () => void;
};

export function AppState({ kind, title, message, onRetry }: StateProps) {
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;
  return (
    <View style={styles.container}>
      {kind === 'loading' ? <ActivityIndicator size="large" color={Brand.primary} accessibilityLabel={title} /> : null}
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.message, { color: palette.muted }]}>{message}</Text>
      {kind !== 'loading' && onRetry ? (
        <Pressable accessibilityRole="button" style={[styles.button, { borderColor: Brand.primary }]} onPress={onRetry}>
          <Text style={[styles.buttonText, { color: Brand.primary }]}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, minHeight: 220 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 16, marginBottom: 8 },
  message: { fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 340 },
  button: { minWidth: 112, minHeight: 44, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 18, paddingHorizontal: 18 },
  buttonText: { fontSize: 14, fontWeight: '700' },
});
