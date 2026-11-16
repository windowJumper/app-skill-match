import { Link } from 'expo-router';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { Brand } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NotFoundScreen() {
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <Text style={[styles.title, { color: palette.text }]}>Page not found</Text>
      <Text style={[styles.description, { color: palette.muted }]}>This page is not available.</Text>
      <Link href="/" style={[styles.link, { color: Brand.primary }]}>Go to SkillMatch</Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '800' },
  description: { fontSize: 15, marginTop: 8 },
  link: { minHeight: 48, textAlignVertical: 'center', fontWeight: '700', marginTop: 16 },
});
