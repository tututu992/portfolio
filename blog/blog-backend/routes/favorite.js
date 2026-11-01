const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 收藏文章 POST /api/favorite/:postId
router.post("/:postId",auth,async(req,res)=>{
  const userId = req.user.id;
  const postId = req.params.postId;
  try{
    // 先确认文章存在，否则外键会失败
    const [posts] = await pool.query("SELECT id FROM posts WHERE id=?",[postId]);
    if(posts.length===0){
      return res.status(404).json({code:404,msg:"文章不存在"});
    }
    await pool.query("INSERT IGNORE INTO user_favorites(user_id,post_id) VALUES(?,?)",[userId,postId])
    res.json({code:200,msg:"收藏成功"})
  }catch(e){
    res.status(500).json({code:500,msg:"收藏失败"})
  }
})

//取消收藏 DELETE /api/favorite/:postId
router.delete("/:postId",auth,async(req,res)=>{
  const userId = req.user.id;
  const postId = req.params.postId;
  await pool.query("DELETE FROM user_favorites WHERE user_id=? AND post_id=?",[userId,postId])
  res.json({code:200,msg:"已取消收藏"})
})

// 我的收藏列表 GET /api/favorite/list
router.get("/list",auth,async(req,res)=>{
  const userId = req.user.id;
  const [list] = await pool.query(
    `SELECT f.id AS favorite_id,f.created_at AS favorite_at,
            p.id,p.title,p.cover,p.category,p.tags,p.views,p.is_top,p.created_at,
            u.username AS author_name
     FROM user_favorites f
     JOIN posts p ON f.post_id=p.id
     LEFT JOIN users u ON p.author_id=u.id
     WHERE f.user_id=?
     ORDER BY f.created_at DESC`,
    [userId]
  )
  res.json({code:200,msg:"ok",data:list})
})

module.exports = router;
