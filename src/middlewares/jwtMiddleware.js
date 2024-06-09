import jwt from "jsonwebtoken";
import StatusCodes from "http-status-codes";
import ApiError from "../utils/ApiError.js";

export const jwtMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    // Lấy token từ header
    const token = req.headers.accesstoken;
    // Kiểm tra xem token có tồn tại hay không
    if (!token) {
      return next(
        new ApiError(StatusCodes.UNAUTHORIZED, "Token không được cung cấp!")
      );
    }

    try {
      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);

      // Kiểm tra quyền truy cập của người dùng
      if (requiredRole && decoded.payload.role !== requiredRole) {
        return next(
          new ApiError(StatusCodes.FORBIDDEN, "Bạn không có quyền truy cập!")
        );
      }

      // Lưu thông tin người dùng vào req để sử dụng ở các middleware tiếp theo

      req.headers.role = decoded.payload.role;
      req.headers._id = decoded.payload._id;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(
          new ApiError(StatusCodes.UNAUTHORIZED, "Token đã hết hạn!")
        );
      }
      return next(
        new ApiError(StatusCodes.UNAUTHORIZED, "Token không hợp lệ!")
      );
    }
  };
};
