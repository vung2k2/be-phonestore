import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import { userService } from "../services/userService.js";
import dateFormat from "dateformat";
import QueryString from "qs";
import crypto from "crypto";

const updateInfo = async (req, res, next) => {
  try {
    const { _id } = req.headers;
    const { address, name, phone } = req.body;
    // if (!address || !name || !phone)
    //   throw new ApiError(
    //     StatusCodes.BAD_REQUEST,
    //     "Thiếu thông tin người dùng!"
    //   );
    await userService.updateInfo(_id, name, address, phone);
    res.status(StatusCodes.OK).json({
      status: true,
      message: "Cập nhật thông tin thành công",
    });
  } catch (error) {
    next(error);
  }
};

const ChangePassword = async (req, res, next) => {
  try {
    const { _id } = req.headers;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu trường bắt buộc!");
    }
    const result = await userService.ChangePassword(
      _id,
      oldPassword,
      newPassword
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { _id } = req.headers;
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu trường bắt buộc!");
    }
    const result = await userService.addToCart(_id, productId, quantity);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    const { _id } = req.headers;
    const result = await userService.getCart(_id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const changeProductQuantity = async (req, res, next) => {
  try {
    const { _id } = req.headers;
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Số lượng sản phẩm không hợp lệ!"
      );
    }
    const result = await userService.changeProductQuantity(
      _id,
      productId,
      quantity
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteProductFromCart = async (req, res, next) => {
  try {
    const { _id } = req.headers;
    const { productId } = req.params;
    if (!productId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Id sản phẩm không hợp lệ!");
    }
    const result = await userService.deleteProductFromCart(_id, productId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const createUrlVNPay = async (req, res, next) => {
  try {
    const { _id } = req.headers;
    const { OrderInfo } = req.body;
    const orderInformation = encodeURI(`${_id} - ${OrderInfo}`);
    const allProducts = await userService.getCart(_id);
    const totalPrice = allProducts.reduce((total, product) => {
      return total + product.newPrice * product.productQuantity;
    }, 0);
    let tmnCode = process.env.VNP_TMN_CODE;
    let secretKey = process.env.VNP_SECRET_KEY;
    let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    let returnUrl = process.env.VNP_RETURN_URL;

    var ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    var date = new Date();
    var createDate = dateFormat(date, "yyyymmddHHMMss");
    var orderId = dateFormat(date, "HHMMss");
    var amount = totalPrice;
    var orderInfo = orderInformation;
    var bankCode = "";
    var orderType = "billpayment";
    var locale = "vn";
    var currCode = "VND";
    var vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = orderType;
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    // vnp_Params['vnp_ExpireDate'] = '20240510161318';
    vnp_Params["vnp_CreateDate"] = createDate;
    if (bankCode !== null && bankCode !== "") {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);
    var signData = QueryString.stringify(vnp_Params, { encode: false });
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + QueryString.stringify(vnp_Params, { encode: false });
    res.status(StatusCodes.OK).json(vnpUrl);
  } catch (error) {
    next(error);
  }
};

const VNPayReturn = async (req, res, next) => {
  try {
    var vnp_Params = req.query;
    var secureHash = vnp_Params["vnp_SecureHash"];
    let orderInfo = decodeURI(vnp_Params["vnp_OrderInfo"]);
    const parts = orderInfo.split(" - ");
    const userId = parts[0];
    const userInfo = parts.slice(1).join(" - ");
    let responseCode = vnp_Params["vnp_ResponseCode"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = "MVQREENUPMSOYVBJWPAXHZGCWBGTLMWF";
    var signData = QueryString.stringify(vnp_Params, { encode: false });
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      if (responseCode === "00") {
        await userService.createOrder(userId, "vnpay", userInfo);
      }
      res.status(200).json({ RspCode: "00", Message: "success" });
    } else {
      res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
    }
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { _id } = req.headers;
    const { orderInfo, provider } = req.body;
    if (!orderInfo || !provider)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Thông tin đơn hàng không hợp lệ!"
      );

    const result = await userService.createOrder(_id, provider, orderInfo);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const userId = req.headers._id;
    const result = await userService.getOrders(userId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { _id } = req.headers;
    const { orderId } = req.params;
    if (!orderId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Đơn hàng không xác định!");
    const result = await userService.cancelOrder(_id, orderId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const RateProduct = async (req, res, next) => {
  try {
    const userId = req.headers._id;
    const { orderId, productId, rate, comment } = req.body;
    if (!productId || !rate) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu trường bắt buộc!");
    } else {
      const result = await userService.RateProduct(
        userId,
        orderId,
        productId,
        rate,
        comment
      );
      res.status(StatusCodes.CREATED).json(result);
      next();
    }
  } catch (error) {
    next(error);
  }
};

export const userController = {
  updateInfo,
  ChangePassword,
  addToCart,
  changeProductQuantity,
  getCart,
  deleteProductFromCart,
  createOrder,
  createUrlVNPay,
  VNPayReturn,
  getOrders,
  cancelOrder,
  RateProduct,
};
