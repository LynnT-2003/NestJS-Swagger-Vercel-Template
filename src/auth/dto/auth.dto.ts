import { ApiProperty } from '@nestjs/swagger';

export class VerifyTokenDto {
  @ApiProperty({
    description: 'Firebase ID token from client authentication',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Optional username for the user',
    example: 'john_doe',
    required: false,
  })
  username?: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'abc123xyz' })
  uid: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  email?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  displayName?: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
  photoURL?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  createdAt?: Date;
}

export class VerifyTokenResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class GetUserResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: UserResponseDto, required: false })
  user?: UserResponseDto;

  @ApiProperty({ example: 'User not found', required: false })
  message?: string;
}
