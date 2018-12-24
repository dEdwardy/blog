import express from "express";
import fileController from "../controllers/file"
const fileRouter = express.Router();

fileRouter.post('/addFile', (req, res) => {
  fileController.add(req,res);
});

fileRouter.post('/deleteFile', (req, res) => {
  fileController.delete(req,res);
});


export default fileRouter;
