import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsString, ValidateIf } from 'class-validator';

export class AccessTokenRequest {
  // Commmon

  @ApiProperty({
    description: 'The type of granting which is desired to be used',
    enum: ['authorization_code', 'password', 'refresh_token'],
  })
  @IsIn(['authorization_code', 'password', 'refresh_token'])
  grant_type: 'authorization_code' | 'password' | 'refresh_token';

  // Authorization code

  @ApiPropertyOptional({
    description:
      'The authorization code received from the authorization server. **Required** if grant_type is "authorization_code"',
  })
  @ValidateIf((v) => v.grant_type === 'authorization_code')
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description:
      'The ID of the client performing the request. **Required** if grant_type is "authorization_code"',
  })
  @ValidateIf((v) => v.grant_type === 'authorization_code')
  @IsString()
  client_id: string;

  @ApiPropertyOptional({
    description:
      'The secret of the client that is used to authenticate to the authorization server. **Required** if grant_type is "authorization_code"',
  })
  @ValidateIf((v) => v.grant_type === 'authorization_code')
  @IsString()
  client_secret: string;

  // Password

  @ApiPropertyOptional({
    description:
      'The resource owner username. **Required** if grant_type is "password"',
  })
  @ValidateIf((v) => v.grant_type === 'password')
  @IsString()
  username: string;

  @ApiPropertyOptional({
    description:
      'The resource owner password. **Required** if grant_type is "password"',
  })
  @ValidateIf((v) => v.grant_type === 'password')
  @IsString()
  password: string;

  // Refresh token

  @ApiPropertyOptional({
    description:
      'The refresh token issued along the last access token. **Required** if grant_type is "refresh_token"',
  })
  @ValidateIf((v) => v.grant_type === 'refresh_token')
  @IsString()
  refresh_token: string;
}
