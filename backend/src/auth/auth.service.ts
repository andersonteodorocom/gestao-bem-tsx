import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}


  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    console.log('[Auth] validateUser email:', email);

    if (!user) {
      console.warn('[Auth] validateUser: user not found');
      return null;
    }
    const isPasswordMatching = await bcrypt.compare(pass, user.passwordHash);
    console.log('[Auth] validateUser: user found, password match =', isPasswordMatching);
    if (isPasswordMatching) {
      const { passwordHash, ...result } = user;
      return result;
    } else {
      return null;
    }
  }
  async login(user: any) {
    const payload = {
      sub: user.id, 
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    };
    return {
      access_token: this.jwtService.sign(payload)
    };
  }

  async getFullProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: number, updateData: any) {
    try {
      console.log('UpdateProfile - userId:', userId);
      console.log('UpdateProfile - updateData:', updateData);

      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new Error('User not found');
      }

      console.log('User found:', user.email);

      // Atualizar campos básicos
      if (updateData.fullName !== undefined) {
        user.fullName = updateData.fullName;
      }
      if (updateData.email !== undefined) {
        user.email = updateData.email;
      }
      if (updateData.phone !== undefined) {
        user.phone = updateData.phone || null;
      }

      // Atualizar senha se fornecida
      if (updateData.currentPassword && updateData.newPassword) {
        console.log('Attempting to update password...');
        const isPasswordValid = await bcrypt.compare(updateData.currentPassword, user.passwordHash);
        
        if (!isPasswordValid) {
          console.error('Current password is incorrect');
          throw new Error('Senha atual incorreta');
        }

        const hashedPassword = await bcrypt.hash(updateData.newPassword, 10);
        user.passwordHash = hashedPassword;
        console.log('Password updated successfully');
      }

      await this.userRepository.save(user);
      console.log('User saved successfully');

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      return { 
        message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.' 
      };
    }

    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expira em 1 hora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;

    await this.userRepository.save(user);

    // Enviar email com link de reset
    const resetLink = `http://localhost:8080/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.fullName,
      resetLink,
    );

    return {
      message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Hash do token recebido
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar usuário com token válido e não expirado
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado. Solicite um novo link de redefinição.');
    }

    // Atualizar senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await this.userRepository.save(user);

    console.log(`✅ Senha redefinida com sucesso para o usuário: ${user.email}`);

    return {
      message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.',
    };
  }
}
