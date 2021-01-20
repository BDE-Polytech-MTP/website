export class SuccessAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export class ErrorAccessTokenResponse {
  error: 'invalid_client' | 'unauthorized_client';
}
