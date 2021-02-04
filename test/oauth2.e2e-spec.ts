import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { Connection, Repository } from 'typeorm';
import * as dbMock from './mock/db';
import { OAuthClient } from '../src/models/oauth-client.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('OauthController (e2e)', () => {
  let app: INestApplication;
  let clientsRepository: Repository<OAuthClient>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (name) => {
          if (name === 'DATABASE_URL') {
            return process.env.DATABASE_URL_TEST;
          }
          return process.env[name];
        },
      })
      .compile();

    await dbMock.applyFixtures(moduleFixture.get(Connection), 'oauth2');
    clientsRepository = moduleFixture.get(getRepositoryToken(OAuthClient));

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/oauth/register (POST)', async () => {
    const result = await request(app.getHttpServer())
      .post('/oauth/register')
      .send({
        client_type: 'public',
        client_name: 'BDE Montpellier',
        redirect_uri: 'https://localhost:5000/callback',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('client_id');
        expect(res.body).toHaveProperty('client_secret');
      });
    const client = await clientsRepository.findOne(result.body.client_id);
    expect(client).toBeTruthy();
  });

  it.skip('/oauth/authorize (GET)', async () => {
    const clientId = 'ae6e043e-91bd-4a2d-9abd-1217736ca40b';
    return request(app.getHttpServer())
      .get(`/oauth/authorize?client_id=${clientId}&response_type=code`)
      .expect(200)
      .expect(/BDE-Montpellier/);
  });

  afterEach(async () => {
    await app.close();
  });
});
