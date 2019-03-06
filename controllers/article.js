import articleModel from "../models/article";
import logger from "../core/logger/app-logger";
import  config from '../core/config/config.dev'
import nodejieba from 'nodejieba'
import { promisify } from "util";
import fs from "fs";
import path from "path";
const writeFile = promisify(fs.writeFile);
const filePath = path.resolve("./public/images");
const articleController = {};
// 自定义dict  load 太慢   将userDict移至默认词典中
//  let  load= () =>{    
//   nodejieba.load({
//     userDict: './dict/userdict.utf8'
//   });
//   load = function (){}
// }
/**
 * 新建文章
 */
articleController.addArticle = async (req, res) => {
  let content = req.body.content; //富文本字符串
  // let src = content.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/g);
  let src = content.match(/src=[\'\"]data:image[\'\"]?([^\'\"]*)[\'\"]?/g);    //正则截取图片src (base64格式的image)
  let arr = []; //图片信息
  let images = []; //图片地址
  if (src) {
    //带图片上传
    //去掉base64编码前缀并区别图片类型
    let imgData = src.map(item =>
      arr.push({
        data: new Buffer(item.slice(27), "base64"),
        type: item
          .split(",")[0]
          .match(/\/(\S*);/, "")[0]
          .replace(/\/|;/g, ""),
        filename: ""
      })
    );
    arr.map((item,index) => {
      let name =  Date.now() + '-' + index + "." + item.type
      item.filename = filePath + "/" + name;
      writeFile(item.filename, item.data)
        .then(images.push('/images/'+ name))
        .catch(err => console.log(err));
    });
  } 
  images.map(item => {
    content = content.replace(/[\'\"]data:image[\'\"]?([^\'\"]*)[\'\"]?/,'\"'+config.imgPathHead+item+'\"')
  })
  // let txt = content.replace(/<img.*?(?:>|>)/gi, '); //筛选文本内容
  let article = articleModel({
    title: req.body.title,
    create_date: Date.now(),
    update_date: Date.now(),
    label: req.body.label,
    can_delete: req.body.can_delete,
    content,
    image_url: images
  });
  try {
    const data = await articleModel.add(article);
    const success = data ? 1 : 0;
    console.log(data);
    logger.info("Adding article..."+",ip="+req.ip);
    res.send({ success, data });
  } catch (err) {
    logger.error(err);
    logger.error("Error in add article-");
    res.send("Got error in add article");
  }
};
articleController.deleteArticle = async (req, res) => {
  let id = req.query.id;
  try {
    const data = await articleModel.delete(id);
    console.log(data);
    logger.info("Deleting article..."+",ip="+req.ip);
    res.send(data);
  } catch (err) {
    logger.error(err);
    logger.error("Error in delete article-");
    res.send("Got error in delete article");
  }
};
/**
 * 修改文章
 */
articleController.updateArticle = async (req, res) => {
  let content = req.body.content; //富文本字符串
  let src = content.match(/src=[\'\"]data:image[\'\"]?([^\'\"]*)[\'\"]?/g);    //正则截取图片src (base64格式的image)
  let arr = []; //图片信息
  let images = []; //图片地址
  if (src) {
    //带图片上传
    //去掉base64编码前缀并区别图片类型
    let imgData = src.map(item =>
      arr.push({
        data: new Buffer(item.slice(27), "base64"),
        type: item
          .split(",")[0]
          .match(/\/(\S*);/, "")[0]
          .replace(/\/|;/g, ""),
        filename: ""
      })
    );
    arr.map((item,index) => {
      let name =  Date.now() + '-' + index + "." + item.type
      item.filename = filePath + "/" + name;
      writeFile(item.filename, item.data)
        .then(images.push('/images/'+ name))
        .catch(err => console.log(err));
    });
  } 
  images.map(item => {
    content = content.replace(/[\'\"]data:image[\'\"]?([^\'\"]*)[\'\"]?/,'\"'+config.imgPathHead+item+'\"')
  })
  let id = req.body.id;
  let title = req.body.title;
  let label = req.body.label;
  try {
    const data = await articleModel.update(id,title,label,content);
    const success = data ? true: false;
    res.send({success,data});
    console.log(data);
    logger.info("Updating article..."+",ip="+req.ip);
  } catch (e) {
    logger.error(e);
    logger.error("Error in update article-");
    res.send("Got error in update article");
  }
};

/**
 * 优化后的查询
 */
articleController.getArticles = async (req, res) => {
  try {
    const keyWords = req.query.keyWords;
    const _id = req.query._id;
    let query;
    //const query = req.query._id ? { _id: req.query._id } : {}; //判断查询为单个还是所有
    if(_id){
      //根据Id查询
      query = { _id  };
    }else{
      if(keyWords){
        //带关键字的模糊搜索
        if(keyWords.indexOf('&')>0){
          //以&符号分割的
          let str =keyWords.replace(/\s+/g, ""); //去掉空格
          console.log(str)
          let content = str.split('&amp;').join('|')
          console.log(content)
          console.log(content.length)
          query = { $or:[
            { title: { $regex: new RegExp(content),$options:'xi' } },
            { label: { $regex: new RegExp(content),$options:'xi'} },
            { content: { $regex:new RegExp(content),$options:'xi' } }
          ] };
        }else{
          console.log(keyWords)
          let str = keyWords.replace(/\s+/g, "");
          str = str.toLowerCase();
          console.log('str:'+str)
          let content=nodejieba.cut(str)
          // let content=nodejieba.cut(keyWords.toLowerCase()).filter(item =>{
          //   if(item.trim()!==''){
          //     return item
          //   }
          // }); //过滤空串
          console.log(content)
          let str1 = content.join('.*');
          let str2 = content.reverse().join('.*');
          let res = str1+'|'+str2;
          console.log('res:')
          console.log(res)
        query = { $or:[
          { title: { $regex: new RegExp(res),$options:'xi' } },
          { label: { $regex: new RegExp(res),$options:'xi'} },
          { content: { $regex:new RegExp(res),$options:'xi' } }
        ] };
        }
      }else{
        //查询所有
        query = { };
        
      }
    }
    const [length,data] = await articleModel.get(
      query,
      req.query.skip,
      req.query.limit,
      req.query.count
    ); //判断是否分页以及根据Id查询单个还是所有
    logger.info("Getting article..."+",ip="+req.ip);
    res.send( { length,data });
  } catch (err) {
    logger.error(err);
    logger.error("Error in get article-");
    res.send("Got error in get article");
  }
};


articleController.getArticlesByKeyWords = async ( req, res ) => {
  try {
    const data = await articleModel.get()
  } catch (error) {
    console.log(error)
  }
}

articleController.addComment = async (req, res) => {
  let comment = {
    avatar: req.body.avatar,
    name: req.body.name,
    create_by: req.body.email,
    create_date: new Date(),
    content: req.body.content,
    type: req.body.type //1 评论 2 留言
  };
  let id = req.body.id;
  try {
    const data = await articleModel.addComment(id, comment);
    console.log(data);
    res.send({comment,success:true});
    logger.info("Adding comment..."+",ip="+req.ip);
  } catch (err) {
    logger.error(err);
    logger.error("Error in add comment-");
    res.send({success:false});
  }
};
articleController.deleteComment = async (req, res) => {
  try {
    let id = req.query.id;
    let commentId = req.query.commentId;
    console.log(id)
    console.log(commentId)
    const data = await articleModel.deleteComment(id,commentId);
    res.send({success:true,data});
    logger.info("Deleting comment..."+",ip="+req.ip)
  } catch (err) {
    logger.error(err);
    logger.error("Error in delete comment-");
    res.send({success:false});
  }
};
articleController.getComments = async (req, res) => {};
articleController.likeArticle = async (req, res) => {
  let id = req.body.id;
  let like = req.body.like
  try {
    const data = await articleModel.like(id,like);
    res.send(data)
    logger.info("Adding like ..."+",ip="+req.ip);
  } catch (error) {
    logger.error(error);
    logger.error("Error in add like-");
    res.send("Got error in add like");
  }
}
articleController.dislikeArticle = async (req, res) => {
  let id = req.body.id;
  let dislike = req.body.dislike
  try {
    const data = await articleModel.dislike(id,dislike);
    res.send(data)
    logger.info("Adding dislike ..."+",ip="+req.ip);
  } catch (error) {
    logger.error(error);
    logger.error("Error in add dislike-");
    res.send("Got error in add dislike");
  }
}
export default articleController;
