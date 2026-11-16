
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { getSupabaseClient } from "../../lib/supabase";
import { Brand } from "@/constants/brand";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { userFacingError } from "@/lib/errors";

type AccountType = "candidate" | "recruiter";

export default function RegisterScreen() {
  const router = useRouter();
  const palette = useColorScheme() === "dark" ? Brand.dark : Brand.light;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] =
    useState<AccountType>("candidate");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showError = (message: string) => {
    setErrorMessage(userFacingError(new Error(message), message));
  };

  const handleRegister = async () => {
    setErrorMessage("");
    // Remove unnecessary spaces
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Validate full name
    if (!trimmedName) {
      showError("Please enter your full name.");
      return;
    }

    if (trimmedName.length < 2) {
      showError("Your name must contain at least 2 characters.");
      return;
    }

    // Validate email
    if (!trimmedEmail) {
      showError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      showError("Please enter a valid email address.");
      return;
    }

    // Validate password
    if (!password) {
      showError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      showError("Password must contain at least 6 characters.");
      return;
    }

    // Validate confirm password
    if (!confirmPassword) {
      showError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      console.log("Starting registration...");

      // Create a Supabase authentication user.
      // The metadata is used by the database trigger
      // to create a row in public.profiles.
      const { data, error } = await getSupabaseClient().auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            full_name: trimmedName,
            role: accountType,
          },
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);
        showError(error.message);
        return;
      }

      if (!data.user) {
        showError(
          "The account could not be created. Please try again."
        );
        return;
      }

      console.log("Registration successful:", data.user.id);

      // When email confirmation is enabled, Supabase may not
      // return an active session immediately.
      if (!data.session) {
        Alert.alert(
          "Account Created",
          "Your account has been created. Please check your email to confirm your account, then log in.",
          [
            {
              text: "Go to Login",
              onPress: () => {
                router.replace("/(auth)/login");
              },
            },
          ]
        );

        return;
      }

      // If email confirmation is disabled, the user may
      // receive a session immediately.
      Alert.alert(
        "Registration Successful",
        "Your SkillMatch account has been created.",
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/(tabs)");
            },
          },
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      showError(message.startsWith("Add EXPO_PUBLIC_")
        ? message
        : /network|fetch|offline/i.test(message)
          ? "You're offline. Check your connection and try again."
          : "We could not create your account. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardContainer, { backgroundColor: palette.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={[styles.container, { backgroundColor: palette.background }]}>
          {/* Back Button */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>

          <Text style={styles.legalText}>
            By creating an account, you agree to the <Link href="/terms" style={styles.legalLink}>Terms and Conditions</Link> and acknowledge the <Link href="/privacy" style={styles.legalLink}>Privacy Policy</Link>.
          </Text>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <Text style={styles.brandName}>SkillMatch</Text>
          </View>

          {/* Heading */}
          <Text style={[styles.title, { color: palette.text }]}>Create account</Text>

          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Create an account to add your profile and browse job listings.
          </Text>

          {errorMessage ? (
            <View>
              <Text accessibilityRole="alert" style={styles.errorText}>{errorMessage}</Text>
              {/offline|connection|fetch|network/i.test(errorMessage) ? (
                <Pressable accessibilityRole="button" style={styles.retryButton} onPress={handleRegister} disabled={loading}>
                  <Text style={{ color: Brand.primary, fontWeight: "700" }}>Retry</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: palette.text }]}>Full name</Text>

            <TextInput
              style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              accessibilityLabel="Full name"
              placeholder="Enter your full name"
              placeholderTextColor="#8A94A6"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: palette.text }]}>Email address</Text>

            <TextInput
              style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              accessibilityLabel="Email address"
              placeholder="Enter your email"
              placeholderTextColor="#8A94A6"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: palette.text }]}>Password</Text>

            <View style={[styles.passwordContainer, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: palette.text }]}
                accessibilityLabel="Password"
                placeholder="Enter your password"
                placeholderTextColor="#8A94A6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Pressable
                style={styles.showButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showButtonText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: palette.text }]}>Confirm password</Text>

            <View style={[styles.passwordContainer, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: palette.text }]}
                accessibilityLabel="Confirm password"
                placeholder="Confirm your password"
                placeholderTextColor="#8A94A6"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Pressable
                style={styles.showButton}
                onPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                <Text style={styles.showButtonText}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Account Type */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: palette.text }]}>Account type</Text>

            <View style={styles.accountTypeContainer}>
              {/* Candidate */}
              <Pressable
                style={[
                  styles.accountTypeButton,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                  accountType === "candidate" &&
                    styles.accountTypeButtonActive,
                ]}
                onPress={() => setAccountType("candidate")}
                disabled={loading}
                accessibilityRole="radio"
                accessibilityState={{ selected: accountType === "candidate" }}
              >
                <Text
                  style={[
                    styles.accountTypeText,
                    accountType === "candidate" &&
                      styles.accountTypeTextActive,
                  ]}
                >
                  Candidate
                </Text>
              </Pressable>

              {/* Recruiter */}
              <Pressable
                style={[
                  styles.accountTypeButton,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                  accountType === "recruiter" &&
                    styles.accountTypeButtonActive,
                ]}
                onPress={() => setAccountType("recruiter")}
                disabled={loading}
                accessibilityRole="radio"
                accessibilityState={{ selected: accountType === "recruiter" }}
              >
                <Text
                  style={[
                    styles.accountTypeText,
                    accountType === "recruiter" &&
                      styles.accountTypeTextActive,
                  ]}
                >
                  Recruiter
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Register Button */}
          <Pressable
            style={[
              styles.registerButton,
              loading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </Pressable>

          {/* Login Link */}
          <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: palette.muted }]}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              disabled={loading}
            >
              <Text style={[styles.loginLink, { color: Brand.primary }]}> Log in</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContainer: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 20,
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
  },

  brandName: {
    color: "#2563EB",
    fontSize: 24,
    fontWeight: "800",
  },

  title: {
    color: "#0F172A",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    color: "#64748B",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#0F172A",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#0F172A",
  },

  showButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: "center",
  },

  showButtonText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
  },

  accountTypeContainer: {
    flexDirection: "row",
    gap: 10,
  },

  accountTypeButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  accountTypeButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  accountTypeText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },

  accountTypeTextActive: {
    color: "#FFFFFF",
  },

  registerButton: {
    width: "100%",
    height: 54,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    elevation: 2,
  },

  registerButtonDisabled: {
    backgroundColor: "#93B4F5",
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  loginText: {
    color: "#64748B",
    fontSize: 14,
  },

  loginLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },

  legalText: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 16,
  },

  legalLink: {
    color: "#2563EB",
    fontWeight: "700",
  },

  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },

  retryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
