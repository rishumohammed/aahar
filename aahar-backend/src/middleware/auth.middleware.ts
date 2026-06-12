import jwt from "jsonwebtoken";
import { unauthorized } from "../utils/response.js";

export const verifyToken = (req: any, res: any, next: any) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return unauthorized(res, "No token provided");
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch {
    return unauthorized(res, "Invalid or expired token");
  }
};
