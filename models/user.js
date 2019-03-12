import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
    authority: { type: Number, default: 0 }, //权限 默认0普通user   1 admin   2 禁止留言,评论  3 禁止登录
    email: { type: String, unique: true },
    avatar: { type: String, default: "/images/default.jpg" },
    lastLoginTime: [],
    like:[],
    dislike:[]
  },
  {
    collection: "users",
    versionKey: false
  }
);

let userModel = mongoose.model("user", userSchema);

userModel.addUser = user => {
  return user.save({});
};
userModel.delete = email => {
  return userModel.remove({ email });
};
userModel.get = () => {
  return userModel.find({});
};
userModel.findUser = user => {
  return userModel.findOne(user, { password: 0 }); //0不显示 1显示
};
userModel.updateUser = (id, power) => {
  return userModel.findOneAndUpdate(
    { _id: id },
    { $set: { authority: power } },
    { new: true }
  );
};
userModel.makeRecords = async (email, records) => {
  //只保存最近30次的登录记录
  let data = await userModel.aggregate([
    { $match: { email } },
    { $project: { count: { $size: "$lastLoginTime" } } }
  ]);
  function pop(){
    return new Promise((resolve) => {
       resolve(
        userModel.findOneAndUpdate(
          { email },
          { $pop: { lastLoginTime: -1 } },
          { new: true }
        )
       )
      })
  }
  function push(){
    return new Promise((resolve) => {
      resolve(
       userModel.findOneAndUpdate(
         { email },
         { $push: { lastLoginTime: records } },
         { new: true }
       )
      )
     });
  }
  const maintain = Promise.all([pop(), push()]);
  return data[0].count >= 30 ? maintain : push();
};
export default userModel;
