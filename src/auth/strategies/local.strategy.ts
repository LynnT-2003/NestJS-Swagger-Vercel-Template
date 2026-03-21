import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email', // tell passport to use email instead of username
            passwordField: 'password',
        });
    }

    // Passport calls this automatically when LocalGuard is triggered.
    // Returning the user attaches it to req.user.
    // Throwing stops the request with 401.
    async validate(email: string, password: string) {
        const user = await this.authService.validateLocalUser(email, password);

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return user;
    }
}