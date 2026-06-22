import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getTrabajadores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Only get trabajadores that belong to empresas owned by this user
    const trabajadores = await prisma.trabajador.findMany({
      where: {
        empresa: {
          userId
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(trabajadores);
  } catch (error) {
    console.error('Error fetching trabajadores:', error);
    res.status(500).json({ error: 'Error al obtener trabajadores' });
  }
};

export const createTrabajador = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const { rut, nombre, sueldoBase, telefono, cargo, empresaId } = req.body;

    // Verify ownership of the empresa
    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa || empresa.userId !== userId) {
      res.status(403).json({ error: 'Empresa no encontrada o acceso denegado' });
      return;
    }

    const newTrabajador = await prisma.trabajador.create({
      data: {
        rut,
        nombre,
        sueldoBase: Number(sueldoBase),
        telefono,
        cargo,
        empresaId
      }
    });

    res.status(201).json(newTrabajador);
  } catch (error) {
    console.error('Error creating trabajador:', error);
    res.status(500).json({ error: 'Error al crear el trabajador (puede que el RUT ya exista)' });
  }
};

export const deleteTrabajador = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify ownership
    const trabajador = await prisma.trabajador.findUnique({
      where: { id },
      include: { empresa: true }
    });
    
    if (!trabajador || trabajador.empresa.userId !== userId) {
      res.status(404).json({ error: 'Trabajador no encontrado o acceso denegado' });
      return;
    }

    await prisma.trabajador.delete({ where: { id } });
    res.json({ message: 'Trabajador eliminado' });
  } catch (error) {
    console.error('Error deleting trabajador:', error);
    res.status(500).json({ error: 'Error al eliminar trabajador' });
  }
};
