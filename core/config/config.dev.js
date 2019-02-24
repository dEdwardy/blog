import path from "path";
import multer from 'multer';
let config = {};
config.logFileDir = path.join(__dirname, '../../log');
config.logFileName = 'app.log';
config.dbHost = process.env.dbHost || 'localhost';
config.dbPort = process.env.dbPort || '27017';
config.dbName = process.env.dbName || 'blog';
config.dbUsername = 'edward';
config.dbPwd = 'onelovealive0';
config.serverPort = process.env.serverPort || 8088;
config.secret = 'hahaha';
config.imageStorage = multer.diskStorage({
  destination:'./public/upload/images',
  filename:(req,file,cb) =>{
    cb(null,Date.now()+'-'+file.originalname);
  }
})
config.imgPathHead = 'http://localhost:8088/';
export default config;
