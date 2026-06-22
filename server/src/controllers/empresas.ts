import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getEmpresas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const empresas = await prisma.empresa.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(empresas);
  } catch (error) {
    console.error('Error fetching empresas:', error);
    res.status(500).json({ error: 'Error al obtener empresas' });
  }
};

export const createEmpresa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const { rut, razonSocial, telefono, email } = req.body;

    const newEmpresa = await prisma.empresa.create({
      data: {
        rut,
        razonSocial,
        telefono,
        email,
        userId
      }
    });

    res.status(201).json(newEmpresa);
  } catch (error: any) {
    console.error('Error creating empresa in DB:', error?.message || error);
    res.status(500).json({ error: `Error DB: ${error?.message || 'Desconocido'}` });
  }
};

export const deleteEmpresa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify ownership
    const empresa = await prisma.empresa.findUnique({ where: { id } });
    if (!empresa || empresa.userId !== userId) {
      res.status(404).json({ error: 'Empresa no encontrada o acceso denegado' });
      return;
    }

    await prisma.empresa.delete({ where: { id } });
    res.json({ message: 'Empresa eliminada' });
  } catch (error) {
    console.error('Error deleting empresa:', error);
    res.status(500).json({ error: 'Error al eliminar empresa' });
  }
};
