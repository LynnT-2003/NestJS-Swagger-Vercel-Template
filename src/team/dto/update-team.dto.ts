import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateTeamDto {
  @ApiProperty({ example: 'Engineering Team', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  name?: string;

  @ApiProperty({ example: 'This team is responsible for developing the application.', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
