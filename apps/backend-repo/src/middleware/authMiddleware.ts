import { type Request, type Response, type NextFunction } from "express";
import { log } from "@repo/logger";
import { auth } from "@/config/firebase";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Add user to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
    };

    next();
  } catch (error) {
    log("Auth error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
