import articleModel from "../models/article";
import logger from "../core/logger/app-logger";
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
articleController.addArticle = async (req, res) => {
  let content = req.body.content; //富文本字符串
  let src = content.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/g); //正则截取图片src
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
  let txt = content.replace(/<img.*?(?:>|>)/gi, ""); //筛选文本内容
  let article = articleModel({
    title: req.body.title,
    create_date: Date.now(),
    update_date: Date.now(),
    label: req.body.label,
    can_delete: req.body.can_delete,
    content: txt,
    image_url: images
  });
  try {
    const data = await articleModel.add(article);
    const success = data ? 1 : 0;
    console.log(data);
    logger.info("Adding article...");
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
    logger.info("Deleting article...");
    res.send(data);
  } catch (err) {
    logger.error(err);
    logger.error("Error in delete article-");
    res.send("Got error in delete article");
  }
};
articleController.getArticles = async (req, res) => {
  try {
    console.log(typeof req.query.count);
    console.log("_id:" + req.query._id);
    console.log(req.query)
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
          let content = keyWords.split('&').join('|')
          console.log(content)
          console.log(content.length)
          query = { $or:[
            { title: { $regex: new RegExp(content),$options:'xi' } },
            { label: { $regex: new RegExp(content),$options:'xi'} },
            { content: { $regex:new RegExp(content),$options:'xi' } }
          ] };
        }else{
          
          let content=nodejieba.cut(keyWords.toLowerCase()).filter(item =>{
            if(item.trim()!==''){
              return item
            }
          }); //过滤空串
          console.log(content)
          let str1 = content.join('.*');
          let str2 = content.reverse().join('.*');
          let res = str1+'|'+str2;
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
    const data = await articleModel.get(
      query,
      req.query.skip,
      req.query.limit,
      req.query.count
    ); //判断是否分页以及根据Id查询单个还是所有
    logger.info("Getting article...");
    res.send(!isNaN(data) ? { length: data } : { data });
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
articleController.updateArticle = async (req, res) => {
  let id = req.body.id;
  let content = req.body.content;
  try {
    const data = await articleModel.update(id, content);
    res.send(data);
    console.log(data);
    logger.info("Updating article...");
  } catch (e) {
    logger.error(e);
    logger.error("Error in update article-");
    res.send("Got error in update article");
  }
};
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
    logger.info("Adding comment...");
  } catch (err) {
    logger.error(err);
    logger.error("Error in add comment-");
    res.send({success:false});
  }
};
articleController.deleteComment = async (req, res) => {};
articleController.getComments = async (req, res) => {};
articleController.likeArticle = async (req, res) => {
  let id = req.body.id;
  let like = req.body.like
  try {
    const data = await articleModel.like(id,like);
    res.send(data)
    logger.info("Adding like ...");
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
    logger.info("Adding dislike ...");
  } catch (error) {
    logger.error(error);
    logger.error("Error in add dislike-");
    res.send("Got error in add dislike");
  }
}
export default articleController;
