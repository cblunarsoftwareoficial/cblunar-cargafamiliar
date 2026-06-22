import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getCargas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Only get cargas that belong to trabajadores in empresas owned by this user
    const cargas = await prisma.carga.findMany({
      where: {
        trabajador: {
          empresa: {
            userId
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(cargas);
  } catch (error) {
    console.error('Error fetching cargas:', error);
    res.status(500).json({ error: 'Error al obtener cargas' });
  }
};

export const createCarga = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const { rutCausante, nombre, tipo, fechaNacimiento, estudiando, fechaInicio, numeroResolucion, fechaResolucion, trabajadorId } = req.body;

    // Verify ownership
    const trabajador = await prisma.trabajador.findUnique({
      where: { id: trabajadorId },
      include: { empresa: true }
    });

    if (!trabajador || trabajador.empresa.userId !== userId) {
      res.status(403).json({ error: 'Trabajador no encontrado o acceso denegado' });
      return;
    }

    const newCarga = await prisma.carga.create({
      data: {
        rutCausante,
        nombre,
        tipo,
        fechaNacimiento,
        estudiando: Boolean(estudiando),
        fechaInicio,
        numeroResolucion,
        fechaResolucion,
        trabajadorId
      }
    });

    res.status(201).json(newCarga);
  } catch (error) {
    console.error('Error creating carga:', error);
    res.status(500).json({ error: 'Error al crear la carga (puede que el RUT ya exista)' });
  }
};

export const deleteCarga = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    // Verify ownership
    const carga = await prisma.carga.findUnique({
      where: { id },
      include: {
        trabajador: {
          include: { empresa: true }
        }
      }
    });
    
    if (!carga || carga.trabajador.empresa.userId !== userId) {
      res.status(404).json({ error: 'Carga no encontrada o acceso denegado' });
      return;
    }

    await prisma.carga.delete({ where: { id } });
    res.json({ message: 'Carga eliminada' });
  } catch (error) {
    console.error('Error deleting carga:', error);
    res.status(500).json({ error: 'Error al eliminar carga' });
  }
};
