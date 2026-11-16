import { Link } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function WelcomeScreen() {
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.container}>
        <View>
          <Text style={[styles.brand, { color: Brand.primary }]}>{Brand.name}</Text>
          <View style={styles.hero}>
            <Text style={[styles.title, { color: palette.text }]}>Find roles that fit your skills.</Text>
            <Text style={[styles.description, { color: palette.muted }]}>Add your skills, browse job listings, and review roles connected to your profile.</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Link href="/(auth)/register" asChild>
            <Pressable accessibilityRole="button" style={StyleSheet.flatten([styles.primaryButton, { backgroundColor: Brand.primary }])}>
              <Text style={styles.primaryText}>Create account</Text>
            </Pressable>
          </Link>
          <Link href="/(auth)/login" asChild>
            <Pressable accessibilityRole="button" style={StyleSheet.flatten([styles.secondaryButton, { borderColor: Brand.primary }])}>
              <Text style={{ color: Brand.primary, fontWeight: '700' }}>Log in</Text>
            </Pressable>
          </Link>
          <Link href="/onboarding" style={[styles.onboarding, { color: palette.muted }]}>See how SkillMatch works</Link>
          <View style={styles.legal}>
            <Link href="/terms" style={[styles.legalLink, { color: palette.muted }]}>Terms and Conditions</Link>
            <Link href="/privacy" style={[styles.legalLink, { color: palette.muted }]}>Privacy Policy</Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 36, paddingBottom: 28 },
  brand: { fontSize: 20, fontWeight: '800' },
  hero: { marginTop: 72, marginBottom: 48 },
  title: { fontSize: 36, lineHeight: 43, fontWeight: '800', marginBottom: 18 },
  description: { fontSize: 17, lineHeight: 26 },
  actions: { gap: 12, paddingBottom: 8 },
  primaryButton: { minHeight: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: { minHeight: 52, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  onboarding: { minHeight: 44, textAlign: 'center', textAlignVertical: 'center', fontSize: 14, fontWeight: '600' },
  legal: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 8 },
  legalLink: { minHeight: 44, textAlignVertical: 'center', fontSize: 12 },
});
