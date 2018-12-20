import userModel from '../models/user'
import logger from '../core/logger/app-logger'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';

const userController = { };
userController.addUser = async(req,res) => {
  let user = userModel({
    username: req.body.username,
    password: req.body.password
  });
  try {
    const res1 = await userModel.addUser(user);
    logger.info('Adding user...');
    res.send('added: ' + user);
  }
  catch(err) {
    logger.error(err)
    logger.error('Error in add user- ' + err);
    res.send('Got error in addUser');
  }
}
userController.getUser =async(req,res) => {
  try {
    const users = await userModel.get();
    logger.info('sending all users...');
    res.send(users);
  }
  catch(err) {
    logger.error('Error in getting users- ' + err);
    res.send('Got error in getAll');
  }
}
userController.deleteUser =async(req,res) => {
  let username = req.body.username;
  try{
    const removeUser = await userModel.delete(username);
    logger.info('Deleted User- ' + removeUser);
    res.send('User successfully deleted');
  }
  catch(err) {
    logger.error('Failed to delete user- ' + err);
    res.send('Delete failed..!');
  }
}
/**
 * 登录验证
 */
userController.checkUser = async (req,res) => {
  let user = {
    username: req.body.username,
    password: req.body.password,
  };
  try {
    const data = await userModel.find(user);
    const success = data ? 1 : 0; 
    const secret ='haha';
    const token = data ? jwt.sign({'username':data.username},secret,{ expiresIn:60*30 }) :null;
    let decode;
    jwt.verify(token, secret,(err,c) => {
      if(err){ decode='无效Token'}
      decode=c;
    })
    res.send({ success, data, token,decode});
    //res.send('User successfully finded');
  }catch (err) {
    logger.error('Failed to find user-'+err);
    logger.error(err);
    res.send('Find failed..!');
  }
}

export default userController;
