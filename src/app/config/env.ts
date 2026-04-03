import dotenv from "dotenv";
import status from "http-status";
import AppError from "../errorHelper/AppError";

dotenv.config();

export interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  EMAIL_HOST?: string;
  EMAIL_PORT?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  EMAIL_SENDER?: {
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM: string;
  };
  MONTHLY_SUBSCRIPTION_PRICE?: string;
  YEARLY_SUBSCRIPTION_PRICE?: string;
  RATE_LIMIT_WINDOW_MS?: string;
  RATE_LIMIT_MAX_REQUESTS?: string;
  MAX_FILE_SIZE?: string;
}

const loadEnvVariables = (): EnvConfig => {
  const isVercel = process.env.VERCEL === "1";
  
  // NODE_ENV and PORT should have defaults for Vercel
  const NODE_ENV = process.env.NODE_ENV || (isVercel ? "production" : "development");
  const PORT = process.env.PORT || "5000";

  const requiredEnvVariables = [
    "DATABASE_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "CORS_ORIGIN",
  ];

  requiredEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${variable} is required but missing. Please set it in your environment (e.g. Vercel dashboard).`,
      );
    }
  });

  const config: EnvConfig = {
    NODE_ENV,
    PORT,
    DATABASE_URL: process.env.DATABASE_URL as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
    CORS_ORIGIN: process.env.CORS_ORIGIN as string,
  };

  if (process.env.STRIPE_SECRET_KEY) config.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (process.env.STRIPE_WEBHOOK_SECRET) config.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  if (process.env.CLOUDINARY_CLOUD_NAME) config.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  if (process.env.CLOUDINARY_API_KEY) config.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  if (process.env.CLOUDINARY_API_SECRET) config.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
  
  if (process.env.EMAIL_SENDER_SMTP_HOST) {
    config.EMAIL_SENDER = {
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT || "587",
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER || "",
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS || "",
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM || "",
    };
  }

  if (process.env.MONTHLY_SUBSCRIPTION_PRICE) config.MONTHLY_SUBSCRIPTION_PRICE = process.env.MONTHLY_SUBSCRIPTION_PRICE;
  if (process.env.YEARLY_SUBSCRIPTION_PRICE) config.YEARLY_SUBSCRIPTION_PRICE = process.env.YEARLY_SUBSCRIPTION_PRICE;
  if (process.env.RATE_LIMIT_WINDOW_MS) config.RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS;
  if (process.env.RATE_LIMIT_MAX_REQUESTS) config.RATE_LIMIT_MAX_REQUESTS = process.env.RATE_LIMIT_MAX_REQUESTS;
  if (process.env.MAX_FILE_SIZE) config.MAX_FILE_SIZE = process.env.MAX_FILE_SIZE;

  return config;
};

export const envVars: EnvConfig = loadEnvVariables();
export const env = envVars;

