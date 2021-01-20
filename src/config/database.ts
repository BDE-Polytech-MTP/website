export const DATABASE_URL = 'DATABASE_URL';

export function validate(config: Record<string, unknown>) {
  if (config[DATABASE_URL] == undefined) {
    throw new Error(
      'It appears the DATABASE_URL environment variable is missing. Please set it pointing to a postgres database.',
    );
  }
  return config;
}
