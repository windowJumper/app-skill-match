import { useCallback, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppState } from '@/components/app-state';
import { Brand } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSupabaseClient } from '@/lib/supabase';
import { isOfflineError } from '@/lib/errors';

type Profile = { full_name: string | null; role: string | null };

export default function DashboardScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getSupabaseClient();
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }
      const { data, error: profileError } = await client.from('profiles')
        .select('full_name, role').eq('id', user.id).maybeSingle();
      if (profileError) throw profileError;
      setProfile(data as Profile | null);
    } catch (cause) {
      setError(cause);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void Promise.resolve().then(loadProfile); }, [loadProfile]);

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind="loading" title="Loading your home" message="Checking your account and profile." /></SafeAreaView>;
  if (error) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind={isOfflineError(error) ? 'offline' : 'error'} title={isOfflineError(error) ? "You're offline" : 'Home could not load'} message={isOfflineError(error) ? 'Check your connection and try again.' : 'We could not load your profile. Try again.'} onRetry={loadProfile} /></SafeAreaView>;
  if (!profile) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind="empty" title="Finish setting up your profile" message="Open Profile to add your details and get started." /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.greeting}>
            <Text style={[styles.eyebrow, { color: palette.muted }]}>Welcome back</Text>
            <Text style={[styles.name, { color: palette.text }]}>{profile.full_name || 'Your profile'}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Open settings" style={styles.settings} onPress={() => router.push('/settings')}>
            <Text style={{ color: Brand.primary, fontWeight: '700' }}>Settings</Text>
          </Pressable>
        </View>
        <View style={[styles.introCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.introTitle, { color: palette.text }]}>Your skills and job search</Text>
          <Text style={[styles.introText, { color: palette.muted }]}>Keep your profile current, browse listings, and review roles matched to your skills.</Text>
        </View>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Continue</Text>
        <Action title="Update your profile" description="Edit your name and profile summary." onPress={() => router.push('/(tabs)/profile')} palette={palette} />
        <Action title="Browse jobs" description="Search available job listings." onPress={() => router.push('/(tabs)/jobs')} palette={palette} />
        <Action title="Review matches" description="See roles connected to your profile." onPress={() => router.push('/(tabs)/matches')} palette={palette} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Action({ title, description, onPress, palette }: { title: string; description: string; onPress: () => void; palette: typeof Brand.light | typeof Brand.dark }) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.action, { backgroundColor: palette.surface, borderColor: palette.border, opacity: pressed ? 0.78 : 1 }]} onPress={onPress}>
      <Text style={[styles.actionTitle, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.actionDescription, { color: palette.muted }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, paddingBottom: 40, gap: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  greeting: { flex: 1 },
  eyebrow: { fontSize: 14, marginBottom: 4 },
  name: { fontSize: 25, fontWeight: '800' },
  settings: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
  introCard: { borderWidth: 1, borderRadius: 12, padding: 20, marginBottom: 12 },
  introTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  introText: { fontSize: 15, lineHeight: 23 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  action: { borderWidth: 1, borderRadius: 12, padding: 16, minHeight: 76 },
  actionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 5 },
  actionDescription: { fontSize: 14, lineHeight: 20 },
});
