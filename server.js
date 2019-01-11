import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "./core/logger/app-logger";
import morgan from "morgan";
import config from "./core/config/config.dev";
import userRouter from "./routes/user";
import connectToDb from "./db/connect";
import articleRouter from "./routes/article";
import fileRouter from "./upload/file";
import jwt from "jsonwebtoken";
import { fstat } from "fs";

const port = config.serverPort;
logger.stream = {
  write: function(message) {
    logger.info(message);
  }
};

connectToDb();

const app = express();
app.use(cors());
app.use(bodyParser.json({limit:'50mb'})); //for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public')); // Express 托管静态文件 
app.use(morgan("dev", { stream: logger.stream }));
app.use("/api/*", async (req, res, next) => {
  let token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers.token;
  console.log("hhhhhhhhhhhhhhhhh");
  console.log(req.headers);
  console.log("token:" + token);
  if (
    req.baseUrl == "/api/users/checkUser" ||
    req.baseUrl == "/api/articles/getArticles" ||
    req.baseUrl == "/api/users/checkEmail" ||
    req.baseUrl == "/api/users/checkUsername"
  ) {
    console.log(req.baseUrl)
    //登录注册以及查看文章时不需token
    console.log("1111111");
    return next();
  } else if (token) {
    console.log("2222222");
    console.log(token);
    let decode;
    let secret = config.secret;
    let check = await jwt.verify(token, secret, (err, code) => {
      if (err) {
        //token验证失败
        console.log(err);
        res.status(401).send("Not authoried!");
      } else {
        //token验证成功
        decode = code;
        console.log("444");
        return next();
      }
    });
  } else {
    console.log("5555555555");
    console.log(req.baseUrl);
    res.status(401).send("Not authoried!");
  }
}); //api权限
app.use("/api/users", userRouter);
app.use("/api/articles", articleRouter);
app.use("/api/files", fileRouter);
app.listen(port, () => {
  logger.info("server started - ", port);
});
