import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/constants/brand';
import { completeOnboarding } from '@/lib/onboarding';
import { useColorScheme } from '@/hooks/use-color-scheme';

const steps = [
  {
    title: 'Set up your skills profile',
    description:
      'Add your skills and a short bio so employers can understand the work you want to do.',
  },
  {
    title: 'Explore job listings',
    description:
      'Browse available roles and review the details before deciding what to pursue.',
  },
  {
    title: 'Review your matches',
    description:
      'See roles connected to the skills in your profile and update your details when they change.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;

  async function finish() {
    setSaving(true);
    setError('');
    try {
      await completeOnboarding();
      router.replace('/');
    } catch {
      setError('We could not save this step. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  const current = steps[step];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.container}>
        <Text style={[styles.brand, { color: Brand.primary }]}>{Brand.name}</Text>
        <View style={styles.progress} accessibilityLabel={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((item, index) => (
            <View
              key={item.title}
              style={[styles.progressSegment, { backgroundColor: index <= step ? Brand.primary : palette.border }]}
            />
          ))}
        </View>
        <View style={styles.content}>
          <Text style={[styles.kicker, { color: Brand.accent }]}>STEP {step + 1} OF {steps.length}</Text>
          <Text style={[styles.title, { color: palette.text }]}>{current.title}</Text>
          <Text style={[styles.description, { color: palette.muted }]}>{current.description}</Text>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        </View>
        <View style={styles.footer}>
          {step > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous onboarding step"
              style={styles.secondaryButton}
              onPress={() => setStep((value) => value - 1)}
              disabled={saving}
            >
              <Text style={[styles.secondaryText, { color: Brand.primary }]}>Back</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            style={[styles.primaryButton, { backgroundColor: Brand.primary }]}
            onPress={step === steps.length - 1 ? finish : () => setStep((value) => value + 1)}
            disabled={saving}
          >
            <Text style={styles.primaryText}>{saving ? 'Saving...' : step === steps.length - 1 ? 'Get started' : 'Continue'}</Text>
          </Pressable>
          {error ? (
            <Pressable accessibilityRole="button" style={styles.retry} onPress={finish} disabled={saving}>
              <Text style={{ color: Brand.primary }}>Retry</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', padding: 24, justifyContent: 'space-between' },
  brand: { fontSize: 20, fontWeight: '800', marginTop: 12 },
  progress: { flexDirection: 'row', gap: 8, marginTop: 32 },
  progressSegment: { height: 4, flex: 1, borderRadius: 2 },
  content: { flex: 1, justifyContent: 'center', paddingVertical: 48 },
  kicker: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 16 },
  title: { fontSize: 32, lineHeight: 39, fontWeight: '800', marginBottom: 14 },
  description: { fontSize: 17, lineHeight: 26 },
  error: { color: '#B91C1C', fontSize: 14, marginTop: 20 },
  footer: { gap: 12, paddingBottom: 20 },
  primaryButton: { minHeight: 52, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontWeight: '700' },
  retry: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
