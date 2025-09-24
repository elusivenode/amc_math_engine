import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/[A-Za-z]/, {
    message: 'password must contain at least one letter',
  })
  @Matches(/[0-9]/, {
    message: 'password must contain at least one number',
  })
  password!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  displayName?: string;
}
