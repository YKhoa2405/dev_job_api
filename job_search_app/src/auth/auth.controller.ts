import { Controller, Get, Post, Render, UseGuards, Request, Req, Res } from '@nestjs/common';
import { Public } from 'src/common/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('currentUser')
  getProfile(@Request() req) {
    return req.user;
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


  // Giao diện login google
  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async github() {

  }


  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res() res: Response) {

    const loginResponse = await this.authService.login(req.user);
    console.log('userDate', req.user)
    console.log('Access Token:', loginResponse.access_token);


  }

}
