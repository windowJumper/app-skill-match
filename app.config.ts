import type { ExpoConfig } from 'expo/config';

const baseConfig: ExpoConfig = require('./app.json').expo;
const websiteUrl = process.env.EXPO_PUBLIC_WEBSITE_URL ?? process.env.WEBSITE_URL;

function getWebsiteHost(value?: string) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.hostname : undefined;
  } catch {
    return undefined;
  }
}

const websiteHost = getWebsiteHost(websiteUrl);

export default (): ExpoConfig => ({
  ...baseConfig,
  ios: {
    ...baseConfig.ios,
    ...(websiteHost ? { associatedDomains: [`applinks:${websiteHost}`] } : {}),
  },
  android: {
    ...baseConfig.android,
    ...(websiteHost
      ? {
          intentFilters: [
            {
              action: 'VIEW',
              autoVerify: true,
              data: [{ scheme: 'https', host: websiteHost, pathPrefix: '/' }],
              category: ['BROWSABLE', 'DEFAULT'],
            },
          ],
        }
      : {}),
  },
});
