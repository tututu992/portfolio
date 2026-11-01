const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 创建文章（需要登录）POST /api/posts
router.post("/",auth,async (req,res)=>{
  try{
    const {title,content,category,tags,cover,is_top}=req.body;
    const author_id = req.user.id;
    const [result] = await pool.query(
      "INSERT INTO posts(title,content,category,tags,cover,author_id,is_top) VALUES(?,?,?,?,?,?,?)",
      [title,content,category,JSON.stringify(tags),cover,author_id,is_top??0]
    )
    res.json({code:200,msg:"发布成功",postId:result.insertId})
  }catch(e){
    res.status(500).json({code:500,msg:"发布失败",err:e.message})
  }
})

// 获取文章列表 GET /api/posts
router.get("/",async (req,res)=>{
  const page = Number(req.query.page)||1;
  const pageSize = Number(req.query.pageSize)||10;
  const offset = (page-1)*pageSize;
  const keyword = req.query.keyword||"";
  const category = req.query.category||null;

  let sql = `SELECT p.id,p.title,p.content,p.cover,p.category,p.tags,p.author_id,p.views,p.is_top,p.created_at,p.updated_at,u.username as author_name FROM posts p LEFT JOIN users u ON p.author_id=u.id WHERE 1=1 `;
  let countSql = `SELECT COUNT(*) total FROM posts p WHERE 1=1 `;
  let params = [];
  let countParams = [];
  if(keyword){
    sql += " AND (p.title LIKE ? OR p.content LIKE ?)";
    countSql += " AND (title LIKE ? OR content LIKE ?)";
    params.push(`%${keyword}%`,`%${keyword}%`)
    countParams.push(`%${keyword}%`,`%${keyword}%`)
  }
  if(category){
    sql += " AND p.category=?";
    countSql += " AND category=?";
    params.push(category)
    countParams.push(category)
  }
  sql += ` ORDER BY p.is_top DESC, p.created_at DESC LIMIT ?,?`
  params.push(offset,pageSize);

  const [list] = await pool.query(sql,params);
  const [countRes] = await pool.query(countSql,countParams);
  const total = countRes[0].total;
  res.json({code:200,data:{list,total,page,pageSize}})
})

// 文章详情 GET /api/posts/:id
router.get("/:id",async (req,res)=>{
  const id = req.params.id;
  await pool.query("UPDATE posts SET views=views+1 WHERE id=?",[id]);
  const [rows] = await pool.query(`SELECT p.*,u.username author_name FROM posts p LEFT JOIN users u ON p.author_id=u.id WHERE p.id=?`,[id])
  if(rows.length===0) return res.status(404).json({code:404,msg:"文章不存在"})
  res.json({code:200,data:rows[0]})
})

// 更新文章 PUT /api/posts/:id
router.put("/:id",auth,async (req,res)=>{
  const id = req.params.id;
  const userId = req.user.id;
  const {title,content,category,tags,cover,is_top}=req.body;
  const [post] = await pool.query("SELECT * FROM posts WHERE id=?",[id]);
  if(post.length===0) return res.status(404).json({code:404,msg:"文章不存在"});
  if(post[0].author_id!==userId) return res.status(403).json({code:403,msg:"无权修改别人文章"})

  await pool.query(`UPDATE posts SET title=?,content=?,category=?,tags=?,cover=?,is_top=? WHERE id=?`,
    [title,content,category,JSON.stringify(tags),cover,is_top,id])
  res.json({code:200,msg:"更新成功"})
})

// 删除文章 DELETE /api/posts/:id
router.delete("/:id",auth,async (req,res)=>{
  const id = req.params.id;
  const userId = req.user.id;
  const [post] = await pool.query("SELECT * FROM posts WHERE id=?",[id]);
  if(post.length===0) return res.status(404).json({code:404,msg:"文章不存在"});
  if(post[0].author_id!==userId) return res.status(403).json({code:403,msg:"无权删除"})
  // 先删关联收藏记录，避免触发 user_favorites 外键约束
  await pool.query("DELETE FROM user_favorites WHERE post_id=?",[id]);
  await pool.query("DELETE FROM posts WHERE id=?",[id]);
  res.json({code:200,msg:"删除成功"})
})

module.exports = router;
