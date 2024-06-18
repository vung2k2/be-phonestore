import express from "express";
import { authController } from "../controllers/authController.js";

const Router = express.Router();

Router.route("/").get((req, res) => {
  res.send("ok");
});

Router.route("/register").post(authController.register);
Router.route("/login").post(authController.login);
Router.route("/login-admin").post(authController.loginAdmin);
Router.route("/refresh-token").post(authController.refreshToken);
Router.route("/forgot-password").post(authController.forgotPassword);
Router.route("/reset-password").post(authController.rePassword);

export const authRoutes = Router;
