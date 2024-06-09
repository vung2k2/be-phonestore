import { StatusCodes } from "http-status-codes";
import User from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Rating from "../models/ratingModel.js";

const updateInfo = async (_id, name, address, phone) => {
  try {
    const user = await User.findOne({ _id });
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại!");
    }
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    await user.save();
  } catch (error) {
    throw error;
  }
};

const ChangePassword = async (_id, oldPassword, newPassword) => {
  try {
    const user = await User.findOne({ _id });
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại!");
    }
    if (!(await comparePassword(oldPassword, user.password))) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Mật khẩu cũ không đúng");
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    return {
      status: true,
      message: "Thay đổi mật khẩu thành công",
    };
  } catch (error) {
    throw error;
  }
};

const addToCart = async (_id, productId, quantity) => {
  try {
    const product = await Product.findById(productId);
    if (product.quantity <= 0)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Sản phẩm đã hết hàng!");
    // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng của người dùng hay chưa
    let cartItem = await Cart.findOne({ userId: _id, productId });

    if (cartItem) {
      // Nếu sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng lên
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thêm mới vào
      await Cart.create({ userId: _id, productId, quantity });
    }

    return {
      status: true,
      message: "Thêm sản phẩm vào giỏ hàng thành công!",
    };
  } catch (error) {
    throw error;
  }
};

const getCart = async (_id) => {
  try {
    const cartItems = await Cart.find({ userId: _id });
    if (!cartItems) {
      return [];
    }

    const products = [];
    for (const cartItem of cartItems) {
      const product = await Product.findById(cartItem.productId);
      if (product) {
        if (cartItem.quantity > product.quantity) {
          if (product.quantity <= 0) {
            await Cart.deleteOne({ _id: cartItem._id });
          } else {
            cartItem.quantity = product.quantity;
          }
        }
        let productQuantity = cartItem.quantity;
        products.push({
          ...product.toObject(),
          productQuantity,
        });
        cartItem.save();
      }
    }

    return products;
  } catch (error) {
    throw error;
  }
};

const changeProductQuantity = async (_id, productId, quantity) => {
  try {
    const cartItem = await Cart.findOne({ userId: _id, productId: productId });

    if (!cartItem) {
      return {
        status: false,
        message: "Sản phẩm không tồn tại trong giỏ hàng!",
      };
    }

    cartItem.quantity = quantity;

    await cartItem.save();
    return {
      status: true,
      message: "Thay đổi số lượng sản phẩm thành công!",
    };
  } catch (error) {
    throw error;
  }
};

const deleteProductFromCart = async (_id, productId) => {
  try {
    const result = await Cart.findOneAndDelete({ userId: _id, productId });
    if (result) {
      return {
        status: true,
        message: "Xóa sản phẩm khỏi giỏ hàng thành công!",
      };
    } else {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Không tìm thấy sản phẩm trong giỏ hàng!"
      );
    }
  } catch (error) {
    throw error;
  }
};

const createOrder = async (userId, provider, userInfo) => {
  try {
    const cartItems = await Cart.find({ userId });

    if (cartItems.length === 0) {
      throw new Error("Giỏ hàng của bạn trống.");
    }

    // Tính tổng số tiền
    let totalAmount = 0;
    const products = [];

    for (const item of cartItems) {
      products.push({
        productId: item.productId,
        quantity: item.quantity,
      });

      // Giảm số lượng sản phẩm trong kho
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
      }
      totalAmount += product.newPrice * item.quantity;
      product.quantity -= item.quantity;

      await product.save();
    }

    // Tạo đơn hàng mới
    const newOrder = new Order({
      userId,
      totalAmount,
      provider,
      status: "pending",
      orderInfo: userInfo,
      products,
    });
    const savedOrder = await newOrder.save();

    // Xóa tất cả sản phẩm trong giỏ hàng của người dùng
    await Cart.deleteMany({ userId });

    return {
      status: true,
      message: "Đơn hàng đã được tạo thành công.",
      order: savedOrder,
    };
  } catch (error) {
    throw error;
  }
};

const getOrders = async (userId) => {
  try {
    // Lấy danh sách đơn hàng của người dùng
    const orders = await Order.find({ userId });

    // Tạo một mảng các promise để lấy thông tin chi tiết của sản phẩm cho từng đơn hàng
    const orderPromises = orders.map(async (order) => {
      const productDetails = await Promise.all(
        order.products.map(async (product) => {
          const isRated = (await Rating.findOne({
            userId: userId,
            orderId: order._id,
            productId: product.productId,
          }))
            ? true
            : false;
          const productDetail = await Product.findById(product.productId);
          return {
            _id: productDetail._id,
            name: productDetail.name,
            slug: productDetail.slug,
            isRated: isRated,
            imageUrl: productDetail.imageUrl,
            newPrice: productDetail.newPrice,
            oldPrice: productDetail.oldPrice,
            quantity: product.quantity,
          };
        })
      );
      return {
        _id: order._id,
        total_amount: order.totalAmount,
        order_date: order.createdAt,
        provider: order.provider,
        status: order.status,
        orderInfo: order.orderInfo,
        products: productDetails,
      };
    });

    // Đợi tất cả các promise hoàn thành và trả về kết quả
    return await Promise.all(orderPromises);
  } catch (error) {
    throw error;
  }
};

const cancelOrder = async (_id, orderId) => {
  try {
    const order = await Order.findOne({ _id: orderId, userId: _id });
    if (!order)
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy đơn hàng!");

    order.status = "cancelled";
    await order.save();

    order.products.map(async (p) => {
      const product = await Product.findById(p.productId);
      product.quantity += p.quantity;
      await product.save();
    });

    return {
      status: true,
      message: "Hủy đơn hàng thành công!",
    };
  } catch (error) {
    throw error;
  }
};

const RateProduct = async (userId, orderId, productId, rate, comment) => {
  try {
    // Kiểm tra xem người dùng đã mua sản phẩm này chưa
    const order = await Order.findOne({
      userId: userId,
      _id: orderId,
      "products.productId": productId,
    });
    if (!order) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Người dùng chưa mua sản phẩm này."
      );
    }

    const existingRating = await Rating.findOne({
      userId: userId,
      orderId: orderId,
      productId: productId,
    });
    if (existingRating) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Người dùng đã đánh giá sản phẩm này trước đó."
      );
    }

    await Rating.create({
      userId: userId,
      orderId: orderId,
      productId: productId,
      rate: rate,
      comment: comment,
    });

    const p = await Product.findById({ _id: productId });
    p.rate += rate;
    p.numberReview++;
    await p.save();

    return {
      status: true,
      message: "Đánh giá sản phẩm thành công!",
    };
  } catch (error) {
    throw error;
  }
};

export const userService = {
  updateInfo,
  ChangePassword,
  addToCart,
  getCart,
  changeProductQuantity,
  deleteProductFromCart,
  createOrder,
  getOrders,
  cancelOrder,
  RateProduct,
};
