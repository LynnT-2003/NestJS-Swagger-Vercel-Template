import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;
  private firestore: admin.firestore.Firestore;
  private readonly isEnabled: boolean;
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {
    const enabled = this.configService.get<string>('FIREBASE_ENABLED', 'true');
    // Accept false/0 (any casing) as off, everything else defaults to on.
    this.isEnabled =
      enabled?.toLowerCase() !== 'false' && enabled?.trim() !== '0';
  }

  onModuleInit() {
    if (!this.isEnabled) {
      this.logger.warn(
        'Firebase disabled via FIREBASE_ENABLED=false. Skipping initialization.',
      );
      return;
    }

    // Check if Firebase app already exists
    try {
      this.firebaseApp = admin.app();
      this.firestore = admin.firestore();
      return;
    } catch (error) {
      // App doesn't exist, initialize it
    }

    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error(
        'Firebase configuration is missing. Please check your .env file.',
      );
    }

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });

    this.firestore = admin.firestore();
  }

  getAuth(): admin.auth.Auth {
    this.ensureInitialized();
    return admin.auth();
  }

  getFirestore(): admin.firestore.Firestore {
    this.ensureInitialized();
    return this.firestore;
  }

  getApp(): admin.app.App {
    this.ensureInitialized();
    return this.firebaseApp;
  }

  private ensureInitialized() {
    if (!this.isEnabled) {
      throw new Error(
        'Firebase is disabled. Set FIREBASE_ENABLED=true in your .env to use Firebase features.',
      );
    }
    if (!this.firebaseApp) {
      throw new Error('Firebase not initialized.');
    }
  }
}
