const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 收藏商品 POST /api/favorite/:goodsId
router.post("/:goodsId", auth, async (req, res) => {
  const uid = req.user.id;
  const gid = req.params.goodsId;

  // INSERT IGNORE 会把外键失败降级为 warning，先校验商品是否存在
  const [goods] = await pool.query("SELECT id FROM goods WHERE id=?", [gid]);
  if (goods.length === 0) return res.status(404).json({ code: 404, msg: "商品不存在" });

  await pool.query("INSERT IGNORE INTO goods_favorite(user_id,goods_id) VALUES(?,?)", [uid, gid]);
  res.json({ code: 200, msg: "收藏成功" });
});

// 取消收藏 DELETE /api/favorite/:goodsId
router.delete("/:goodsId", auth, async (req, res) => {
  await pool.query("DELETE FROM goods_favorite WHERE user_id=? AND goods_id=?", [req.user.id, req.params.goodsId]);
  res.json({ code: 200, msg: "已取消收藏" });
});

// 我的收藏 GET /api/favorite/list
router.get("/list", auth, async (req, res) => {
  const [list] = await pool.query(
    `SELECT f.goods_id, f.created_at AS favorite_at,
            g.title, g.price, g.stock, g.cover, g.tags, g.sales
       FROM goods_favorite f
       LEFT JOIN goods g ON f.goods_id=g.id
      WHERE f.user_id=?
      ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  res.json({ code: 200, data: list });
});

module.exports = router;
