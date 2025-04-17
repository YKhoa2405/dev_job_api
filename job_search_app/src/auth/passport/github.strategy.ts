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
            callbackURL: 'http://192.168.1.120:8000/auth/github/callback', // URL callback
            // callbackURL: 'devjob:/oauth',
            scope: ['user:email'],  // Scope lấy email
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {

        const { emails, photos, username, id } = profile;
        const userData = {
          githubId: id, // Lưu ID GitHub để đồng bộ
          email: emails?.[0]?.value || `${username}@github.com`, // Fallback nếu không có email
          avatar: photos?.[0]?.value,
          username: username || profile.displayName,
          role: { name: 'NORMAL_USER' },
        };

        const user = await this.userService.findOrCreate(userData);
        return user;
    }
}
