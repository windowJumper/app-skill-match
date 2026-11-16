import { useState } from 'react';
import { Link } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Brand } from '@/constants/brand';
import { getSupabaseClient } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { userFacingError } from '@/lib/errors';
import * as Linking from 'expo-linking';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;

  async function sendResetLink() {
    const normalizedEmail = email.trim().toLowerCase();
    setError('');
    setSent(false);
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const websiteUrl = process.env.EXPO_PUBLIC_WEBSITE_URL;
      const redirectTo = websiteUrl
        ? `${websiteUrl.replace(/\/$/, '')}/reset-password`
        : Linking.createURL('reset-password');
      const { error: resetError } = await getSupabaseClient().auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
      if (resetError) throw resetError;
      setSent(true);
    } catch (cause) {
      setError(userFacingError(cause, 'We could not send the link. Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={[styles.brand, { color: Brand.primary }]}>{Brand.name}</Text>
            <Text style={[styles.title, { color: palette.text }]}>Reset your password</Text>
            <Text style={[styles.description, { color: palette.muted }]}>Enter the email address on your account. We will send a password reset link if the account can receive email.</Text>
            <Text style={[styles.label, { color: palette.text }]}>Email address</Text>
            <TextInput
              accessibilityLabel="Email address"
              style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.surface }]}
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={palette.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {sent ? <Text accessibilityRole="alert" style={[styles.success, { color: Brand.accent }]}>If the account can receive email, a reset link is on its way.</Text> : null}
            {error ? <Pressable accessibilityRole="button" style={styles.retry} onPress={sendResetLink} disabled={loading}><Text style={{ color: Brand.primary }}>Retry</Text></Pressable> : null}
            <Pressable accessibilityRole="button" style={[styles.button, { backgroundColor: Brand.primary }]} onPress={sendResetLink} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Send reset link</Text>}
            </Pressable>
            <Link href="/(auth)/login" style={[styles.link, { color: Brand.primary }]}>Return to login</Link>
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
  brand: { fontSize: 20, fontWeight: '800', marginBottom: 36, textAlign: 'center' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800', marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 23, marginBottom: 26 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { height: 52, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 16 },
  error: { color: '#B91C1C', fontSize: 14, lineHeight: 20, marginTop: 12 },
  success: { fontSize: 14, lineHeight: 20, marginTop: 12 },
  retry: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  button: { minHeight: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  link: { minHeight: 48, textAlign: 'center', textAlignVertical: 'center', fontSize: 15, fontWeight: '700', marginTop: 8 },
});
