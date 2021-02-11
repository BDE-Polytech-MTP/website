export const SITE_URL = 'SITE_URL';

export function validate(config: Record<string, unknown>) {
  if (config[SITE_URL] == undefined) {
    throw new Error(
      'It appears the SITE_URL environment variable is missing. Please set it pointing to the URL of the website.',
    );
  }
  return config;
}
