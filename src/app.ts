import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./app/config/env";
import { notFound } from "./app/middleware/notFound";
import router from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { PaymentController } from "./app/module/payment/payment.controller";

const app: Application = express();

// ⚡ STRIPE WEBHOOK — Must be registered BEFORE express.json()
// Stripe requires the raw body buffer for signature verification
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent
);

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.set("view engine", "ejs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "app", "template"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "CineTube API is running",
    timestamp: new Date().toISOString(),
  });
});

// Welcome route for home page
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to CineTube API",
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);
app.use(notFound);

export default app;