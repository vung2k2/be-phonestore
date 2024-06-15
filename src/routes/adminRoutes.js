import express from "express";
import { adminController } from "../controllers/adminController.js";
import { uploadCloud } from "../config/cloudinary.js";
import uploadExcelMiddleware from "../middlewares/uploadExcelMiddleware.js";

const Router = express.Router();

Router.route("/products")
  .get(adminController.getProducts)
  .post(uploadCloud.single("image"), adminController.createProduct)
  .delete(adminController.deleteProducts);

Router.route("/products/:id")
  .get(adminController.getProductById)
  .put(adminController.updateProduct)
  .delete(adminController.deleteProduct);
Router.route("/import-products").post(
  uploadExcelMiddleware,
  adminController.importProductsFromExcel
);

Router.route("/customers")
  .get(adminController.getCustomers)
  .delete(adminController.deleteCustomers);
Router.route("/customers/:id").delete(adminController.deleteCustomer);

export const adminRoutes = Router;
