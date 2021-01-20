import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuthClient } from './models/oauth-client.entity';
import { Repository } from 'typeorm';
import { RegisterClientRequest } from './args/register.args';
import { uid } from 'rand-token';
import { ResourceOwner } from './models/resource-owner.entity';
import { OAuthAuthorizationCode } from './models/oauth-authorization-code.entity';
import { OAuthToken } from './models/oauth-token.entity';
import * as jwt from 'jsonwebtoken';
import moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { JWT_SECRET } from '../config/security';
import { PasswordService } from '../password/password.service';

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(OAuthClient)
    private oauthClientsRepository: Repository<OAuthClient>,
    @InjectRepository(OAuthAuthorizationCode)
    private oauthAuthorizationCodeRepository: Repository<OAuthAuthorizationCode>,
    @InjectRepository(OAuthToken)
    private oauthTokenRepository: Repository<OAuthToken>,
    @InjectRepository(ResourceOwner)
    private resourceOwnersRepository: Repository<ResourceOwner>,
    private config: ConfigService,
    private passwordService: PasswordService
  ) {
  }

  /**
   * Retrieves a client from it's ID.
   *
   * @param clientId the ID of the client to retrieve
   * @returns the client or undefined if no client with the given ID was found
   */
  async getOAuthClient(clientId: string): Promise<OAuthClient> {
    return this.oauthClientsRepository.findOne(clientId);
  }

  /**
   * Generates the OAuth authorization code as described in the section 4.1
   * of RFC-6749. (see https://tools.ietf.org/html/rfc6749#section-4.1)
   *
   * @param client the client that requested the authorization code
   * @param scopes the scopes requested by the client
   * @param resourceOwner The resource owner that granted authorization
   */
  async generateOAuthAuthorizationCode(
    client: OAuthClient,
    scopes: string[],
    resourceOwner: ResourceOwner,
  ): Promise<OAuthAuthorizationCode> {
    const authCode = new OAuthAuthorizationCode();
    authCode.code = uid(32);
    authCode.issued_at = new Date();
    authCode.client = client;
    authCode.scopes = scopes;
    authCode.resource_owner = resourceOwner;

    return this.oauthAuthorizationCodeRepository.save(authCode);
  }

  /**
   * Registers a new OAuth client and returns the generated client_id and client_secret
   * for this new client.
   *
   * @param args the information provided by the client for it's registration
   * @returns the client_id and client_secret
   */
  async registerOAuthClient(
    args: RegisterClientRequest,
  ): Promise<{ client_id: string; client_secret: string }> {
    const client = new OAuthClient();
    client.redirect_uri = args.redirect_uri;
    client.client_name = args.client_name;
    client.client_type = args.client_type;
    client.client_secret = uid(32);

    try {
      await this.oauthClientsRepository.save(client);
      return {
        client_id: client.client_id,
        client_secret: client.client_secret,
      };
    } catch (e) {
      if (e.constraint && e.constraint === 'UQ_client_name') {
        throw new BadRequestException('client_name is already taken');
      }
      throw e;
    }
  }

  /**
   * Generates an access_token with a refresh_token from the given authorization code. The generation is aborted
   * if :
   *  - the given authorization code does not exist,
   *  - the given authorization code was already used (in the case, the tokens previously generated using this code
   *    are also revoked for security reasons)
   *  - the client were unable to authenticate (bad client_id/client_secret combination)
   *  - the identified client is not the one who generated the authorization token
   *  - the authorization code is expired (an authorization token is valid for 10 minutes)
   *
   * @param params an object containing the following properties:
   *                  - code: the authorization provided by the server to the client when authorization were granted by the resource owner
   *                  - client_id: the ID of the client requesting the access token, used to verify client identity
   *                  - client_secret: the password of the client requesting the access token, used to verify the client identity
   *
   * @returns the access_token and refresh_token
   */
  async generateTokenFromAuthorizationCode(params: {
    code: string;
    client_id: string;
    client_secret: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    const authCode = await this.oauthAuthorizationCodeRepository.findOne({
      where: [
        {
          code: params.code,
        },
      ],
      relations: ['client', 'token', 'resource_owner'],
    });

    if (authCode === undefined) {
      throw new BadRequestException('Invalid code');
    }

    if (authCode.hasAlreadyBeenUsed()) {
      try {
        await this.oauthTokenRepository.delete(authCode.token);
      } catch (_) {
      }
      throw new BadRequestException('Invalid code');
    }

    if (!authCode.hasBeenGeneratedBy(params.client_id, params.client_secret)) {
      throw new BadRequestException('Invalid code');
    }

    if (authCode.isExpired()) {
      throw new BadRequestException('Invalid code');
    }

    const token = new OAuthToken();
    this.generateAccessToken(token);
    token.refresh_token = uid(32);
    token.generation_code = authCode;
    token.resource_owner = authCode.resource_owner;
    token.scopes = authCode.scopes;

    await this.oauthTokenRepository.save(token);
    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    };
  }

  /**
   * Generates an access_token with a refresh_token from the resource owner's credentials.
   *
   * @param params an object containing the following properties:
   *                    - username: the username of the resource owner
   *                    - password: the plain-text password of the resource owner
   *
   * @returns the access_token and the refresh_token
   */
  async generateTokenFromCredentials(params: {
    username: string;
    password: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    const resource_owner = await this.resourceOwnersRepository.findOne({
      where: [{ email: params.username }],
    });
    if (resource_owner === undefined) {
      throw new BadRequestException('Bad credentials');
    }
    if (resource_owner.password === null) {
      throw new BadRequestException('Bad credentials');
    }
    const validPassword = await this.passwordService.checkPassword(params.password, resource_owner.password);
    if (!validPassword) {
      throw new BadRequestException('Bad credentials');
    }

    const token = new OAuthToken();
    this.generateAccessToken(token);
    token.refresh_token = uid(32);
    token.scopes = ['all'];
    token.resource_owner = resource_owner;

    return await this.oauthTokenRepository.save(token);
  }

  /**
   * Generates a new access token from a refresh token.
   *
   * @param refreshToken The refresh token issued on last access token generation
   *
   * @returns a new access_token and a refresh_token
   */
  async generateTokenFromRefreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const token = await this.oauthTokenRepository.findOne({
      where: { refresh_token: refreshToken },
    });
    if (token === undefined) {
      throw new BadRequestException('Invalid token');
    }
    const oldTokenContent = jwt.decode(token.access_token, { json: true });
    this.generateAccessToken(token, oldTokenContent);
    await this.oauthTokenRepository.save(token);
    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    };
  }

  /**
   * Generates the access_token field of the given token.
   *
   * @param token The token to refresh access_token of
   * @param content The content of the JWT to generate
   * @private
   */
  private generateAccessToken(token: OAuthToken, content: object = {}) {
    token.issued_at = new Date();
    token.expires_at = moment(token.issued_at).add(2, 'hours').toDate();
    let jwtContent = {
      ...content,
      iat: (token.issued_at.getTime() / 1000) | 0,
      exp: (token.expires_at.getTime() / 1000) | 0,
    };

    token.access_token = jwt.sign(jwtContent, this.config.get(JWT_SECRET), {
      algorithm: 'HS256',
    });
  }
}
