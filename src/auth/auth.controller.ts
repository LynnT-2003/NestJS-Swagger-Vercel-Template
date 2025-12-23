import { Controller, Get, Post, UseGuards, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from './guards/auth.guard';
import { User } from './decorators/user.decorator';
import {
  VerifyTokenDto,
  VerifyTokenResponseDto,
  GetUserResponseDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('verify')
  @ApiOperation({
    summary: 'Verify Firebase token and create/update user',
    description:
      'Verifies a Firebase ID token and creates or updates the user in Firestore. This endpoint should be called after the user signs in with Firebase (Email/Password, Google, or Facebook).',
  })
  @ApiBody({ type: VerifyTokenDto })
  @ApiResponse({
    status: 201,
    description: 'Token verified successfully and user created/updated',
    type: VerifyTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or expired token',
      },
    },
  })
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    const { token, username } = verifyTokenDto;

    // Verify Firebase token
    const decodedToken = await this.authService.verifyToken(token);

    // Get user from Firebase Auth
    const firebaseUser = await this.authService.getUserFromFirebaseAuth(
      decodedToken.uid,
    );

    // Use provided username or generate from email/displayName
    let finalUsername = username;
    if (!finalUsername) {
      finalUsername =
        firebaseUser.displayName ||
        firebaseUser.email?.split('@')[0] ||
        `user_${decodedToken.uid.substring(0, 8)}`;
    }

    // Create or update user in Firestore
    const user = await this.userService.createOrUpdateUser({
      uid: decodedToken.uid,
      username: finalUsername,
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        username: user.username,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      },
    };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current authenticated user',
    description:
      'Returns the current authenticated user information. Requires a valid Firebase ID token in the Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: GetUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid token',
      },
    },
  })
  async getCurrentUser(@User() user: any) {
    const firestoreUser = await this.userService.getUserByUid(user.uid);

    if (!firestoreUser) {
      return {
        success: false,
        message: 'User not found in database',
      };
    }

    const firebaseUser = await this.authService.getUserFromFirebaseAuth(
      user.uid,
    );

    return {
      success: true,
      user: {
        uid: firestoreUser.uid,
        username: firestoreUser.username,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        createdAt: firestoreUser.createdAt,
      },
    };
  }

  @UseGuards(AuthGuard)
  @Get('user/:uid')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user by UID',
    description:
      'Retrieves user information by their Firebase UID. Requires authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: GetUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        success: false,
        message: 'User not found',
      },
    },
  })
  async getUserById(@Param('uid') uid: string) {
    const firestoreUser = await this.userService.getUserByUid(uid);

    if (!firestoreUser) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const firebaseUser = await this.authService.getUserFromFirebaseAuth(uid);

    return {
      success: true,
      user: {
        uid: firestoreUser.uid,
        username: firestoreUser.username,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        createdAt: firestoreUser.createdAt,
      },
    };
  }
}
