import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { register, login, verify, forgotPassword, resetPassword } from './controllers/auth';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// Configuración de Mercado Pago
const mpConfig = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Ruta de Health Check para AWS Elastic Beanstalk
app.get('/', (req, res) => {
  res.status(200).send('API de CB Lunar funcionando correctamente en AWS');
});

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/verify', verify);
app.post('/api/auth/forgot-password', forgotPassword);
app.post('/api/auth/reset-password', resetPassword);

// ==========================================
// RUTAS OPERATIVAS (PROTEGIDAS)
// ==========================================
import { verifyToken } from './middleware/auth';
import { getEmpresas, createEmpresa, deleteEmpresa } from './controllers/empresas';
import { getTrabajadores, createTrabajador, deleteTrabajador } from './controllers/trabajadores';
import { getCargas, createCarga, deleteCarga } from './controllers/cargas';

app.get('/api/empresas', verifyToken, getEmpresas);
app.post('/api/empresas', verifyToken, createEmpresa);
app.delete('/api/empresas/:id', verifyToken, deleteEmpresa);

app.get('/api/trabajadores', verifyToken, getTrabajadores);
app.post('/api/trabajadores', verifyToken, createTrabajador);
app.delete('/api/trabajadores/:id', verifyToken, deleteTrabajador);

app.get('/api/cargas', verifyToken, getCargas);
app.post('/api/cargas', verifyToken, createCarga);
app.delete('/api/cargas/:id', verifyToken, deleteCarga);

// ==========================================
// RUTAS DE MERCADO PAGO
// ==========================================
app.post('/api/create-preference', async (req, res) => {
  try {
    const preference = new Preference(mpConfig);
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'sub_cb_lunar',
            title: 'Suscripción CB Lunar Profesional',
            quantity: 1,
            unit_price: 40000,
            currency_id: 'CLP',
          }
        ],
        back_urls: {
          success: 'https://www.google.com', // Aquí podrías poner una URL tuya
          failure: 'https://www.google.com',
          pending: 'https://www.google.com'
        },
        auto_return: 'approved',
      }
    });

    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error('Error creando preferencia MP:', error);
    res.status(500).json({ error: 'Error al generar link de pago' });
  }
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
app.listen(port, () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${port}`);
  console.log(`📡 Base de datos conectada: Neon PostgreSQL`);
});
