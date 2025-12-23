import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../auth/firebase.service';

export interface CreateUserDto {
  uid: string;
  username: string;
}

export interface User {
  uid: string;
  username: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UserService {
  private readonly usersCollection = 'users';

  constructor(private firebaseService: FirebaseService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const firestore = this.firebaseService.getFirestore();

    // Check if username already exists
    const usernameQuery = await firestore
      .collection(this.usersCollection)
      .where('username', '==', createUserDto.username)
      .limit(1)
      .get();

    if (!usernameQuery.empty) {
      throw new ConflictException('Username already exists');
    }

    // Check if user with this UID already exists
    const userDoc = await firestore
      .collection(this.usersCollection)
      .doc(createUserDto.uid)
      .get();

    if (userDoc.exists) {
      throw new ConflictException('User already exists');
    }

    const userData: User = {
      uid: createUserDto.uid,
      username: createUserDto.username,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await firestore
      .collection(this.usersCollection)
      .doc(createUserDto.uid)
      .set(userData);

    return userData;
  }

  async getUserByUid(uid: string): Promise<User | null> {
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore
      .collection(this.usersCollection)
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      return null;
    }

    return userDoc.data() as User;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const firestore = this.firebaseService.getFirestore();
    const query = await firestore
      .collection(this.usersCollection)
      .where('username', '==', username)
      .limit(1)
      .get();

    if (query.empty) {
      return null;
    }

    return query.docs[0].data() as User;
  }

  async updateUser(uid: string, updateData: Partial<User>): Promise<User> {
    const firestore = this.firebaseService.getFirestore();
    const userDoc = firestore.collection(this.usersCollection).doc(uid);

    const updatePayload = {
      ...updateData,
      updatedAt: new Date(),
    };

    await userDoc.update(updatePayload);

    const updatedDoc = await userDoc.get();
    return updatedDoc.data() as User;
  }

  async createOrUpdateUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.getUserByUid(createUserDto.uid);

    if (existingUser) {
      // Update username if different
      if (existingUser.username !== createUserDto.username) {
        // Check if new username is available
        const usernameExists = await this.getUserByUsername(
          createUserDto.username,
        );
        if (usernameExists && usernameExists.uid !== createUserDto.uid) {
          throw new ConflictException('Username already exists');
        }
        return this.updateUser(createUserDto.uid, {
          username: createUserDto.username,
        });
      }
      return existingUser;
    }

    // Create new user
    return this.createUser(createUserDto);
  }
}
