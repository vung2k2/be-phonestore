import express from "express";
import { userRoutes } from "./userRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { adminRoutes } from "./adminRoutes.js";
import { publicRoutes } from "./publicRoutes.js";
import { jwtMiddleware } from "../middlewares/jwtMiddleware.js";

const Router = express.Router();

Router.use("/public", publicRoutes);
Router.use("/auth", authRoutes);
Router.use("/user", jwtMiddleware("user"), userRoutes);
Router.use("/admin", jwtMiddleware("admin"), adminRoutes);

export const API = Router;
