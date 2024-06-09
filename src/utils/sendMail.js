import nodemailer from "nodemailer";
import { google } from "googleapis";
import "dotenv/config";

// export const sendResetPasswordEmail = async (email, token) => {
//   // Khởi tạo OAuth2 client
//   const oAuth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     process.env.REDIRECT_URI
//   );

//   oAuth2Client.setCredentials({
//     refresh_token: process.env.REFRESH_TOKEN,
//   });

//   // Lấy mã thông báo truy cập mới
//   const accessToken = await oAuth2Client.getAccessToken();

//   let transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       type: "OAuth2",
//       user: process.env.EMAIL_USER,
//       clientId: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       refreshToken: process.env.REFRESH_TOKEN,
//       accessToken: accessToken,
//     },
//   });

//   let url = `${process.env.RETURN_URL}/reset-password?token=${token}`;

//   let info = await transporter.sendMail({
//     from: `"Phonestore" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Tạo lại mật khẩu",
//     text: `Vui lòng truy cập đường link sau để thay đổi mật khẩu trong 30 phút: ${url}`,
//   });

//   return info;
// };

export const sendResetPasswordEmail = async (email, token) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "20020507@vnu.edu.vn",
      pass: "djut tqiq qvya hzbc",
    },
  });

  let url = `${process.env.RETURN_URL}/reset-password?token=${token}`;

  let info = await transporter.sendMail({
    from: `"Phonestore" <20020507@vnu.edu.vn>`,
    to: email,
    subject: "Tạo lại mật khẩu",
    text: `Vui lòng truy cập đường link sau để thay đổi mật khẩu trong 30 phút: ${url}`,
  });

  return info;
};
