import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Equals, IsOptional, IsString } from 'class-validator';

export class AuthorizationRequestArgs {
  @ApiProperty({
    description: 'The type of response which is desired',
    enum: ['code'],
    default: 'code',
  })
  @Equals('code')
  response_type: string;

  @ApiProperty({
    description: 'The ID of the client to grant scopes authorization to',
  })
  @IsString()
  client_id: string;

  @ApiProperty({
    description: 'Space-separated list of scopes to grant to the client',
  })
  @IsString()
  scope: string;

  @ApiPropertyOptional({
    description:
      'An opaque value used by the client to maintain state between the request and callback',
  })
  @IsString()
  @IsOptional()
  state: string;
}
