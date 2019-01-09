import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username:{ type: String },
  password: { type: String },
  authority:{ type: Number, default:0 }, //权限 默认0普通user
  email:{type: String, unique: true},
<<<<<<< HEAD
  avatar:{ type:String, default:'/images/default.png' }
=======
  avatar: { type: String,default:"/upload/images/default.jpg"}
>>>>>>> 4f625c719720d1056b243b0930f4cd8574aa4db7
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
  return userModel.findOne(user,{ password:0 ,_id:0 ,authority:1}) //0不显示 1显示
}
export default userModel;
