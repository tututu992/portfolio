const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 商品列表 GET /api/goods?page=&pageSize=&keyword=&category_id=
router.get("/", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  const keyword = req.query.keyword || "";
  const cid = req.query.category_id || null;

  // 列表与计数共用同一套过滤条件，保证 total 与搜索/分类结果一致
  let where = " WHERE 1=1 ";
  const params = [];
  if (keyword) { where += " AND title LIKE ? "; params.push(`%${keyword}%`); }
  if (cid) { where += " AND category_id=? "; params.push(cid); }

  const [list] = await pool.query(
    `SELECT id,title,price,stock,cover,category_id,tags,description,sales,created_at FROM goods ${where} ORDER BY created_at DESC, id DESC LIMIT ?,?`,
    [...params, offset, pageSize]
  );
  const [cnt] = await pool.query(`SELECT COUNT(*) total FROM goods ${where}`, params);
  res.json({ code: 200, data: { list, total: cnt[0].total, page, pageSize } });
});

// 商品分类 GET /api/goods/categories（放在 /:id 之前，避免被当成 id）
router.get("/categories", async (_req, res) => {
  const [list] = await pool.query("SELECT id,name,description FROM categories ORDER BY id");
  res.json({ code: 200, data: list });
});

// 商品详情 GET /api/goods/:id
router.get("/:id", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT g.*,c.name AS category_name FROM goods g LEFT JOIN categories c ON g.category_id=c.id WHERE g.id=?",
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ code: 404, msg: "商品不存在" });
  res.json({ code: 200, data: rows[0] });
});

module.exports = router;
