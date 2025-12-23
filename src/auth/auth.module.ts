import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseService } from './firebase.service';
import { AuthGuard } from './guards/auth.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [AuthController],
  providers: [AuthService, FirebaseService, AuthGuard],
  exports: [AuthService, AuthGuard, FirebaseService],
})
export class AuthModule {}
