const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 分类列表 GET /api/categories
router.get("/",async (req,res)=>{
  const [rows] = await pool.query("SELECT id,name,description FROM categories ORDER BY id");
  res.json({code:200,data:rows})
})

module.exports = router;
