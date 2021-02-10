import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { OAuthService } from '../oauth.service';

@Injectable()
export class OAuthMiddleware implements NestMiddleware {
  constructor(private oauthService: OAuthService) {}

  async use(
    req: FastifyRequest,
    res: FastifyReply,
    next: () => void,
  ): Promise<any> {
    const auth = await this.oauthService.resourceOwnerFromBearerToken(
      req.headers.authorization,
    );

    if (auth) {
      (req as any).user = auth.resourceOwner;
      (req as any).scopes = auth.scopes;
    }

    return next();
  }
}
