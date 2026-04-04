import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTeamDto {
  @ApiProperty({ example: 'Engineering', minLength: 3, maxLength: 64 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiProperty({ example: 'A team focused on developing software solutions.' })
  @IsOptional()
  @IsString()
  description?: string;
}
