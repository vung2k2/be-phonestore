import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateAccessToken = (payload) => {
  const options = {
    expiresIn: "15y",
  };
  return jwt.sign(
    {
      payload,
    },
    process.env.JWT_ACCESS_KEY,
    options
  );
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      payload,
    },
    process.env.JWT_REFRESH_KEY,
    { expiresIn: "1y" }
  );
};
