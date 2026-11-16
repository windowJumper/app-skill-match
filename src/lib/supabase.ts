
import "react-native-url-polyfill/auto";

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  createClient,
  type SupportedStorage,
} from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Read environment variables
const supabaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Web has no SecureStore implementation, so keep its auth session in memory only. */
const webSession = new Map<string, string>();
const webStorage: SupportedStorage = {
  getItem: async (key) => webSession.get(key) ?? null,
  setItem: async (key, value) => { webSession.set(key, value); },
  removeItem: async (key) => { webSession.delete(key); },
};

/**
 * Select the correct storage system.
 *
 * Native: encrypted SecureStore
 * Web: in-memory session storage because SecureStore is native-only
 */
const storage: SupportedStorage =
  Platform.OS === "web"
    ? webStorage
    : {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      };

/**
 * Supabase client
 */
let client: ReturnType<typeof createClient<Database>> | undefined;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Add EXPO_PUBLIC_API_BASE_URL and a Supabase publishable key to your .env file, then restart Expo."
    );
  }

  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        storage,

        // Keep native users signed in between app launches.
        persistSession: true,

        // Automatically refresh expired sessions.
        autoRefreshToken: true,

        // Recovery and OAuth links are handled by the root layout.
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}
