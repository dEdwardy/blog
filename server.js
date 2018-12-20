import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import logger from './core/logger/app-logger'
import morgan from 'morgan'
import config from './core/config/config.dev'
import userRouter from './routes/user'
import connectToDb from './db/connect'
import articleRouter from './routes/article'
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
app.use('/api/*',(req,res,next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token']||req.headers.token;
    if(token||req.baseUrl=='/api/users/checkUser'||req.baseUrl=='/api/articles/getArticles'){
        console.log('path:'+req.path);
        console.log('BaseUrl:'+req.baseUrl);
        console.log(token);
        return next();
    }else{
        console.log(req.baseUrl);
        res.status(401)
            .send('Not authoried!');
    }
})                              //api权限
app.use('/api/users',userRouter);
app.use('/api/articles',articleRouter);

//Index route
app.get('/', (req, res) => {
    res.send('Invalid endpoint!');
});

app.listen(port, () => {
    logger.info('server started - ', port);
});
