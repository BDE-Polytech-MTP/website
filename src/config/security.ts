export const JWT_SECRET = 'JWT_SECRET';
export const PASSWORD_RESET_SECRET = 'PASSWORD_RESET_SECRET';

export function validate(config: Record<string, unknown>) {
  if (config[JWT_SECRET] === undefined) {
    throw new Error(
      `It appears the ${JWT_SECRET} environment variable is missing. Please set it to the passphrase to use to sign the JWTs.`,
    );
  }
  return config;
}
