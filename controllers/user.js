import userModel from '../models/user'
import logger from '../core/logger/app-logger'

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
userController.checkUser = async (req,res) => {
  let user = {
    username: req.body.username,
    password: req.body.password
  };
  try {
    const res2 = await userModel.find(user);
    res.send('User successfully finded');
    logger.info(res2)
  }catch (err) {
    logger.error('Failed to find user-'+err);
    logger.error(err);
    res.send('Find failed..!');
  }
}

export default userController;
