import express from "express";
import { authController } from "../controllers/authController.js";

const Router = express.Router();

Router.route("/").get((req, res) => {
  res.send("ok");
});

Router.route("/register").post(authController.register);
Router.route("/login").post(authController.login);
Router.route("/refresh-token").post(authController.refreshToken);

export const authRoutes = Router;
