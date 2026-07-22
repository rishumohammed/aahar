import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const listBlogs = async (req: Request, res: Response) => {
  try {
    const { status, limit, page } = req.query;
    const where: any = {};
    if (status) where.status = String(status);

    const take = limit ? Number(limit) : 20;
    const skip = page ? (Number(page) - 1) * take : 0;

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { name: true, avatar: true },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({ success: true, data: { items, total } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching blogs" });
  }
};

export const getBlog = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const blog = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, avatar: true } },
      },
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching blog" });
  }
};

export const createBlog = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = req.body;

    const blog = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        category: data.category,
        readingTime: data.readingTime,
        status: data.status || "draft",
        isFeatured: data.isFeatured || false,
        tags: data.tags || [],
        authorId: user.id,
        publishedAt: data.status === "published" ? new Date() : null,
      },
    });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating blog" });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = req.body;

    // Handle publishedAt if status changes to published
    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    const blog = await prisma.blogPost.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating blog" });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.blogPost.delete({ where: { id } });
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting blog" });
  }
};
