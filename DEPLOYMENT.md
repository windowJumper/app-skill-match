# Deployment

## Configure the app

1. Copy `.env.example` to `.env` and set the production Supabase URL, publishable key, website URL, and support email. Never put a Supabase secret or service role key in the app. The local `.env` is ignored by Git.
2. Replace the app identifiers in `app.json` with the final reverse-DNS identifier. Use the same Android package name in Play Console and `assetlinks.json`.
3. Set `EXPO_PUBLIC_WEBSITE_URL` to the production domain. `app.config.ts` uses it to add iOS Associated Domains and Android verified link intent filters.
4. In Supabase Auth URL Configuration, allow the production `EXPO_PUBLIC_WEBSITE_URL/reset-password` redirect and the `skillmatch://reset-password` fallback. Confirm email templates preserve the recovery type and token parameters.
   Enable email confirmation for production signups and test the confirmation link with the production website or app callback. It is disabled in the current Supabase project for local testing.
5. Publish `.well-known/assetlinks.json` and `.well-known/apple-app-site-association` at the website root. Replace the Android signing fingerprint and Apple Team ID first.
6. Deploy the included authenticated Supabase Edge Function with `supabase functions deploy delete-account`. Keep its server credentials on Supabase. Ensure the `profiles.id` foreign key references `auth.users.id` with `ON DELETE CASCADE` so profile rows are removed with the account.
7. Confirm the database has `profiles`, `jobs`, and `matches` tables with row level security. The app expects `matches.profile_id` to reference `profiles.id` and `matches.job_id` to reference `jobs.id`.
8. Replace legal placeholders and publish the same privacy, support, and terms content on the website.

## EAS setup and signing

1. Install the EAS CLI with `npx eas-cli@latest` and sign in to the Expo account that owns the app.
2. Run `npx eas-cli@latest build:configure` to create or update `eas.json` for this project.
3. Set the EAS project ID and production environment variables in the Expo project dashboard. Keep public configuration values in `EXPO_PUBLIC_*`; keep signing credentials and server secrets in their protected EAS or backend settings.
4. Start a development build with `npx eas-cli@latest build --profile development --platform all` and verify the native SecureStore integration on devices.
5. Create production builds with `npx eas-cli@latest build --profile production --platform all`. EAS can manage Android and iOS signing credentials, or use credentials already owned by the company.

## TestFlight

1. Create the app record in App Store Connect using the final bundle identifier.
2. Complete app privacy, export compliance, age rating, screenshots, support URL, and privacy policy URL.
3. Submit the iOS build with `npx eas-cli@latest submit --platform ios` or select the completed EAS build in the dashboard.
4. Add internal testers in App Store Connect, distribute through TestFlight, and verify sign up, production email confirmation, password recovery, account deletion, deep links, and offline states on a physical device.

## Google Play internal testing

1. Create the Play Console app using the final Android package name and complete the Data safety form using verified answers from `STORE_CHECKLIST.md`.
2. Add the production support and privacy policy URLs, store listing, screenshots, content rating, and app access instructions.
3. Build an Android app bundle with `npx eas-cli@latest build --profile production --platform android`.
4. Upload the bundle to the internal testing track, add testers, and verify sign up, production email confirmation, password recovery, account deletion, App Links, and offline behavior.
5. Promote to later tracks only after reviewing tester feedback and confirming the store declaration matches the shipped app.
