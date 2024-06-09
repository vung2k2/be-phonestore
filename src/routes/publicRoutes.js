import express from "express";
import { publicController } from "../controllers/publicController.js";
import { userController } from "../controllers/userController.js";

const Router = express.Router();

Router.route("/products").get(publicController.allProducts);
Router.route("/review/:id").get(publicController.getReviews);
Router.route("/vnpay_ipn").get(userController.VNPayReturn);
export const publicRoutes = Router;
