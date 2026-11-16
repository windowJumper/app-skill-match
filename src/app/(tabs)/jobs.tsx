import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppState } from '@/components/app-state';
import { Brand } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSupabaseClient } from '@/lib/supabase';
import { isOfflineError } from '@/lib/errors';

type Job = { id: string; title: string; company: string | null; location: string | null; description: string | null };

export default function JobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await getSupabaseClient()
        .from('jobs')
        .select('id, title, company, location, description');
      if (queryError) throw queryError;
      setJobs((data ?? []) as Job[]);
    } catch (cause) {
      setError(cause);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(loadJobs); }, [loadJobs]);

  const filteredJobs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return jobs;
    return jobs.filter((job) => `${job.title} ${job.company ?? ''} ${job.location ?? ''}`.toLowerCase().includes(normalized));
  }, [jobs, query]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>Jobs</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>Browse roles from your connected listings.</Text>
        <TextInput accessibilityLabel="Search jobs" style={[styles.search, { color: palette.text, borderColor: palette.border, backgroundColor: palette.surface }]} placeholder="Search titles, companies, or locations" placeholderTextColor={palette.muted} value={query} onChangeText={setQuery} returnKeyType="search" />
      </View>
      {loading ? (
        <AppState kind="loading" title="Loading jobs" message="Fetching current listings." />
      ) : error ? (
        <AppState kind={isOfflineError(error) ? 'offline' : 'error'} title={isOfflineError(error) ? "You're offline" : 'Jobs could not load'} message={isOfflineError(error) ? 'Check your connection and try again.' : 'We could not load job listings. Try again.'} onRetry={loadJobs} />
      ) : filteredJobs.length === 0 ? (
        <AppState kind="empty" title={query ? 'No jobs found' : 'No jobs are available yet'} message={query ? 'Try another title, company, or location.' : 'New listings will appear here when they are available.'} />
      ) : (
        <FlatList data={filteredJobs} keyExtractor={(job) => job.id} contentContainerStyle={styles.list} renderItem={({ item }) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`View ${item.title}${item.company ? ` at ${item.company}` : ''}`} style={({ pressed }) => [styles.card, { backgroundColor: palette.surface, borderColor: palette.border, opacity: pressed ? 0.78 : 1 }]} onPress={() => router.push(`/jobs/${item.id}`)}>
            <Text style={[styles.jobTitle, { color: palette.text }]}>{item.title}</Text>
            {item.company ? <Text style={[styles.jobCompany, { color: Brand.accent }]}>{item.company}</Text> : null}
            {item.location ? <Text style={[styles.jobLocation, { color: palette.muted }]}>{item.location}</Text> : null}
          </Pressable>
        )} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 18 },
  search: { minHeight: 48, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  list: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, paddingTop: 8, gap: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, minHeight: 76 },
  jobTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  jobCompany: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  jobLocation: { fontSize: 14 },
});
