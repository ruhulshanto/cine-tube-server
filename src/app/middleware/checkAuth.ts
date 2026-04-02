import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Role, UserStatus } from "@prisma/client";
import AppError from "../errorHelper/AppError";
import { jwtUtils } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { IRequestUser } from "../interface/requestUser.interface";
import { envVars } from "../config/env";

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from Authorization header or cookies
      const authHeader = req.headers.authorization;
      let token: string | null = null;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      } else if (req.cookies.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No token provided.",
        );
      }

      // Verify token
      const result = jwtUtils.verifyToken(
        token,
        envVars.ACCESS_TOKEN_SECRET,
      );

      if (!result.success) {
        throw new AppError(status.UNAUTHORIZED, "Invalid or expired token");
      }

      const tokenData = result.data as IRequestUser;

      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: tokenData.userId },
      });

      if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
      }

      // Check user status
      if (user.status === "SUSPENDED") {
        throw new AppError(status.FORBIDDEN, "Your account has been suspended");
      }

      // Check role authorization
      if (authRoles.length > 0 && !authRoles.includes(user.role as Role)) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource.",
        );
      }

      // Attach user to request
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      } as IRequestUser;

      next();
    } catch (error: any) {
      next(error);
    }
  };
