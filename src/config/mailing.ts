export const MAILING_HOST = 'MAILING_HOST';
export const MAILING_USERNAME = 'MAILING_USERNAME';
export const MAILING_PASSWORD = 'MAILING_PASSWORD';
export const MAILING_DISABLE_TLS = 'MAILING_DISABLE_TLS';
export const MAILING_RECIPIENT = 'MAILING_RECIPIENT';
export const MAILING_USE_TEST_ACCOUNT = 'MAILING_USE_TEST_ACCOUNT';

export function validate(config: Record<string, unknown>) {
  if (config[MAILING_RECIPIENT] == undefined) {
    throw new Error(
      `It appears the ${MAILING_RECIPIENT} environment variable is missing. Please set it pointing to mail address of user you want to sent mails from.`,
    );
  }

  if (config[MAILING_USE_TEST_ACCOUNT]) {
    return config;
  }

  if (config[MAILING_HOST] == undefined) {
    throw new Error(
      `It appears the ${MAILING_HOST} environment variable is missing. Please set it pointing to a smtp server.`,
    );
  }
  if (config[MAILING_USERNAME] == undefined) {
    throw new Error(
      `It appears the ${MAILING_HOST} environment variable is missing. Please set it pointing to a valid user of the smtp server.`,
    );
  }
  if (config[MAILING_PASSWORD] == undefined) {
    throw new Error(
      `It appears the ${MAILING_PASSWORD} environment variable is missing. Please set it pointing to the password of your smtp user.`,
    );
  }
  return config;
}
