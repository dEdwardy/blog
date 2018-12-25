import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import logger from './core/logger/app-logger'
import morgan from 'morgan'
import config from './core/config/config.dev'
import userRouter from './routes/user'
import connectToDb from './db/connect'
import articleRouter from './routes/article'
import jwt from 'jsonwebtoken'

const port = config.serverPort;
logger.stream = {
    write: function(message){
        logger.info(message);
    }
};

connectToDb();

const app = express();
app.use(cors());
app.use(bodyParser.json());                         //for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(morgan("dev", { "stream": logger.stream }));
app.use('/api/*',async (req,res,next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.token;
    if(req.baseUrl=='/api/users/checkUser'||'/api/articles/getArticles'||'/api/users/checkEmail'||'/api/users/checkUsername'){
        //登录注册以及查看文章时不需token
        return next();
    }else if(token){
        let decode;
        console.log('1111')
        let secret = config.secret;
        let  check = await jwt.verify(token,secret,(err,code) =>{
            if(err){                //token验证失败
                console.log(err);
                res.status(401)
                    .send('Not authoried!');
            }else{                  //token验证成功
            decode=code;
            console.log('22222');
            return next();
            }
        });
    }
    else{
        console.log(req.baseUrl);
        res.status(401)
            .send('Not authoried!');
    }
})                              //api权限
app.use('/api/users',userRouter);
app.use('/api/articles',articleRouter);
app.listen(port, () => {
    logger.info('server started - ', port);
});
