import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpSecure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    this.logger.log('📧 SMTP configurado com sucesso!');
    this.logger.log(`📮 Servidor: ${smtpHost}:${smtpPort}`);
    this.logger.log(`👤 Usuário: ${smtpUser}`);
    this.logger.log(`🔒 SSL: ${smtpSecure ? 'Ativado' : 'Desativado'}`);
  }

  async sendPasswordResetEmail(
    to: string,
    userName: string,
    resetLink: string,
  ): Promise<void> {
    const emailFrom = this.configService.get<string>('EMAIL_FROM');

    try {
      const info = await this.transporter.sendMail({
        from: emailFrom,
        to,
        subject: 'Redefinição de Senha - Gestão do Bem',
        html: this.getPasswordResetTemplate(userName, resetLink),
        text: `Olá ${userName},\n\nVocê solicitou a redefinição de senha no Sistema Gestão do Bem.\n\nClique no link abaixo para redefinir sua senha:\n${resetLink}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta redefinição, ignore este email.\n\nEquipe Gestão do Bem`,
      });

      this.logger.log('='.repeat(60));
      this.logger.log('📧 EMAIL DE RESET DE SENHA ENVIADO');
      this.logger.log('='.repeat(60));
      this.logger.log(`Para: ${to}`);
      this.logger.log(`Nome: ${userName}`);
      this.logger.log(`De: ${emailFrom}`);
      this.logger.log(`Message ID: ${info.messageId}`);
      this.logger.log('='.repeat(60));
    } catch (error) {
      this.logger.error('❌ Erro ao enviar email:', error);
      throw new Error('Não foi possível enviar o email de recuperação');
    }
  }

  async sendTaskAssignedEmail(
    to: string,
    userName: string,
    taskTitle: string,
    taskDescription: string,
    dueDate: Date | string,
    priority: string,
  ): Promise<void> {
    this.logger.log('='.repeat(60));
    this.logger.log('📋 INICIANDO ENVIO DE EMAIL DE TAREFA');
    this.logger.log('='.repeat(60));
    this.logger.log(`Para: ${to}`);
    this.logger.log(`Nome: ${userName}`);
    this.logger.log(`Tarefa: ${taskTitle}`);
    this.logger.log('='.repeat(60));
    
    const emailFrom = this.configService.get<string>('EMAIL_FROM');

    try {
      const info = await this.transporter.sendMail({
        from: emailFrom,
        to,
        subject: 'Nova Tarefa Atribuída - Gestão do Bem',
        html: this.getTaskAssignedTemplate(userName, taskTitle, taskDescription, dueDate, priority),
        text: `Olá ${userName},\n\nUma nova tarefa foi atribuída a você no Sistema Gestão do Bem.\n\nTarefa: ${taskTitle}\nDescrição: ${taskDescription}\nPrazo: ${new Date(dueDate).toLocaleDateString('pt-BR')}\nPrioridade: ${priority}\n\nAcesse o sistema para visualizar os detalhes.\n\nEquipe Gestão do Bem`,
      });

      this.logger.log('='.repeat(60));
      this.logger.log('📋 EMAIL DE TAREFA ATRIBUÍDA ENVIADO');
      this.logger.log('='.repeat(60));
      this.logger.log(`Para: ${to}`);
      this.logger.log(`Nome: ${userName}`);
      this.logger.log(`Tarefa: ${taskTitle}`);
      this.logger.log(`De: ${emailFrom}`);
      this.logger.log(`Message ID: ${info.messageId}`);
      this.logger.log('='.repeat(60));
    } catch (error) {
      this.logger.error('❌ Erro ao enviar email:', error);
      throw new Error('Não foi possível enviar o email de notificação');
    }
  }

  private getPasswordResetTemplate(userName: string, resetLink: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8080';
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinição de Senha - Gestão do Bem</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #fafafa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                <!-- Header Clean -->
                <tr>
                  <td style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                    <img src="${frontendUrl}/logo-full.png" alt="Gestão do Bem" style="height: 40px; margin-bottom: 16px;" />
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Redefinição de Senha</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 8px; font-size: 15px; color: #666666;">
                      Olá,
                    </p>
                    <p style="margin: 0 0 24px; font-size: 20px; line-height: 1.4; color: #1a1a1a; font-weight: 600;">
                      ${userName}
                    </p>
                    
                    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                      Recebemos uma solicitação para redefinir a senha da sua conta no Sistema Gestão do Bem.
                    </p>
                    
                    <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                      Clique no botão abaixo para criar uma nova senha:
                    </p>
                    
                    <!-- Button Clean -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px;">
                      <tr>
                        <td align="center">
                          <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background-color: #00BFA6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500;">
                            Redefinir Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #f8f8f8; border-left: 3px solid #00BFA6; border-radius: 4px; padding: 16px; margin: 0 0 24px;">
                      <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.6; color: #666666;">
                        Ou copie e cole este link:
                      </p>
                      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #00BFA6; word-break: break-all; font-family: 'Courier New', monospace;">
                        ${resetLink}
                      </p>
                    </div>
                    
                    <!-- Info Box Clean -->
                    <div style="background-color: #fff9e6; border-left: 3px solid #ffb900; border-radius: 4px; padding: 14px; margin: 24px 0;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #7a5f00;">
                        <strong>Importante:</strong> Este link expira em 1 hora por questões de segurança.
                      </p>
                    </div>
                    
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                      Se você não solicitou esta redefinição, pode ignorar este email com segurança.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer Clean -->
                <tr>
                  <td style="padding: 32px 40px; background-color: #f8f8f8; border-top: 1px solid #e8e8e8; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0 0 4px; font-size: 14px; color: #1a1a1a; font-weight: 500;">
                      Equipe Gestão do Bem
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #888888;">
                      Este é um email automático, por favor não responda.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getTaskAssignedTemplate(
    userName: string,
    taskTitle: string,
    taskDescription: string,
    dueDate: Date | string,
    priority: string,
  ): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8080';
    const taskLink = `${frontendUrl}/tasks`;
    
    const priorityColors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
    };
    
    const priorityLabels = {
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
    };
    
    const priorityColor = priorityColors[priority as keyof typeof priorityColors] || '#6b7280';
    const priorityLabel = priorityLabels[priority as keyof typeof priorityLabels] || priority;
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nova Tarefa Atribuída - Gestão do Bem</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #fafafa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                <!-- Header Clean -->
                <tr>
                  <td style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                    <img src="${frontendUrl}/logo-full.png" alt="Gestão do Bem" style="height: 40px; margin-bottom: 16px;" />
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Nova Tarefa Atribuída</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 8px; font-size: 15px; color: #666666;">
                      Olá,
                    </p>
                    <p style="margin: 0 0 24px; font-size: 20px; line-height: 1.4; color: #1a1a1a; font-weight: 600;">
                      ${userName}
                    </p>
                    
                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                      Uma nova tarefa foi atribuída a você no Sistema Gestão do Bem.
                    </p>
                    
                    <!-- Task Card -->
                    <div style="background-color: #f8f8f8; border-left: 3px solid #00BFA6; border-radius: 6px; padding: 20px; margin: 0 0 32px;">
                      <h2 style="margin: 0 0 12px; font-size: 18px; color: #1a1a1a; font-weight: 600;">
                        ${taskTitle}
                      </h2>
                      
                      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #4a4a4a;">
                        ${taskDescription || 'Sem descrição'}
                      </p>
                      
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="display: inline-block; font-size: 13px; color: #666666;">
                              <strong>Prazo:</strong> ${new Date(dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="display: inline-block; font-size: 13px; color: #666666;">
                              <strong>Prioridade:</strong>
                            </span>
                            <span style="display: inline-block; margin-left: 8px; padding: 4px 12px; background-color: ${priorityColor}; color: #ffffff; border-radius: 4px; font-size: 12px; font-weight: 500;">
                              ${priorityLabel}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Button Clean -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
                      <tr>
                        <td align="center">
                          <a href="${taskLink}" style="display: inline-block; padding: 14px 32px; background-color: #00BFA6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500;">
                            Ver Tarefa
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
                      Acesse o sistema para visualizar todos os detalhes e gerenciar suas tarefas.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer Clean -->
                <tr>
                  <td style="padding: 32px 40px; background-color: #f8f8f8; border-top: 1px solid #e8e8e8; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0 0 4px; font-size: 14px; color: #1a1a1a; font-weight: 500;">
                      Equipe Gestão do Bem
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #888888;">
                      Este é um email automático, por favor não responda.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(
    to: string,
    userName: string,
    password: string,
  ): Promise<void> {
    const emailFrom = this.configService.get<string>('EMAIL_FROM');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8080';

    try {
      this.logger.log('='.repeat(60));
      this.logger.log('🎉 INICIANDO ENVIO DE EMAIL DE BOAS-VINDAS');
      this.logger.log('='.repeat(60));
      this.logger.log(`Para: ${to}`);
      this.logger.log(`Nome: ${userName}`);
      this.logger.log('='.repeat(60));

      const info = await this.transporter.sendMail({
        from: emailFrom,
        to,
        subject: 'Bem-vindo ao Gestão do Bem - Seus dados de acesso',
        html: this.getWelcomeTemplate(userName, to, password, frontendUrl),
        text: `Olá ${userName},\n\nBem-vindo ao Sistema Gestão do Bem!\n\nSua conta foi criada com sucesso. Abaixo estão seus dados de acesso:\n\nEmail: ${to}\nSenha: ${password}\n\nAcesse o sistema em: ${frontendUrl}\n\nRecomendamos que você altere sua senha após o primeiro acesso.\n\nEquipe Gestão do Bem`,
      });

      this.logger.log('='.repeat(60));
      this.logger.log('🎉 EMAIL DE BOAS-VINDAS ENVIADO');
      this.logger.log('='.repeat(60));
      this.logger.log(`Para: ${to}`);
      this.logger.log(`Nome: ${userName}`);
      this.logger.log(`De: ${emailFrom}`);
      this.logger.log(`Message ID: ${info.messageId}`);
      this.logger.log('='.repeat(60));
    } catch (error) {
      this.logger.error('❌ Erro ao enviar email de boas-vindas:', error);
      // Não lança erro para não impedir a criação do usuário
    }
  }

  private getWelcomeTemplate(
    userName: string,
    email: string,
    password: string,
    frontendUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo - Gestão do Bem</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #fafafa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                    <img src="${frontendUrl}/logo-full.png" alt="Gestão do Bem" style="height: 40px; margin-bottom: 16px;" />
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Bem-vindo! 🎉</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 8px; font-size: 15px; color: #666666;">
                      Olá,
                    </p>
                    <p style="margin: 0 0 24px; font-size: 20px; line-height: 1.4; color: #1a1a1a; font-weight: 600;">
                      ${userName}
                    </p>
                    
                    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                      Sua conta no <strong>Sistema Gestão do Bem</strong> foi criada com sucesso! Abaixo estão seus dados de acesso:
                    </p>
                    
                    <!-- Credentials Box -->
                    <div style="background-color: #f0faf8; border: 1px solid #00BFA6; border-radius: 8px; padding: 24px; margin: 0 0 24px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0;">
                            <p style="margin: 0; font-size: 13px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                            <p style="margin: 4px 0 0; font-size: 16px; color: #1a1a1a; font-weight: 500;">${email}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; border-top: 1px solid #e0f2ef;">
                            <p style="margin: 0; font-size: 13px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Senha</p>
                            <p style="margin: 4px 0 0; font-size: 16px; color: #1a1a1a; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 1px;">${password}</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Button -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px;">
                      <tr>
                        <td align="center">
                          <a href="${frontendUrl}/login" style="display: inline-block; padding: 14px 32px; background-color: #00BFA6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500;">
                            Acessar o Sistema
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Warning Box -->
                    <div style="background-color: #fff9e6; border-left: 3px solid #ffb900; border-radius: 4px; padding: 14px; margin: 24px 0;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #7a5f00;">
                        <strong>Segurança:</strong> Recomendamos que você altere sua senha após o primeiro acesso.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 32px 40px; background-color: #f8f8f8; border-top: 1px solid #e8e8e8; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0 0 4px; font-size: 14px; color: #1a1a1a; font-weight: 500;">
                      Equipe Gestão do Bem
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #888888;">
                      Este é um email automático, por favor não responda.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
