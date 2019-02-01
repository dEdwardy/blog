import mongoose from 'mongoose';
import { SSL_OP_ALL } from 'constants';

const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
//评论或留言
const commentSchema = new Schema({
  avatar: { type:String },
  name: { type: String },
  create_by: { type: String },   /*即email*/
  create_date: { type: Date },
  content: { type: String },
  type: { type: Number }  //1 评论 2 留言
});
//文章
const articleSchema = new Schema({
  title: { type: String },
  create_date: { type: Date },
  update_date: { type: Date },
  label: { type: String },   //文章标签
  can_delete: { type: Boolean, default: false },
  content: { type: String },
  image_url: { type: Array },
  like: { type: Number, default: 0 },
  dislike: { type: Number, default: 0 },
  comment: [commentSchema]
}, {
    collection: 'articles',
    timestamps: { createdAt: 'create_date', updatedAt: 'update_date' },
    versionKey: false
  });
let articleModel = mongoose.model('article', articleSchema);

/**增加文章
 * @param article 文章
 * @returns {*}
 */
articleModel.add = (article) => {
  return article.save({});
};
/**根据文章id 删除文章
 * @param id 文章id
 */
articleModel.delete = (id) => {
  return articleModel.deleteOne({ _id: ObjectId(id) });
};
/** 查询文章（待优化）
 * @param params 文章查询条件
 * @param skip  文章跳过个数
 * @param limit 文章个数限制
 * @param count 是否需要获取文章数量(用于分页时获取页数0 false 1 true)
 * @param sort 排序方式  默认以时间降序排列
 * @returns {*}
 */
articleModel.get = (params = {}, skip = 0, limit = 0, count = 0, sort={create_date:-1}) => {
  return parseInt(count) === 1 ?
    articleModel.find(params).count().sort(sort)
    : articleModel.find(params).skip(Number(skip)).limit(Number(limit)).sort(sort);
};
articleModel.update = (id, content) => {
  return articleModel.findOneAndUpdate(
    { _id: ObjectId(id) },
    { $set: { content: content } },
    { new: true }
  );
};
/**
 * @param id 文章id
 * @param comment 评论内容
 * @returns {Query|*}
 */
articleModel.addComment = (id, comment) => {
  return articleModel.findOneAndUpdate(
    { _id: ObjectId(id) },
    { $push: { comment:{...comment,$sort:{ create_date: -1}} } },
    { new: true }
  );
};
/**
 * 根据文章Id 和 用户评论id删除评论
 * @param id 文章Id
 * @param commentId 用户评论Id
 */
articleModel.deleteComment = (id, commentId) => {
  return articleModel.findOneAndUpdate(
    { _id: ObjectId(id) },
    { $pull:{ comment: { _id: ObjectId(commentId)} } },
    { new: true }
  )
};
/**根据文章id 查找评论
 * @param id 文章id
 * @returns {*}
 */
articleModel.getComments = (id) => {
  return articleModel.find(
    { _id: ObjectId(id) },
    { comment: 1, _id: 0 }
  )
};
/**根据文章id 查找评论
 * @param id 文章id
 * @param like 1 like -1dislike
 * @returns {*}
 */
articleModel.like = (id,like) => {
  return articleModel.where({_id:ObjectId(id)}).update({ $inc:{ like } });
}
articleModel.dislike = (id,dislike) => {
  return articleModel.where({_id:ObjectId(id)}).update({ $inc:{ dislike } });
}
export default articleModel;
