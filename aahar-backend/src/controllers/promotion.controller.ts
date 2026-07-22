import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const listPromotions = async (req: Request, res: Response) => {
  try {
    const { isActive, position } = req.query;
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === "true";
    if (position) where.position = String(position);

    const promotions = await prisma.promotion.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: promotions });
  } catch (error) {
    console.error("List promotions error:", error);
    res.status(500).json({ success: false, message: "Failed to list promotions" });
  }
};

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const promotion = await prisma.promotion.create({ data });
    res.json({ success: true, data: promotion, message: "Promotion created successfully" });
  } catch (error) {
    console.error("Create promotion error:", error);
    res.status(500).json({ success: false, message: "Failed to create promotion" });
  }
};

export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    const promotion = await prisma.promotion.update({
      where: { id },
      data,
    });
    res.json({ success: true, data: promotion, message: "Promotion updated successfully" });
  } catch (error) {
    console.error("Update promotion error:", error);
    res.status(500).json({ success: false, message: "Failed to update promotion" });
  }
};

export const deletePromotion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.promotion.delete({ where: { id } });
    res.json({ success: true, message: "Promotion deleted successfully" });
  } catch (error) {
    console.error("Delete promotion error:", error);
    res.status(500).json({ success: false, message: "Failed to delete promotion" });
  }
};
