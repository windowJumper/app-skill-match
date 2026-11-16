import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AppState } from '@/components/app-state';
import { Brand } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSupabaseClient } from '@/lib/supabase';
import { isOfflineError, userFacingError } from '@/lib/errors';

const supportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL;
const websiteUrl = process.env.EXPO_PUBLIC_WEBSITE_URL;

export default function SettingsScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [failedAction, setFailedAction] = useState<'load' | 'logout' | 'delete' | null>(null);
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setError('');
    setFailedAction(null);
    try {
      const { data, error: accountError } = await getSupabaseClient().auth.getUser();
      if (accountError) throw accountError;
      if (!data.user) throw new Error('Sign in to manage your account.');
      setEmail(data.user.email ?? '');
    } catch (cause) {
      setFailedAction('load');
      setError(userFacingError(cause, 'We could not load your account. Try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(loadAccount); }, [loadAccount]);

  async function logOut() {
    setBusy(true);
    setError('');
    setFailedAction(null);
    try {
      const { error: signOutError } = await getSupabaseClient().auth.signOut({ scope: 'local' });
      if (signOutError) throw signOutError;
      router.replace('/(auth)/login');
    } catch (cause) {
      setFailedAction('logout');
      setError(userFacingError(cause, 'We could not sign you out. Try again.'));
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    setBusy(true);
    setError('');
    setFailedAction(null);
    try {
      const { error: deletionError } = await getSupabaseClient().functions.invoke('delete-account');
      if (deletionError) throw deletionError;
      const { error: signOutError } = await getSupabaseClient().auth.signOut({ scope: 'local' });
      if (signOutError) throw signOutError;
      router.replace('/');
    } catch (cause) {
      setFailedAction('delete');
      setError(userFacingError(cause, 'We could not delete your account. Try again or contact support.'));
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    Alert.alert('Delete account?', 'This will ask SkillMatch to remove your account and associated profile. This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete account', style: 'destructive', onPress: () => { void deleteAccount(); } },
    ]);
  }

  async function openSupport() {
    if (!supportEmail) {
      setError('Add EXPO_PUBLIC_SUPPORT_EMAIL to your .env file to contact support.');
      return;
    }
    try {
      await Linking.openURL(`mailto:${supportEmail}`);
    } catch {
      setError('We could not open your email app.');
    }
  }

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind="loading" title="Loading settings" message="Checking your account." /></SafeAreaView>;
  if (error && !email) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind={isOfflineError(error) ? 'offline' : 'error'} title={isOfflineError(error) ? "You're offline" : 'Settings could not load'} message={isOfflineError(error) ? 'Check your connection and try again.' : error} onRetry={loadAccount} /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: palette.text }]}>Settings</Text>
        <Text style={[styles.label, { color: palette.muted }]}>Signed in as</Text>
        <Text style={[styles.value, { color: palette.text }]}>{email}</Text>
        <Link href="/terms" style={[styles.link, { color: Brand.primary }]}>Terms and Conditions</Link>
        <Link href="/privacy" style={[styles.link, { color: Brand.primary }]}>Privacy Policy</Link>
        {websiteUrl ? <Text style={[styles.value, { color: palette.muted }]}>Website: {websiteUrl}</Text> : null}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {failedAction ? <Pressable accessibilityRole="button" style={styles.retry} onPress={failedAction === 'load' ? loadAccount : failedAction === 'logout' ? logOut : confirmDelete} disabled={busy}><Text style={{ color: Brand.primary, fontWeight: '700' }}>Retry</Text></Pressable> : null}
        <Pressable accessibilityRole="button" onPress={openSupport} style={[styles.outline, { borderColor: palette.border }]}><Text style={{ color: palette.text }}>Contact support</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={logOut} disabled={busy} style={[styles.outline, { borderColor: palette.border }]}><Text style={{ color: palette.text }}>{busy ? 'Please wait...' : 'Log out'}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Delete account" onPress={confirmDelete} disabled={busy} style={styles.deleteButton}><Text style={styles.deleteText}>Delete account</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: 24, gap: 10 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  value: { fontSize: 15, marginBottom: 4 },
  link: { minHeight: 48, textAlignVertical: 'center', fontSize: 15, fontWeight: '700' },
  error: { color: '#B91C1C', lineHeight: 21, marginVertical: 8 },
  retry: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  outline: { minHeight: 48, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  deleteButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  deleteText: { color: '#B91C1C', fontSize: 15, fontWeight: '700' },
});
