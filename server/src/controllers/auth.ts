import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'cb-lunar-secret-key-super-secure';

// Configurar el transporter de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // O el servicio que use (ej. outlook)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'El correo ya está registrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        verificationCode,
        isVerified: false
      }
    });

    // Enviar correo con Nodemailer
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'tu_correo@gmail.com') {
      await transporter.sendMail({
        from: `"CB Lunar" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Código de Verificación - CB Lunar',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Verifica tu cuenta</h2>
            <p>Hola ${name},</p>
            <p>Tu código de verificación de 6 dígitos es:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #7000FF; background: #f4f4f4; padding: 10px; text-align: center; border-radius: 8px;">${verificationCode}</h1>
            <p>Ingresa este código en la aplicación para activar tu cuenta.</p>
          </div>
        `
      });
      console.log(`[AUTH] Correo enviado a ${email} mediante Nodemailer.`);
    } else {
      console.log(`[DESARROLLO] Código de verificación para ${email}: ${verificationCode}`);
      console.log(`(Por favor, configura SMTP_USER y SMTP_PASS en server/.env para enviar correos reales)`);
    }

    res.status(201).json({
      message: 'Código de verificación enviado al correo',
      requireVerification: true,
      email: user.email
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña obligatorios' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ error: 'Debes verificar tu correo electrónico antes de iniciar sesión' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const verify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Faltan datos de verificación' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: 'El usuario ya está verificado' });
      return;
    }

    if (user.verificationCode !== code) {
      res.status(400).json({ error: 'Código de verificación incorrecto' });
      return;
    }

    // Código correcto, marcar como verificado
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null
      }
    });

    // Iniciar sesión automáticamente
    const token = jwt.sign({ userId: updatedUser.id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'Cuenta verificada exitosamente',
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    });
  } catch (error) {
    console.error('Error in verify:', error);
    res.status(500).json({ error: 'Error interno del servidor al verificar' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'El correo electrónico es obligatorio' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Devolver éxito incluso si no existe para evitar enumeración de correos
      res.status(200).json({ message: 'Si el correo existe, se ha enviado un código de recuperación' });
      return;
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { email },
      data: { verificationCode }
    });

    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'tu_correo@gmail.com') {
      await transporter.sendMail({
        from: `"CB Lunar" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Recuperación de Contraseña - CB Lunar',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Recuperación de contraseña</h2>
            <p>Hola ${user.name},</p>
            <p>Tu código para recuperar tu contraseña es:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #7000FF; background: #f4f4f4; padding: 10px; text-align: center; border-radius: 8px;">${verificationCode}</h1>
            <p>Si no solicitaste esto, ignora este correo.</p>
          </div>
        `
      });
    } else {
      console.log(`[DESARROLLO] Código de recuperación para ${email}: ${verificationCode}`);
    }

    res.status(200).json({ message: 'Código enviado al correo electrónico' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      res.status(400).json({ error: 'Faltan datos para restablecer la contraseña' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.verificationCode !== code) {
      res.status(400).json({ error: 'Código de recuperación inválido o expirado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationCode: null
      }
    });

    res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
