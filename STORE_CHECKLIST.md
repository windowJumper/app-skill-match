# Store readiness checklist

Complete every item marked **Confirm** with the production backend and company details before submitting.

## Data safety answers to verify

| Store question | Current app behavior | Submission answer |
| --- | --- | --- |
| Does the app collect personal information? | Yes. Account email and profile name, account type, skills, and bio are sent to the configured Supabase project. | Declare email address, name, and user profile information. **Confirm** whether additional profile fields are collected by the website or production database. |
| Is collected information linked to the user? | Yes. Supabase Auth and the `profiles` row use an account identifier. | Declare the data as linked to the user. |
| Why is information collected? | Account management, displaying a profile, and showing jobs and matches. | App functionality. **Confirm** any analytics, diagnostics, personalization, or advertising SDKs before release. |
| Is information shared? | Supabase processes account and profile data as the configured backend provider. The app does not currently send profile data to employers. | Declare service provider processing as applicable. **Confirm** provider terms and any employer sharing before release. |
| Is data encrypted in transit? | API calls use the configured Supabase HTTPS endpoint. | Yes, provided `EXPO_PUBLIC_API_BASE_URL` uses HTTPS. **Confirm** production endpoint and provider configuration. |
| Is data encrypted at rest? | The app does not control backend storage encryption. | **Confirm** the Supabase project’s storage and backup encryption settings before answering. |
| Can a user request deletion? | Settings calls the Supabase Edge Function named `delete-account`. | **Confirm** that the function is deployed, deletes Auth and profile data, and documents any retention exceptions. |
| Is data required to use the app? | Account email and password are required. Profile fields are optional after account creation. | Declare required and optional fields to match the final signup form and store listing. |
| Is data sold or used for ads? | The app contains no advertising SDK or sale flow. | Answer no only after confirming the production website and backend use the same practice. |

## Website links

Set `EXPO_PUBLIC_WEBSITE_URL` to the production website. Publish these pages on that same domain and use their final URLs in the store consoles:

- Privacy policy: `${EXPO_PUBLIC_WEBSITE_URL}/privacy`
- Support: `${EXPO_PUBLIC_WEBSITE_URL}/support`
- Terms: `${EXPO_PUBLIC_WEBSITE_URL}/terms`

The Terms and Privacy screens in the app contain `[COMPANY NAME]`, `[CONTACT EMAIL]`, and `[EFFECTIVE DATE]` placeholders. Replace them before release and publish matching full text on the website.

## Before submission

- [ ] Replace every marked company, contact, website, domain, signing, and date placeholder.
- [ ] Confirm the job and match database schema and row level security policies.
- [ ] Deploy and verify the `delete-account` Edge Function.
- [ ] Verify the answers above against the production Supabase project and every analytics SDK.
- [ ] Confirm the website privacy, support, and terms pages are publicly reachable.
- [ ] Confirm the app icon, splash, adaptive icon, and favicon use the approved SkillMatch mark.
- [ ] Test account creation, email confirmation, login, password recovery, profile update, logout, and deletion on iOS and Android.
- [ ] Test offline handling and accessibility with a screen reader and large text.
- [ ] Verify Android App Links and iOS Universal Links using the production domain and signing identities.
