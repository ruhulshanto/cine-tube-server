import { Server } from "http";
import app from "./app";
import { env } from "./app/config/env";

let server: Server;

const bootstrap = async () => {
  try {
    server = app.listen(env.PORT, () => {
      console.log(`CineTube server listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

// SIGTERM signal handler
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Shutting down server...");

  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// SIGINT signal handler
process.on("SIGINT", () => {
  console.log("SIGINT signal received. Shutting down server...");

  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// uncaught exception handler
process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception Detected... Shutting down server", error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// unhandled rejection handler
process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection Detected... Shutting down server", error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

bootstrap();
