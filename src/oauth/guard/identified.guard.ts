import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { OAuthService } from '../oauth.service';
import { FastifyRequest } from 'fastify';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class IdentifiedGuard implements CanActivate {
  constructor(private oauthService: OAuthService) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = IdentifiedGuard.getRequestFromContext(context);

    const auth = await this.oauthService.resourceOwnerFromBearerToken(
      request.headers.authorization,
    );

    if (auth) {
      (request as any).user = auth.resourceOwner;
      (request as any).scopes = auth.scopes;
    }

    return true;
  }

  static getRequestFromContext(context: ExecutionContext): FastifyRequest {
    const contextType = context.getType<GqlContextType>();
    let request: FastifyRequest;
    if (contextType === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req;
    } else {
      request = context.switchToHttp().getRequest<FastifyRequest>();
    }
    return request;
  }
}
