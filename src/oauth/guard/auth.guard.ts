import { ExecutionContext, Injectable } from '@nestjs/common';
import { OAuthService } from '../oauth.service';
import { IdentifiedGuard } from './identified.guard';

@Injectable()
export class AuthGuard extends IdentifiedGuard {
  constructor(oauthService: OAuthService) {
    super(oauthService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const req = AuthGuard.getRequestFromContext(context);
    return (req as any).user;
  }
}
