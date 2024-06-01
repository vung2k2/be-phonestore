import express from "express";

const Router = express.Router();

Router.route("/").get((req, res) => {
  res.send("ok");
});

export const userRoutes = Router;
