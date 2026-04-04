import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Engineering', minLength: 3, maxLength: 64 })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'A team focused on developing software solutions.' })
  @IsOptional()
  @IsString()
  description?: string;
}
