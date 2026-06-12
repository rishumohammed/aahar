import { forbidden } from "../utils/response.js";

export const requireRole = (...roles: string[]) =>
  (req: any, res: any, next: any) => {
    if (!roles.includes(req.user?.role))
      return forbidden(res, "Insufficient permissions");
    next();
  };
