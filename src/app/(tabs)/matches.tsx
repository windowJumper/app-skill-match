import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppState } from '@/components/app-state';
import { Brand } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSupabaseClient } from '@/lib/supabase';
import { isOfflineError } from '@/lib/errors';

type Match = {
  id: string;
  jobs: { id: string; title: string; company: string | null; location: string | null } | null;
};

export default function MatchesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getSupabaseClient();
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Sign in to view your matches.');
      const { data, error: queryError } = await client
        .from('matches')
        .select('id, jobs(id, title, company, location)')
        .eq('profile_id', user.id);
      if (queryError) throw queryError;
      setMatches((data ?? []) as Match[]);
    } catch (cause) {
      setError(cause);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(loadMatches); }, [loadMatches]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <Text style={[styles.title, { color: palette.text }]}>Matches</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>Roles connected to your profile will appear here.</Text>
      {loading ? (
        <AppState kind="loading" title="Loading matches" message="Checking your profile matches." />
      ) : error ? (
        <AppState kind={isOfflineError(error) ? 'offline' : 'error'} title={isOfflineError(error) ? "You're offline" : 'Matches could not load'} message={isOfflineError(error) ? 'Check your connection and try again.' : 'We could not load your matches. Try again.'} onRetry={loadMatches} />
      ) : matches.length === 0 ? (
        <AppState kind="empty" title="No matches yet" message="Add skills to your profile and check again when matching roles are available." />
      ) : (
        <FlatList data={matches} keyExtractor={(match) => match.id} contentContainerStyle={styles.list} renderItem={({ item }) => (
          item.jobs ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`View matched role ${item.jobs.title}`} style={({ pressed }) => [styles.card, { backgroundColor: palette.surface, borderColor: palette.border, opacity: pressed ? 0.78 : 1 }]} onPress={() => router.push(`/jobs/${item.jobs!.id}`)}>
              <Text style={[styles.jobTitle, { color: palette.text }]}>{item.jobs.title}</Text>
              {item.jobs.company ? <Text style={{ color: Brand.accent, marginTop: 6 }}>{item.jobs.company}</Text> : null}
              {item.jobs.location ? <Text style={{ color: palette.muted, marginTop: 4 }}>{item.jobs.location}</Text> : null}
            </Pressable>
          ) : null
        )} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  title: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 24, fontSize: 28, fontWeight: '800' },
  subtitle: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 6, paddingBottom: 12, fontSize: 14, lineHeight: 21 },
  list: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, gap: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, minHeight: 76 },
  jobTitle: { fontSize: 17, fontWeight: '700' },
});
