import express from "express";
import articleController from "../controllers/article"
const articleRouter = express.Router();


articleRouter.post('/addArticle', (req, res) => {
  articleController.addArticle(req,res);
});
articleRouter.delete('/deleteArticle', (req, res) => {
  articleController.deleteArticle(req,res);
});
articleRouter.put('/updateArticle', (req, res) => {
  articleController.updateArticle(req,res);
});
articleRouter.get('/getArticles', (req, res) => {
  articleController.getArticles(req,res);
});
articleRouter.post('/addComment',(req,res) => {
  articleController.addComment(req,res);
});
articleRouter.delete('/deleteComment',(req,res) => {
  articleController.deleteComment(req,res);
});
articleRouter.get('/getComments',(req,res) => {
  articleController.getComments(req,res);
});
articleRouter.post('/likeArticle',(req,res) => {
  articleController.likeArticle(req,res);
})
articleRouter.post('/cancelLikeArticle',(req,res) => {
  articleController.cancelLikeArticle(req,res);
})
articleRouter.post('/dislikeArticle',(req,res) => {
  articleController.dislikeArticle(req,res);
})
articleRouter.post('/cancelDislikeArticle',(req,res) => {
  articleController.cancelDislikeArticle(req,res);
})
export default articleRouter;
