import articleModel from "../models/article";
import logger from "../core/logger/app-logger";
import { promisify } from "util";
import fs from "fs";
import path from "path";
const writeFile = promisify(fs.writeFile);
const filePath = path.resolve("./public/images");
const articleController = {};

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
      let date = Date.now() + '-' + index + "." + item.type;
      item.filename = filePath + "/" + date;
      writeFile(item.filename, item.data)
        .then(images.push('/images/'+ date))
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
    const query = req.query._id ? { _id: req.query._id } : {}; //判断查询为单个还是所有
    const data = await articleModel.get(
      query,
      req.query.skip,
      req.query.limit,
      req.query.count
    ); //判断是否分页以及查询单个还是所有
    logger.info("Getting article...");
    res.send(!isNaN(data) ? { length: data } : { data });
  } catch (err) {
    logger.error(err);
    logger.error("Error in get article-");
    res.send("Got error in get article");
  }
};
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
    create_by: req.body.create_by,
    create_date: new Date(),
    content: req.body.content,
    type: req.body.type //1 评论 2 留言
  };
  let id = req.body.id;
  try {
    const data = await articleModel.addComment(id, comment);
    console.log(data);
    res.send(comment);
    logger.info("Adding comment...");
  } catch (err) {
    logger.error(err);
    logger.error("Error in add comment-");
    res.send("Got error in add comment");
  }
};
articleController.deleteComment = async (req, res) => {};
articleController.getComments = async (req, res) => {};

export default articleController;
