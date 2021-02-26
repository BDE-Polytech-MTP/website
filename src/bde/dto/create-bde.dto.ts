import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, MinLength, MaxLength, Min, Max, ArrayNotEmpty } from 'class-validator';

@InputType()
export class SpecialtyDto {
  @Field()
  @MinLength(1)
  @MaxLength(10)
  shortName: string;

  @Field()
  @MinLength(1)
  @MaxLength(100)
  longName: string;

  @Field(() => [Int])
  @ArrayNotEmpty()
  @Min(1, { each: true })
  @Max(5, { each: true })
  years: number[];
}

@InputType()
export class BdeAdminDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(1)
  @MaxLength(30)
  firstname: string;

  @Field()
  @MinLength(1)
  @MaxLength(40)
  lastname: string;
}
