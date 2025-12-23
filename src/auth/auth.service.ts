import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(private firebaseService: FirebaseService) {}

  async verifyToken(token: string): Promise<DecodedIdToken> {
    try {
      const auth = this.firebaseService.getAuth();
      const decodedToken = await auth.verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getUserFromFirebaseAuth(uid: string) {
    try {
      const auth = this.firebaseService.getAuth();
      const userRecord = await auth.getUser(uid);
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
        providerData: userRecord.providerData,
      };
    } catch (error) {
      throw new UnauthorizedException('User not found in Firebase Auth');
    }
  }
}
