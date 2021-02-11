import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

@InputType()
export class SpecialtyDto {
  @Field()
  @MinLength(1)
  shortName: string;

  @Field()
  @MinLength(1)
  longName: string;

  @Field(() => [Int])
  years: number[];
}

@InputType()
export class BdeAdminDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(1)
  firstname: string;

  @Field()
  @MinLength(1)
  lastname: string;
}
