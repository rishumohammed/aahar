import prisma from "../lib/prisma.js";
import { ok, notFound, badRequest, created, serverError } from "../utils/response.js";

// GET /api/admin/standards
export const listStandards = async (req: any, res: any) => {
  try {
    const { division } = req.query;
    const where = division ? { division } : {};
    
    const standards = await prisma.standard.findMany({
      where,
      include: { criteria: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, standards);
  } catch (e) {
    return serverError(res, e);
  }
};

// POST /api/admin/standards
export const createStandard = async (req: any, res: any) => {
  try {
    const { name, version, division, criteria } = req.body;
    if (!name || !version || !division) return badRequest(res, "name, version, and division are required");

    const standard = await prisma.standard.create({
      data: {
        name,
        version,
        division,
        criteria: {
          create: Array.isArray(criteria) ? criteria.map((c: any) => ({
            section: c.section,
            criterion: c.criterion,
            weight: c.weight
          })) : []
        }
      },
      include: { criteria: true }
    });
    return created(res, standard, "Standard created");
  } catch (e) {
    return serverError(res, e);
  }
};

// PATCH /api/admin/standards/:id
export const updateStandard = async (req: any, res: any) => {
  try {
    const { name, version, status } = req.body;
    const standard = await prisma.standard.update({
      where: { id: req.params.id },
      data: { name, version, status },
      include: { criteria: true }
    });
    return ok(res, standard, "Standard updated");
  } catch (e) {
    return serverError(res, e);
  }
};

// DELETE /api/admin/standards/:id
export const deleteStandard = async (req: any, res: any) => {
  try {
    await prisma.standard.delete({ where: { id: req.params.id } });
    return ok(res, null, "Standard deleted");
  } catch (e) {
    return serverError(res, e);
  }
};

// POST /api/admin/standards/:id/criteria
export const addCriterion = async (req: any, res: any) => {
  try {
    const { section, criterion, weight } = req.body;
    const newCriterion = await prisma.criterion.create({
      data: {
        standardId: req.params.id,
        section,
        criterion,
        weight: Number(weight)
      }
    });
    return created(res, newCriterion, "Criterion added");
  } catch (e) {
    return serverError(res, e);
  }
};

// DELETE /api/admin/standards/criteria/:criterionId
export const deleteCriterion = async (req: any, res: any) => {
  try {
    await prisma.criterion.delete({ where: { id: req.params.criterionId } });
    return ok(res, null, "Criterion removed");
  } catch (e) {
    return serverError(res, e);
  }
};
