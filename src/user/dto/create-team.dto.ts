import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Engineering Team' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'This team is responsible for developing the application.' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
