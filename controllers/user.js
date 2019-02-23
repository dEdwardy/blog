import userModel from '../models/user'
import logger from '../core/logger/app-logger'
import jwt from 'jsonwebtoken'
import config from '../core/config/config.dev'
const userController = {};
userController.addUser = async (req, res) => {
  let user = userModel({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  });
  try {
    const res1 = await userModel.addUser(user);
    const success = res1 ? 1 : 0;
    logger.info('Adding user...');
    res.send({success});
  }
  catch (err) {
    logger.error(err)
    logger.error('Error in add user- ' + err);
    res.send('Got error in addUser');
  }
}
userController.getUser = async (req, res) => {
  try {
    const users = await userModel.get();
    logger.info('sending all users...');
    res.send(users);
  }
  catch (err) {
    logger.error('Error in getting users- ' + err);
    res.send('Got error in getAll');
  }
}
userController.deleteUser = async (req, res) => {
  let email = req.body.email;
  try {
    const removeUser = await userModel.delete(email);
    logger.info('Deleted User- ' + removeUser);
    res.send('User successfully deleted');
  }
  catch (err) {
    logger.error('Failed to delete user- ' + err);
    res.send('Delete failed..!');
  }
}
/**
 * 登录验证
 */
userController.checkUser = async (req, res) => {
  let user = {
    email: req.body.email,
    password: req.body.password,
  };
  let record = { 
    date:new Date(),
    ip: req.ip,
    user_agent:req.headers['user-agent']
  };
  try {
    const data = await userModel.findUser(user);
    const success = data ? 1 : 0;
    const secret = config.secret;
    const token = data ? jwt.sign({ 'username': data.username }, secret, { expiresIn:60*60*24 }) : '';
    let decode;
    jwt.verify(token, secret, (err, code) => {
      if (err) { decode = '无效Token' }
      decode = code;
    });
    if (data) {
      await userModel.makeRecords(user.email,record);
      res.set('token', token); //设置响应头
    }
    res.send({ success, data, token });
  } catch (err) {
    logger.error('Failed to find user-' + err);
    logger.error(err);
    res.send('Find failed..!');
  }
}
/**
 * 验证注册时email唯一性&&验证用户权限
 */
userController.uniqueEmail = async (req, res) => {
  let email = req.body.email;
  try {
    const data = await userModel.find({ email });
    const result = (data.length===0) ? 0 : 1;           //1. email存在 0 不存在
    const authority = data ? data.authority : -1;    //authority: 1.admin 0.user -1.用户不存在
    res.send({ result,authority})
  } catch (err) {
    logger.error('Failed to find email-' + err);
    logger.error(err);
    res.send('Find failed..!');
  }
}
userController.changePower = async (req, res) => {
  let id = req.body.id;
  let power = req.body.power;
  try {
    await userModel.updateUser(id,power);
    res.send({success:true})
  } catch (err) {
    console.log(err)
  }
}
userController.getLoginLog = async (req, res) => {
  let email = req.body.email;
  try {
    let data = await userModel.get({ email })
    let success = data ? true :false;
    res.send({ success, data })
  } catch (err) {
    console.log(err)
  }
}

export default userController;
