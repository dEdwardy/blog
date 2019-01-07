import express from 'express';
import multer from 'multer'
import config from '../core/config/config.dev'
import path from 'path'

const upload = multer({
  storage:config.imageStorage
})
const fileRouter = express.Router();

fileRouter.post('/addFile',upload.single('file'),(req,res) => {
  req.file.path=path.resolve(__dirname,'..',req.file.path)
  res.send({data:req.file})
})
fileRouter.delete('/delteFile',(req,res) => {

})
export default fileRouter;