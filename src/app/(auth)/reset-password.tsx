import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { AppState } from '@/components/app-state';
import { Brand } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { userFacingError } from '@/lib/errors';
import { getSupabaseClient } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { linkError } = useLocalSearchParams<{ linkError?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;

  const checkRecoverySession = useCallback(async () => {
    setLoading(true);
    try {
      if (linkError === '1') throw new Error('This reset link is incomplete or expired. Request another link.');
      const { data, error: sessionError } = await getSupabaseClient().auth.getSession();
      if (sessionError) throw sessionError;
      if (!data.session) throw new Error('This reset link is invalid or expired. Request another link.');
      setValidSession(true);
      setError('');
    } catch (cause) {
      setValidSession(false);
      setError(userFacingError(cause, cause instanceof Error ? cause.message : 'This reset link is invalid or expired. Request another link.'));
    } finally {
      setLoading(false);
    }
  }, [linkError]);

  useEffect(() => { void Promise.resolve().then(checkRecoverySession); }, [checkRecoverySession]);

  async function savePassword() {
    setError('');
    if (password.length < 8) {
      setError('Use at least 8 characters for your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await getSupabaseClient().auth.updateUser({ password });
      if (updateError) throw updateError;
      setComplete(true);
    } catch (cause) {
      setError(userFacingError(cause, 'We could not update your password. Try again.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind="loading" title="Checking reset link" message="Please wait." /></SafeAreaView>;
  if (!validSession) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind="error" title="Reset link unavailable" message={error} onRetry={() => router.replace('/(auth)/forgot-password')} /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={[styles.brand, { color: Brand.primary }]}>{Brand.name}</Text>
            <Text style={[styles.title, { color: palette.text }]}>{complete ? 'Password updated' : 'Choose a new password'}</Text>
            {complete ? (
              <>
                <Text style={[styles.description, { color: palette.muted }]}>Your password has been changed. Sign in with your new password.</Text>
                <Pressable accessibilityRole="button" style={[styles.button, { backgroundColor: Brand.primary }]} onPress={() => router.replace('/(auth)/login')}><Text style={styles.buttonText}>Go to login</Text></Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.label, { color: palette.text }]}>New password</Text>
                <TextInput accessibilityLabel="New password" style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" editable={!saving} />
                <Text style={[styles.label, { color: palette.text }]}>Confirm new password</Text>
                <TextInput accessibilityLabel="Confirm new password" style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" editable={!saving} />
                {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
                {error ? <Pressable accessibilityRole="button" style={styles.retry} onPress={savePassword} disabled={saving}><Text style={{ color: Brand.primary, fontWeight: '700' }}>Retry</Text></Pressable> : null}
                <Pressable accessibilityRole="button" style={[styles.button, { backgroundColor: Brand.primary }]} onPress={savePassword} disabled={saving}>
                  {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Update password</Text>}
                </Pressable>
                <Link href="/(auth)/login" style={[styles.link, { color: Brand.primary }]}>Return to login</Link>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  brand: { fontSize: 20, fontWeight: '800', marginBottom: 32, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 18 },
  description: { fontSize: 15, lineHeight: 23, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  input: { height: 52, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 16 },
  error: { color: '#B91C1C', fontSize: 14, lineHeight: 20, marginTop: 12 },
  retry: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  button: { minHeight: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  link: { minHeight: 48, textAlign: 'center', textAlignVertical: 'center', fontSize: 15, fontWeight: '700', marginTop: 8 },
});
