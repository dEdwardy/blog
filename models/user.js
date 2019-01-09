import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username:{ type: String },
  password: { type: String },
  authority:{ type: Number, default:0 }, //权限 默认0普通user
  email:{type: String, unique: true},
  avatar: { type: String,default:"/upload/images/default.jpg"}
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
userModel.findUser = (user) => {
  return userModel.findOne(user,{ password:0 ,_id:0 }) //0不显示 1显示
}
export default userModel;
