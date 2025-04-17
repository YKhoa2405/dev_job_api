import { Controller, Get, Post, Render, UseGuards, Request, Req, Res } from '@nestjs/common';
import { Public, User } from 'src/common/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesService } from 'src/roles/roles.service';
import { IUser } from 'src/users/users.interface';
import { Response } from 'express';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rolesService: RolesService

  ) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('currentUser')
  async getCurrenUser(@User() user: IUser) {
    const temp = await this.rolesService.getRoleDetail(user.role._id) as any
    user.permissions = temp.permissions
    return { user }
  }

  // Giao diện login google
  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google')
  async google() { }


  // Xử lý callback từ Google sau khi người dùng đăng nhập thành công
  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res: Response) {
    const loginResponse = await this.authService.login(req.user);

    console.log('Access Token:', loginResponse.access_token);

    // return {
    //   message: 'Google login successful',
    //   user:req.user,
    //   access_token: token,
    // };
  }


  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async github() {

  }


  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res() res: Response) {
    try {
      const user = req.user;
      const loginResponse = await this.authService.login(user);
      console.log('userDate', req.user)
      console.log('Access Token:', loginResponse.access_token);
      const redirectUri = `devjob:/oauth?token=${loginResponse.access_token}`;
      res.redirect(redirectUri);
    } catch (error) {
      console.error('Error:', error);
    }
  }

}
