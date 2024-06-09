import { StatusCodes } from "http-status-codes";
import User from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { sendResetPasswordEmail } from "../utils/sendMail.js";

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
    const accessToken = generateAccessToken({ _id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({
      _id: user._id,
      role: user.role,
    });
    user.refreshToken = refreshToken;
    await user.save();
    return {
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      accessToken,
      refreshToken,
    };
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

const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user)
      throw ApiError(
        StatusCodes.BAD_REQUEST,
        "Email này chưa đăng ký bất kỳ tài khoản nào!"
      );
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_PASSWORD_RESET_KEY,
      {
        expiresIn: "30m",
      }
    );
    await sendResetPasswordEmail(email, token);
    return {
      status: true,
      message: "Vui lòng kiểm tra email",
    };
  } catch (error) {
    throw error;
  }
};

const rePassword = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_PASSWORD_RESET_KEY);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw ApiError(
        StatusCodes.BAD_REQUEST,
        "Token không hợp lệ hoặc đã hết hạn!"
      );
    }

    // Hash mật khẩu mới
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return {
      status: true,
      message: "Đặt lại mật khẩu thành công!",
    };
  } catch (error) {
    throw error;
  }
};

export const authService = {
  register,
  login,
  refreshToken,
  forgotPassword,
  rePassword,
};
