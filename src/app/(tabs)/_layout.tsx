
import { useCallback, useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { SafeAreaView } from "react-native";
import { AppState } from "@/components/app-state";
import { Brand } from "@/constants/brand";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getSupabaseClient } from "@/lib/supabase";
import { isOfflineError } from "@/lib/errors";

type GuardState = "loading" | "ready" | "error";

export default function TabsLayout() {
  const router = useRouter();
  const palette = useColorScheme() === "dark" ? Brand.dark : Brand.light;
  const [guardState, setGuardState] = useState<GuardState>("loading");
  const [guardError, setGuardError] = useState<unknown>(null);

  const checkSession = useCallback(async () => {
    setGuardState("loading");
    setGuardError(null);
    try {
      const { data, error } = await getSupabaseClient().auth.getSession();
      if (error) throw error;
      if (!data.session) {
        router.replace("/(auth)/login");
        return;
      }
      setGuardState("ready");
    } catch (cause) {
      setGuardError(cause);
      setGuardState("error");
    }
  }, [router]);

  useEffect(() => { void Promise.resolve().then(checkSession); }, [checkSession]);

  if (guardState === "loading") return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind="loading" title="Checking your account" message="Please wait." /></SafeAreaView>;
  if (guardState === "error") return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}><AppState kind={isOfflineError(guardError) ? "offline" : "error"} title={isOfflineError(guardError) ? "You're offline" : "Sign in could not be checked"} message={isOfflineError(guardError) ? "Check your connection and try again." : "Check your app configuration and try again."} onRetry={checkSession} /></SafeAreaView>;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarStyle: { height: 65, paddingBottom: 8, paddingTop: 8, backgroundColor: palette.surface, borderTopWidth: 1, borderTopColor: palette.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home tab",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "house.fill", android: "home", web: "home" }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
          tabBarAccessibilityLabel: "Jobs tab",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "briefcase.fill", android: "work", web: "work" }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarAccessibilityLabel: "Matches tab",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "scope", android: "track_changes", web: "track_changes" }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarAccessibilityLabel: "Profile tab",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "person.crop.circle.fill", android: "account_circle", web: "account_circle" }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
