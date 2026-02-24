import { Controller, Post, UseGuards, Request, Body, Get, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local')) 
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {

    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard) 
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getFullProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    try {
      return await this.authService.updateProfile(req.user.userId, updateData);
    } catch (error) {
      console.error('Error in updateProfile controller:', error);
      throw error;
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword
    );
  }
}
