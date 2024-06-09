import express from "express";
import { userController } from "../controllers/userController.js";

const Router = express.Router();

Router.route("/info").put(userController.updateInfo);

// Cart
Router.route("/cart")
  .get(userController.getCart)
  .post(userController.addToCart);
Router.route("/delete-product/:productId").delete(
  userController.deleteProductFromCart
);
Router.route("/change-quantity").put(userController.changeProductQuantity);

// VnPay
Router.route("/payment").post(userController.createUrlVNPay);

// Order
Router.route("/order")
  .get(userController.getOrders)
  .post(userController.createOrder); // Thanh toán tại nhà
Router.route("/order/:orderId").put(userController.cancelOrder);

//Đánh giá sp
Router.route("/review").post(userController.RateProduct);

// Đổi mật khẩu
Router.route("/change-password").post(userController.ChangePassword);

export const userRoutes = Router;
