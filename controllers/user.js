import userModel from '../models/user'
import logger from '../core/logger/app-logger'
import jwt from 'jsonwebtoken'
import config from '../core/config/config.dev'
const userController = {};
userController.addUser = async (req, res) => {
  let user = userModel({
    username: req.body.username,
    password: req.body.password
  });
  try {
    const res1 = await userModel.addUser(user);
    logger.info('Adding user...');
    res.send('added: ' + user);
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
  let username = req.body.username;
  try {
    const removeUser = await userModel.delete(username);
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
  try {
    const data = await userModel.findUser(user);
    const success = data ? 1 : 0;
    const secret = config.secret;
    const token = data ? jwt.sign({ 'username': data.username }, secret, { expiresIn: 10 }) : '';
    let decode;
    jwt.verify(token, secret, (err, code) => {
      if (err) { decode = '无效Token' }
      decode = code;
    });
    if (data) {
      res.set('token', token);
    }
    res.send({ success, data, token, decode });
  } catch (err) {
    logger.error('Failed to find user-' + err);
    logger.error(err);
    res.send('Find failed..!');
  }
}
/**
 * 验证注册时email唯一性
 */
userController.uniqueEmail = async (req, res) => {
  let email = req.body.email;
  try {
    const data = await userModel.findUser({ email });
    console.log(data)
    const result = data ? 1 : 0;
    res.send({ result })
  } catch (error) {
    logger.error('Failed to find email-' + err);
    logger.error(err);
    res.send('Find failed..!');
  }
}

export default userController;
