import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/constants/brand';
import { PRIVACY_SECTIONS, TERMS_SECTIONS } from '@/constants/legal';
import { useColorScheme } from '@/hooks/use-color-scheme';

type DocumentKind = 'terms' | 'privacy';

export function LegalDocument({ kind }: { kind: DocumentKind }) {
  const palette = useColorScheme() === 'dark' ? Brand.dark : Brand.light;
  const title = kind === 'terms' ? 'Terms and Conditions' : 'Privacy Policy';
  const sections = kind === 'terms' ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  return (
    <ScrollView style={{ backgroundColor: palette.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.date, { color: palette.muted }]}>Effective date: [EFFECTIVE DATE]</Text>
      {sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={[styles.heading, { color: palette.text }]}>{section.heading}</Text>
          <Text style={[styles.body, { color: palette.muted }]}>{section.body}</Text>
        </View>
      ))}
      <Link href="/(tabs)/profile" style={[styles.link, { color: Brand.primary }]}>Back to settings</Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, paddingBottom: 56 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 12, marginBottom: 8 },
  date: { fontSize: 13, marginBottom: 28 },
  section: { marginBottom: 22 },
  heading: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 24 },
  link: { minHeight: 44, textAlignVertical: 'center', fontSize: 15, fontWeight: '700' },
});
