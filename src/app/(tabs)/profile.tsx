import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { AppState } from '@/components/app-state';
import { Brand } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSupabaseClient } from '@/lib/supabase';
import { isOfflineError, userFacingError } from '@/lib/errors';

type Profile = { id: string; full_name: string; email: string | null; role: string; bio: string | null; skills: string[] };

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const client = getSupabaseClient();
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Sign in to view your profile.');
      const { data, error: profileError } = await client.from('profiles')
        .select('id, full_name, email, role, bio, skills').eq('id', user.id).maybeSingle();
      if (profileError) throw profileError;
      if (!data) {
        setError('Your profile is not available yet. Try again after your account setup finishes.');
        return;
      }
      const nextProfile = data as Profile;
      setProfile(nextProfile);
      setName(nextProfile.full_name ?? '');
      setBio(nextProfile.bio ?? '');
      setSkills((nextProfile.skills ?? []).join(', '));
    } catch (cause) {
      setError(userFacingError(cause, 'We could not load your profile. Try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(loadProfile); }, [loadProfile]);

  async function saveProfile() {
    if (!name.trim()) {
      setError('Enter your name before saving.');
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      if (!profile) throw new Error('Your profile could not be found. Retry loading it.');
      const { error: updateError } = await getSupabaseClient().from('profiles')
        .update({ full_name: name.trim(), bio: bio.trim() || null, skills: skills.split(',').map((skill) => skill.trim()).filter(Boolean) }).eq('id', profile.id);
      if (updateError) throw updateError;
      setSaved(true);
    } catch (cause) {
      setError(userFacingError(cause, 'We could not save your profile. Try again.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind="loading" title="Loading profile" message="Fetching your account details." /></SafeAreaView>;
  if (error && !profile) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind={isOfflineError(error) ? 'offline' : 'error'} title={isOfflineError(error) ? "You're offline" : 'Profile could not load'} message={isOfflineError(error) ? 'Check your connection and try again.' : error} onRetry={loadProfile} /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: palette.text }]}>Your profile</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>Keep your profile details current for job matching.</Text>
        <Text style={[styles.label, { color: palette.text }]}>Full name</Text>
        <TextInput accessibilityLabel="Full name" style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]} value={name} onChangeText={setName} editable={!saving} autoCapitalize="words" />
        <Text style={[styles.label, { color: palette.text }]}>Email address</Text>
        <Text style={[styles.readOnly, { color: palette.muted, borderColor: palette.border }]}>{profile?.email || 'Not available'}</Text>
        <Text style={[styles.label, { color: palette.text }]}>Account type</Text>
        <Text style={[styles.readOnly, { color: palette.muted, borderColor: palette.border }]}>{profile?.role || 'Not available'}</Text>
        <Text style={[styles.label, { color: palette.text }]}>Skills</Text>
        <TextInput accessibilityLabel="Skills, separated by commas" style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]} value={skills} onChangeText={setSkills} editable={!saving} placeholder="For example, project management, design" placeholderTextColor={palette.muted} />
        <Text style={[styles.label, { color: palette.text }]}>About you</Text>
        <TextInput accessibilityLabel="About you" style={[styles.bio, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]} value={bio} onChangeText={setBio} editable={!saving} multiline maxLength={1000} textAlignVertical="top" />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {error ? <Pressable accessibilityRole="button" style={styles.retry} onPress={saveProfile} disabled={saving}><Text style={{ color: Brand.primary, fontWeight: '700' }}>Retry</Text></Pressable> : null}
        {saved ? <Text accessibilityRole="alert" style={{ color: Brand.accent, marginTop: 12 }}>Your profile was saved.</Text> : null}
        <Pressable accessibilityRole="button" style={[styles.primaryButton, { backgroundColor: Brand.primary }]} onPress={saveProfile} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Save profile</Text>}
        </Pressable>
        <Link href="/settings" style={[styles.settingsLink, { color: Brand.primary }]}>Settings</Link>
        <View style={styles.legalLinks}>
          <Link href="/terms" style={{ color: Brand.primary }}>Terms and Conditions</Link>
          <Link href="/privacy" style={{ color: Brand.primary }}>Privacy Policy</Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: 24, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 16 },
  readOnly: { minHeight: 48, borderBottomWidth: 1, textAlignVertical: 'center', fontSize: 15 },
  bio: { minHeight: 130, borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16 },
  error: { color: '#B91C1C', lineHeight: 21, marginTop: 14 },
  retry: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  primaryButton: { minHeight: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  settingsLink: { minHeight: 48, textAlign: 'center', textAlignVertical: 'center', fontWeight: '700' },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', gap: 20, minHeight: 48, alignItems: 'center' },
});
