import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTeamDto {
  @ApiProperty({ example: 'Engineering Team' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'This team is responsible for developing the application.' })
  @IsOptional()
  @IsString()
  description?: string;
}
