import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123token456' })
  @IsString()
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string;

  @ApiProperty({ example: 'NovaSenha123!' })
  @IsString()
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  newPassword: string;
}
