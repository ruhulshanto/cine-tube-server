import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { jwtUtils } from "../utils/jwt";
import { IRequestUser } from "../interface/requestUser.interface";

/**
 * Optional authentication middleware.
 * Attempts to decode the user from the Authorization header or cookies if present.
 * If not present or invalid, it simply continues without setting req.user.
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next();
    }

    const result = jwtUtils.verifyToken(token, envVars.ACCESS_TOKEN_SECRET);

    if (result.success) {
      req.user = result.data as IRequestUser;
    }
    
    next();
  } catch (error) {
    // If token is invalid, we just proceed as a guest
    next();
  }
};
