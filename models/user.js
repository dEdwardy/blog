import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username:{ type: String },
  password: { type: String }
},{
  collection: 'users',
  versionKey: false
});

let userModel = mongoose.model('user',userSchema);

userModel.addUser = (user) =>{
  return user.save({});
}
userModel.delete =(username) => {
  return userModel.remove({username})
}
userModel.get =() => {
  return userModel.find({});
}
userModel.find = (user) => {
  return userModel.findOne(user)
}
export default userModel;
