import { useCallback, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppState } from '@/components/app-state';
import { Brand } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSupabaseClient } from '@/lib/supabase';
import { isOfflineError } from '@/lib/errors';

type Job = { id: string; title: string; company: string | null; location: string | null; description: string | null };

export default function JobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;

  const loadJob = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await getSupabaseClient()
        .from('jobs')
        .select('id, title, company, location, description')
        .eq('id', id)
        .maybeSingle();
      if (queryError) throw queryError;
      setJob(data as Job | null);
    } catch (cause) {
      setError(cause);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void Promise.resolve().then(loadJob); }, [loadJob]);

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind="loading" title="Loading job" message="Fetching the listing." /></SafeAreaView>;
  if (error) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind={isOfflineError(error) ? 'offline' : 'error'} title={isOfflineError(error) ? "You're offline" : 'Job could not load'} message={isOfflineError(error) ? 'Check your connection and try again.' : 'We could not load this listing. Try again.'} onRetry={loadJob} /></SafeAreaView>;
  if (!job) return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind="empty" title="This job is unavailable" message="It may have been removed from the listings." /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" style={styles.back} onPress={() => router.back()}><Text style={{ color: Brand.primary }}>Back to jobs</Text></Pressable>
        <Text style={[styles.title, { color: palette.text }]}>{job.title}</Text>
        {job.company ? <Text style={[styles.company, { color: Brand.accent }]}>{job.company}</Text> : null}
        {job.location ? <Text style={[styles.location, { color: palette.muted }]}>{job.location}</Text> : null}
        <Text style={[styles.description, { color: palette.text }]}>{job.description || 'The employer has not added a description.'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, paddingBottom: 48 },
  back: { minHeight: 44, justifyContent: 'center', marginBottom: 18 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  company: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  location: { fontSize: 15, marginBottom: 24 },
  description: { fontSize: 16, lineHeight: 25 },
});
