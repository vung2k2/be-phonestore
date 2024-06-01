import express from "express";
import { publicController } from "../controllers/publicController.js";

const Router = express.Router();

Router.route("/products").get(publicController.allProducts);

export const publicRoutes = Router;
