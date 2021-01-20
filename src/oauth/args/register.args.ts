import { IsIn, IsString, IsUrl, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClientRequest {
  @ApiProperty({
    description: 'The type of client to be registered as',
    enum: ['public', 'confidential'],
  })
  @IsIn(['public', 'confidential'])
  client_type: string;

  @ApiProperty({
    description:
      'The name to be displayed to the client when asking authorization',
  })
  @MinLength(1)
  @IsString()
  client_name: string;

  @ApiProperty({ description: 'The redirect URI for the OAuth2 protocol ' })
  @IsUrl()
  redirect_uri: string;
}
