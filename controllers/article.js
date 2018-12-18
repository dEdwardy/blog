import articleModel from '../models/article';
import logger from '../core/logger/app-logger';

const articleController = { };
articleController.addArticle = async (req,res) => {
  let article = articleModel({
  name: req.body.name,
  create_date: Date.now(),
  update_date: Date.now(),
  label: req.body.label,
  can_delete: req.body.can_delete,
  content: req.body.content,
  image_url: req.body.imagel_url
  });
  try {
    const data = await articleModel.add(article);
    console.log(data);
    logger.info('Adding article...');
    res.send(article);
  }catch (err) {
    logger.error(err)
    logger.error('Error in add article-');
    res.send('Got error in add article');
  }
  
};
articleController.deleteArticle = async (req,res) => {
  let id=req.body.id;
  try {
    const data = await articleModel.delete(id);
    console.log(data);
    logger.info('Deleting article...');
    res.send(data);
  }catch (err) {
    logger.error(err)
    logger.error('Error in delete article-');
    res.send('Got error in delete article');
  }
};
articleController.getArticles = async (req,res) => {
  try {
    console.log(typeof req.query.count)
    const articles = await articleModel.get(req.query.skip,req.query.limit,req.query.count);
    console.log(articles);
    logger.info('Getting article...');
    res.send(!isNaN(articles)?{length:3}:articles);
  }catch (err) {
    logger.error(err)
    logger.error('Error in get article-');
    res.send('Got error in get article');
  }
};
articleController.updateArticle = async (req,res) => {
  let id = req.body.id;
  let content = req.body.content;
  try {
    const data = await articleModel.update(id,content);
    res.send(data);
    console.log(data);
    logger.info('Updating article...');
  }catch (e) {
    logger.error(e)
    logger.error('Error in update article-');
    res.send('Got error in update article');
  }
  
};
articleController.addComment = async (req,res) => {
  let comment = {
    create_by: req.body.create_by,
    create_date: new Date(),
    content: req.body.content,
    type: req.body.type  //1 评论 2 留言
  };
  let id =req.body.id;
  try {
    const data =await articleModel.addComment(id,comment);
    console.log(data)
    res.send(comment);
    logger.info('Adding comment...');
  }catch (err) {
    logger.error(err)
    logger.error('Error in add comment-');
    res.send('Got error in add comment');
    
  }
};
articleController.deleteComment = async  (req,res) => {

};
articleController.getComments = async  (req,res) => {

};

export default articleController;
