import { useEffect, useRef } from "react";
import { Stack, type ErrorBoundaryProps, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { Pressable, SafeAreaView, StyleSheet, Text } from "react-native";
import { Brand } from "@/constants/brand";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getSupabaseClient } from "@/lib/supabase";

function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  if (__DEV__) console.error('Screen error:', error.message);
  const offline = /network|fetch|offline/i.test(error.message);
  const palette = useColorScheme() === "dark" ? Brand.dark : Brand.light;
  return (
    <SafeAreaView style={[styles.errorScreen, { backgroundColor: palette.background }]}>
      <Text style={[styles.errorTitle, { color: palette.text }]}>{offline ? "You're offline" : "This screen could not load"}</Text>
      <Text style={[styles.errorDescription, { color: palette.muted }]}>{offline ? "Check your connection and try again." : "An unexpected error interrupted this screen."}</Text>
      <Pressable accessibilityRole="button" style={styles.retryButton} onPress={() => { void retry(); }}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export const unstable_settings = {
  screenErrorBoundary: AppErrorBoundary,
};

export default function RootLayout() {
  const router = useRouter();
  const url = Linking.useLinkingURL();
  const handledUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!url || handledUrl.current === url) return;
    let params: URLSearchParams;
    try {
      const parsed = new URL(url);
      params = new URLSearchParams(parsed.search);
      new URLSearchParams(parsed.hash.slice(1)).forEach((value, key) => params.set(key, value));
    } catch {
      return;
    }
    if (params.get("type") !== "recovery") return;

    handledUrl.current = url;
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    void (async () => {
      try {
        if (!accessToken || !refreshToken) throw new Error("The reset link is incomplete.");
        const { error } = await getSupabaseClient().auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) throw error;
        router.replace("/(auth)/reset-password");
      } catch {
        router.replace({ pathname: "/(auth)/reset-password", params: { linkError: "1" } });
      }
    })();
  }, [router, url]);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  errorScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  errorDescription: { fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 10 },
  retryButton: { minHeight: 48, minWidth: 120, borderRadius: 10, backgroundColor: Brand.primary, alignItems: "center", justifyContent: "center", marginTop: 20 },
  retryText: { color: "#FFFFFF", fontWeight: "700" },
});
