import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './entity/user.entity';
import { OAuthUserDto } from './dto/oauth-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserService } from './interfaces/user.service.interface';
import { IUserPublic } from '../common/interfaces/user.interface';
import { OAuthProviderType } from '../common/enums/oauth-provider.enum';

@Injectable()
export class UserService implements IUserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) { }

    // ─── Find By Id ─────────────────────────────────────────────────────────────

    async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    // ─── Find By Email ───────────────────────────────────────────────────────────

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel
            .findOne({ email: email.toLowerCase().trim() })
            .select('+password') // password is excluded by default
            .exec();
    }

    // ─── Create Local User ───────────────────────────────────────────────────────

    async createLocalUser(
        email: string,
        hashedPassword: string,
        displayName: string,
    ): Promise<UserDocument> {
        const existing = await this.userModel.findOne({ email: email.toLowerCase().trim() });

        if (existing) {
            throw new ConflictException('An account with this email already exists');
        }

        const user = new this.userModel({
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            displayName,
            providers: [
                {
                    provider: OAuthProviderType.LOCAL,
                    providerId: email.toLowerCase().trim(),
                    accessToken: null,
                },
            ],
        });

        return user.save();
    }

    // ─── Find Or Create OAuth User ───────────────────────────────────────────────

    async findOrCreateOAuthUser(dto: OAuthUserDto): Promise<UserDocument> {
        // 1. Look up by provider + providerId (compound index hit)
        const byProvider = await this.userModel.findOne({
            providers: {
                $elemMatch: {
                    provider: dto.provider,
                    providerId: dto.providerId,
                },
            },
        });

        if (byProvider) {
            // Update accessToken in case it rotated
            await this.userModel.updateOne(
                {
                    _id: byProvider._id,
                    'providers.provider': dto.provider,
                    'providers.providerId': dto.providerId,
                },
                { $set: { 'providers.$.accessToken': dto.accessToken } },
            );
            return byProvider;
        }

        // 2. Same email exists — link the new provider to the existing account
        if (dto.email) {
            const byEmail = await this.userModel.findOne({
                email: dto.email.toLowerCase().trim(),
            });

            if (byEmail) {
                byEmail.providers.push({
                    provider: dto.provider,
                    providerId: dto.providerId,
                    accessToken: dto.accessToken,
                });
                return byEmail.save();
            }
        }

        // 3. Brand new user
        const user = new this.userModel({
            email: dto.email ? dto.email.toLowerCase().trim() : null,
            displayName: dto.displayName,
            avatar: dto.avatar,
            providers: [
                {
                    provider: dto.provider,
                    providerId: dto.providerId,
                    accessToken: dto.accessToken,
                },
            ],
        });

        return user.save();
    }

    // ─── Update User ─────────────────────────────────────────────────────────────

    async updateUser(
        id: string | Types.ObjectId,
        dto: UpdateUserDto,
    ): Promise<IUserPublic> {
        const user = await this.userModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true })
            .exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.toPublic(user);
    }

    // ─── Refresh Token Management ────────────────────────────────────────────────

    async saveRefreshToken(
        id: string | Types.ObjectId,
        hashedToken: string,
        expiresAt: Date,
    ): Promise<void> {
        // Prune expired tokens first — MongoDB does not allow $push and $pull
        // on the same field in a single operation (throws conflict error code 40)
        await this.userModel.updateOne(
            { _id: id },
            { $pull: { refreshTokens: { expiresAt: { $lt: new Date() } } } },
        );

        await this.userModel.updateOne(
            { _id: id },
            { $push: { refreshTokens: { token: hashedToken, createdAt: new Date(), expiresAt } } },
        );
    }

    async removeRefreshToken(
        id: string | Types.ObjectId,
        hashedToken: string,
    ): Promise<void> {
        await this.userModel.updateOne(
            { _id: id },
            { $pull: { refreshTokens: { token: hashedToken } } },
        );
    }

    async removeAllRefreshTokens(id: string | Types.ObjectId): Promise<void> {
        await this.userModel.updateOne(
            { _id: id },
            { $set: { refreshTokens: [] } },
        );
    }

    // ─── Validate Refresh Token ──────────────────────────────────────────────────
    // Not on the interface — called internally by auth.service.ts.
    // Fetches the user with refreshTokens (+select) and compares hashes.

    async findValidRefreshToken(
        id: string | Types.ObjectId,
        incomingToken: string,
    ): Promise<UserDocument | null> {
        const user = await this.userModel
            .findById(id)
            .select('+refreshTokens')
            .exec();

        if (!user) return null;

        const now = new Date();

        for (const stored of user.refreshTokens) {
            if (stored.expiresAt < now) continue; // skip expired
            const match = await bcrypt.compare(incomingToken, stored.token);
            if (match) return user;
        }

        return null;
    }

    // ─── To Public ───────────────────────────────────────────────────────────────

    toPublic(user: UserDocument): IUserPublic {
        return {
            _id: user._id,
            email: user.email,
            displayName: user.displayName,
            avatar: user.avatar,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            providers: user.providers.map(({ provider }) => ({ provider })),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}