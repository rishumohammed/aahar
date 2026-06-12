import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// List all master data
export const listMasterData = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    const whereClause = type ? { type: String(type) } : {};
    
    const data = await prisma.masterData.findMany({
      where: whereClause,
      orderBy: { label: 'asc' }
    });
    
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error fetching master data" });
  }
};

// Create a new master data entry
export const createMasterData = async (req: Request, res: Response) => {
  try {
    const { type, key, label, icon } = req.body;
    
    // Check if key already exists
    const existing = await prisma.masterData.findUnique({ where: { key } });
    if (existing) {
      return res.status(400).json({ success: false, message: "A master data entry with this key already exists" });
    }
    
    const newData = await prisma.masterData.create({
      data: { type, key, label, icon }
    });
    
    res.json({ success: true, data: newData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create master data" });
  }
};

// Update existing master data
export const updateMasterData = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { label, icon, isActive } = req.body;
    
    const updated = await prisma.masterData.update({
      where: { id },
      data: { label, icon, isActive }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update master data" });
  }
};

// Delete master data (hard delete)
export const deleteMasterData = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    await prisma.masterData.delete({
      where: { id }
    });
    
    res.json({ success: true, message: "Master data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete master data" });
  }
};
