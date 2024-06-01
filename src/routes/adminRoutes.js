import express from "express";
import { adminController } from "../controllers/adminController.js";
import { uploadCloud } from "../config/cloudinary.js";

const Router = express.Router();

Router.route("/product")
  .get()
  .post(uploadCloud.single("image"), adminController.createProduct);
export const adminRoutes = Router;
