export class SuccessAuthorizationResponse {
  code: string;
  state?: string;
}

export class ErrorAuthorizationResponse {
  error:
    | 'unauthorized_client'
    | 'access_denied'
    | 'invalid_scope'
    | 'server_error';
  state?: string;
}

export type AuthorizationResponse =
  | SuccessAuthorizationResponse
  | ErrorAuthorizationResponse;
