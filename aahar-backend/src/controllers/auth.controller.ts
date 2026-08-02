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
  phone: z.string().optional(),
  role: z.enum(['consumer', 'owner', 'manager', 'auditor', 'admin', 'super_admin']),
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
      return badRequest(res, 'User already exists with this email');
    }

    const { password, phone, ...userData } = validatedData;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        ...userData,
        phone: phone || null,
        passwordHash,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return created(
      res,
      {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone },
      },
      'User registered successfully'
    );
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

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
});

export const updateProfile = async (req: any, res: Response) => {
  try {
    if (!req.user) return unauthorized(res, 'Not authenticated');
    const validatedData = updateProfileSchema.parse(req.body);

    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.password) {
      updateData.passwordHash = await bcrypt.hash(validatedData.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true }
    });

    return ok(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest(res, (error as any).errors[0].message);
    }
    return serverError(res, error);
  }
};
