import express from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import morgan from "morgan";
import { userRoutes } from "@/routes/userRoutes";
import "@/config/firebase"; // This will initialize Firebase

export const createApp = (): express.Application => {
  const app = express();

  // Middleware
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3002",
        credentials: true,
      })
    )
    .use(json())
    .use(urlencoded({ extended: true }));

  // Routes
  app.use("/api/users", userRoutes);

  // Health check
  app.get("/health", (_, res) => {
    res.json({ status: "ok" });
  });

  return app;
};
