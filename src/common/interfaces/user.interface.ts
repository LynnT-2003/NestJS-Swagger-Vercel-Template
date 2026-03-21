import { Types } from 'mongoose';
import { OAuthProviderType } from '../enums/oauth-provider.enum';
import { UserRole } from '../enums/user-role.enum';

// ─── Subdocument Interfaces ────────────────────────────────────────────────────

export interface IOAuthProvider {
    provider: OAuthProviderType;
    providerId: string;
    accessToken: string | null;
}

export interface IRefreshToken {
    token: string; // bcrypt hashed
    createdAt: Date;
    expiresAt: Date;
}

// ─── Full User (internal — never sent to client) ───────────────────────────────

export interface IUser {
    _id: Types.ObjectId;
    email: string | null;
    password: string | null;
    displayName: string;
    avatar: string | null;
    role: UserRole;
    providers: IOAuthProvider[];
    refreshTokens: IRefreshToken[];
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Public User (safe to send to client) ─────────────────────────────────────

export interface IUserPublic {
    _id: Types.ObjectId;
    email: string | null;
    displayName: string;
    avatar: string | null;
    role: UserRole;
    isEmailVerified: boolean;
    providers: Pick<IOAuthProvider, 'provider'>[]; // only expose provider name, not tokens
    createdAt: Date;
    updatedAt: Date;
}

// ─── Current User (lives in JWT, injected by @CurrentUser()) ──────────────────

export interface ICurrentUser {
    userId: string; // stringified ObjectId from JWT sub
    email: string | null;
    role: UserRole;
}