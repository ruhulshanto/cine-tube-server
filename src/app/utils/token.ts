import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../config/env";

// Creating access token
const getAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    envVars.ACCESS_TOKEN_EXPIRES_IN as unknown as number,
  );
  return accessToken;
};

// Creating refresh token
const getRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    envVars.REFRESH_TOKEN_EXPIRES_IN as unknown as number,
  );
  return refreshToken;
};

// Set access token in cookie
const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};

// Set refresh token in cookie
const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
  });
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
};
