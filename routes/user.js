import express from "express";
import userController from "../controllers/user"
const userRouter = express.Router();

userRouter.get('/allUsers', (req, res) => {
  userController.getUser(req,res);
});

userRouter.post('/addUser', (req, res) => {
  userController.addUser(req,res);
});

userRouter.delete('/deleteUser', (req, res) => {
  userController.deleteUser(req,res);
});
userRouter.post('/checkUser', (req, res) => {
  userController.checkUser(req,res);
});
export default userRouter;
