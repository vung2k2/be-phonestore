import { StatusCodes } from "http-status-codes";
import User from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const register = async (name, email, password) => {
  try {
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, "Email đã được đăng ký!");
    }

    //Mã hóa mật khẩu
    password = await hashPassword(password);

    // Tạo tài khoản người dùng mới
    const newUser = await User.create({
      name: name,
      password: password,
      email: email,
    });
    return newUser;
  } catch (error) {
    throw error;
  }
};

const login = async (email, password) => {
  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ email });

    if (
      !user ||
      !(await comparePassword(password, user.password)) ||
      user.role === "admin"
    ) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Sai thông tin tài khoản!");
    }
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({
      _id: user._id,
      role: user.role,
    });
    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

const refreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

    const { _id, role } = decoded.payload;

    const user = await User.findOne({ _id });
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Refresh token không hợp lệ!"
      );
    }
    const accessToken = generateAccessToken({
      _id,
      role,
    });
    const newRefreshToken = generateRefreshToken({
      _id,
      role,
    });
    user.refreshToken = newRefreshToken;
    await user.save();
    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token đã hết hạn!");
    } else if (error.name === "JsonWebTokenError") {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Refresh token không hợp lệ!"
      );
    } else {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Lỗi xác thực token!"
      );
    }
  }
};

export const authService = { register, login, refreshToken };
