import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Engineering', minLength: 3, maxLength: 64 })
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  name: string;

  @ApiProperty({ example: 'A team focused on developing software solutions.' })
  @IsString()
  description: string;
}
