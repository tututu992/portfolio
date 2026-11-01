const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 购物车列表 GET /api/cart
router.get("/", auth, async (req, res) => {
  const [list] = await pool.query(
    `SELECT c.id,c.goods_id,c.num,g.title,g.price,g.stock,g.cover
       FROM cart c LEFT JOIN goods g ON c.goods_id=g.id
      WHERE c.user_id=?
      ORDER BY c.created_at DESC`,
    [req.user.id]
  );
  res.json({ code: 200, data: list });
});

// 加入购物车 POST /api/cart/add
router.post("/add", auth, async (req, res) => {
  const uid = req.user.id;
  const { goodsId, num } = req.body;
  const count = Number(num) || 1;
  if (!goodsId) return res.status(400).json({ code: 400, msg: "缺少商品 id" });
  if (count < 1) return res.status(400).json({ code: 400, msg: "数量必须大于 0" });

  const [goods] = await pool.query("SELECT id,stock FROM goods WHERE id=?", [goodsId]);
  if (goods.length === 0) return res.status(404).json({ code: 404, msg: "商品不存在" });

  const [exist] = await pool.query("SELECT id,num FROM cart WHERE user_id=? AND goods_id=?", [uid, goodsId]);
  if (exist.length > 0) {
    const next = exist[0].num + count;
    if (next > goods[0].stock) return res.status(400).json({ code: 400, msg: "库存不足" });
    await pool.query("UPDATE cart SET num=? WHERE user_id=? AND goods_id=?", [next, uid, goodsId]);
  } else {
    if (count > goods[0].stock) return res.status(400).json({ code: 400, msg: "库存不足" });
    await pool.query("INSERT INTO cart(user_id,goods_id,num) VALUES(?,?,?)", [uid, goodsId, count]);
  }
  res.json({ code: 200, msg: "加入购物车" });
});

// 修改数量 PUT /api/cart/:id
router.put("/:id", auth, async (req, res) => {
  const count = Number(req.body.num);
  if (!count || count < 1) return res.status(400).json({ code: 400, msg: "数量必须大于 0" });

  const [rows] = await pool.query(
    "SELECT c.id,g.stock FROM cart c LEFT JOIN goods g ON c.goods_id=g.id WHERE c.id=? AND c.user_id=?",
    [req.params.id, req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ code: 404, msg: "购物车记录不存在" });
  if (count > rows[0].stock) return res.status(400).json({ code: 400, msg: "库存不足" });

  await pool.query("UPDATE cart SET num=? WHERE id=? AND user_id=?", [count, req.params.id, req.user.id]);
  res.json({ code: 200, msg: "修改成功" });
});

// 删除购物车记录 DELETE /api/cart/:id
router.delete("/:id", auth, async (req, res) => {
  await pool.query("DELETE FROM cart WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
  res.json({ code: 200, msg: "删除成功" });
});

module.exports = router;
