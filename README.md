# SkillMatch

SkillMatch is an Expo and React Native app for candidates to maintain a profile, browse job listings, and review profile based matches.

## Set up

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env` and set the Supabase project URL and publishable key. Keep `.env` local; do not commit it or put a secret/service-role key in the app.
3. For local web testing, use `http://localhost:8081` for `EXPO_PUBLIC_WEBSITE_URL` and allow `http://localhost:8081/**` in Supabase Auth URL Configuration.
4. Start the app from the project folder with `npx expo start --clear`.

In PowerShell, including the VS Code integrated terminal, run:

```powershell
Set-Location 'C:\Users\anshu\OneDrive\Desktop\app\app-systum-main'
npx expo start --clear
```

The app uses Expo Router routes in `src/app`. The destructive starter reset script was removed because it would delete the existing application.

## Backend contract

The current screens expect Supabase Auth with email and password and these tables:

- `profiles`: `id`, `full_name`, `email`, `role`, `bio`, and `skills` as a text array with an empty array default.
- `jobs`: `id`, `title`, `company`, `location`, and `description`.
- `matches`: `id`, `profile_id`, and `job_id`, with foreign keys to `profiles.id` and `jobs.id`.

The existing Supabase project has these tables, matching foreign keys, row level security enabled, and policies for users to access their own profiles and matches while signed-in users can read jobs. A signup trigger named `on_auth_user_created` calls `handle_new_user()` to create profiles. Keep the policies aligned with the website's listing rules. The profile and match foreign keys should cascade on account deletion. The Settings screen calls the included authenticated `delete-account` Edge Function. Deploy and verify that function before release.

Email confirmation is currently disabled in Supabase for local testing. Enable it again for production and configure the website or app confirmation redirect before release.

## Release setup

Read [STORE_CHECKLIST.md](./STORE_CHECKLIST.md) for data safety and legal placeholders and [DEPLOYMENT.md](./DEPLOYMENT.md) for EAS, TestFlight, and Play internal testing steps. Publish the domain association files in `public/.well-known` from the production website root.

