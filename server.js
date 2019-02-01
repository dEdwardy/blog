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
import  path  from 'path';


//cors白名单
const whitelist = ['http://localhost:4200','http://localhost:8088','http://pv.sohu.com/cityjson?ie=utf-8']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) > -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  maxAge:60*60
}
const port = config.serverPort;
logger.stream = {
  write: function(message) {
    logger.info(message);
  }
};
connectToDb();
const app = express();
// app.use(cors(corsOptions)); 
app.use(bodyParser.json({limit:'50mb'})); //for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname,'public'))); // Express 托管静态文件 
app.use(morgan("dev", { stream: logger.stream }));
app.use("/api/*", cors(corsOptions) , async (req, res, next) => {
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
    req.baseUrl == "/api/users/checkUsername"||
    req.baseUrl == "/api/users/addUser"
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
app.use("/api/users",cors(corsOptions), userRouter);
app.use("/api/articles", cors(corsOptions), articleRouter);
app.use("/api/files", cors(corsOptions), fileRouter);
app.listen(port, () => {
  logger.info("server started - ", port);
});
