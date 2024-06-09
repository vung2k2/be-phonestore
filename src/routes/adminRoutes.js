import express from "express";
import { adminController } from "../controllers/adminController.js";
import { uploadCloud } from "../config/cloudinary.js";
import uploadExcelMiddleware from "../middlewares/uploadExcelMiddleware.js";

const Router = express.Router();

Router.route("/product")
  .get()
  .post(uploadCloud.single("image"), adminController.createProduct);

Router.route("/import-products").post(
  uploadExcelMiddleware,
  adminController.importProductsFromExcel
);
export const adminRoutes = Router;
