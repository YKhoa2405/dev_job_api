import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from "@nestjs/config";
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
        private userService: UsersService) {
        super({
            clientID: configService.get<string>('GITHUB_CLIENT_ID'),
            clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
            callbackURL: 'http://localhost:3000/auth/github/callback', // URL callback
            scope: ['user:email'],  // Scope lấy email
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {

        const { emails, photos } = profile;
        const userData = {
            email: emails[0].value,
            avatar: photos[0].value,

        };

        return this.userService.findOrCreate(userData)
    }
}
