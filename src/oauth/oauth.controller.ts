import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Post,
  Query,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthorizationRequestArgs } from './args/authorization.args';
import { AccessTokenRequest } from './args/access-token.args';
import { RegisterClientRequest } from './args/register.args';
import { OAuthService } from './oauth.service';
import { SuccessRegisterResponse } from './response/register.response';
import { FastifyReply } from 'fastify';
import 'point-of-view';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthGuard } from './guard/auth.guard';

@Controller('oauth')
export class OauthController {
  constructor(private oauthService: OAuthService) {}

  @Header('x-frame-options', 'deny')
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Get('authorize')
  @UseGuards(AuthGuard)
  @Render('oauth-authorize.hbs')
  async getAuthorization(@Query() params: AuthorizationRequestArgs) {
    try {
      const client = await this.oauthService.getOAuthClient(params.client_id);

      if (!client) {
        return { error: true };
      }

      const scopes = {};
      params.scope.split(/\s+/).forEach((scope) => (scopes[scope] = true)); // TODO: validate scopes

      return {
        ...params,
        client_name: client.clientName,
        scopes,
      };
    } catch {
      return { error: true };
    }
  }

  @ApiExcludeEndpoint()
  @Header('x-frame-options', 'deny')
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @UseGuards(AuthGuard)
  @Post('authorize')
  async postAuthorizationGrant(
    @Query() params: AuthorizationRequestArgs,
    @Body('granted') granted: string,
    @Res() res: FastifyReply,
  ) {
    const client = await this.oauthService.getOAuthClient(params.client_id);

    if (!client) {
      return res.view('oauth-authorize.hbs', { error: true });
    }

    if (granted !== 'true') {
      return res.view('cancelled-oauth-authorize.hbs', {
        client_name: client.clientName,
      });
    }

    const scopes = new Set(params.scope.split(/\s+/)); // TODO: validate scopes

    const authorizationCode = await this.oauthService.generateOAuthAuthorizationCode(
      client,
      [...scopes.keys()],
      undefined, // TODO: Use req.user
    );

    let redirectionUrl = client.redirectURI;
    redirectionUrl += `?code=${encodeURI(authorizationCode.code)}`;
    if (params.state) {
      redirectionUrl += `&state=${encodeURI(params.state)}`;
    }

    return res.redirect(302, redirectionUrl);
  }

  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Post('token')
  async getAccessToken(
    @Body() params: AccessTokenRequest,
    @Headers('authorization') authorization: string,
  ) {
    if (params.grant_type === 'authorization_code') {
      if (!authorization) {
        throw new BadRequestException();
      }

      try {
        return await this.oauthService.generateTokenFromAuthorizationCode({
          ...params,
          ...this.oauthService.decodeBasicAuth(authorization),
        });
      } catch {
        return new BadRequestException();
      }
    }
    if (params.grant_type === 'password') {
      return await this.oauthService.generateTokenFromCredentials(params);
    }
    if (params.grant_type === 'refresh_token') {
      return await this.oauthService.generateTokenFromRefreshToken(
        params.refresh_token,
      );
    }
    throw new BadRequestException('Invalid grant_type');
  }

  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Post('register')
  async registerClient(
    @Body() params: RegisterClientRequest,
  ): Promise<SuccessRegisterResponse> {
    return await this.oauthService.registerOAuthClient(params);
  }
}
