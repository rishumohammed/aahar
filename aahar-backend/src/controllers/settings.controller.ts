import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getSetting = async (req: Request, res: Response) => {
  try {
    const key = req.params.key as string;

    const setting = await prisma.siteSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json(setting.value);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  try {
    const key = req.params.key as string;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ message: 'Value is required' });
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    res.json(setting.value);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
