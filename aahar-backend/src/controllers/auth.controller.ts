import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { ok, badRequest, created, unauthorized, serverError, notFound } from '../utils/response.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
  role: z.enum(['consumer', 'owner', 'hotel_manager', 'auditor', 'admin', 'super_admin']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return badRequest(res, 'User already exists');
    }

    const { password, ...userData } = validatedData;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
      },
    });

    return created(res, { id: user.id, email: user.email, name: user.name, role: user.role }, 'User registered successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest(res, (error as any).errors[0].message);
    }
    return serverError(res, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !(await bcrypt.compare(validatedData.password, user.passwordHash))) {
      return unauthorized(res, 'Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return ok(res, { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }, 'Login successful');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest(res, (error as any).errors[0].message);
    }
    return serverError(res, error);
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    if (!req.user) return unauthorized(res, 'Not authenticated');

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      return notFound(res as any, 'User not found');
    }

    return ok(res, user);
  } catch (error) {
    return serverError(res, error);
  }
};
