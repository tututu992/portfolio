const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 创建订单 POST /api/order/create   body: { addressId }
router.post("/create", auth, async (req, res) => {
  const uid = req.user.id;
  const addressId = Number(req.body.addressId);
  if (!addressId) return res.status(400).json({ code: 400, msg: "请选择收货地址" });

  // 地址必须存在且属于当前用户
  const [addr] = await pool.query("SELECT id FROM address WHERE id=? AND user_id=?", [addressId, uid]);
  if (addr.length === 0) return res.status(400).json({ code: 400, msg: "收货地址不存在" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [cartList] = await conn.query(
      `SELECT c.goods_id,c.num,g.price,g.stock,g.title
         FROM cart c LEFT JOIN goods g ON c.goods_id=g.id
        WHERE c.user_id=?`,
      [uid]
    );
    if (cartList.length === 0) {
      await conn.rollback();
      return res.status(400).json({ code: 400, msg: "购物车为空" });
    }

    // 商品被删除或库存不足时不允许下单
    for (const item of cartList) {
      if (item.price === null) {
        await conn.rollback();
        return res.status(400).json({ code: 400, msg: `商品「${item.title ?? item.goods_id}」已下架` });
      }
      if (item.num > item.stock) {
        await conn.rollback();
        return res.status(400).json({ code: 400, msg: `商品「${item.title}」库存不足` });
      }
    }

    let total = 0;
    for (const item of cartList) total += Number(item.price) * item.num;
    total = Number(total.toFixed(2));

    const [orderRes] = await conn.query("INSERT INTO orders(user_id,total_price,address_id) VALUES(?,?,?)", [uid, total, addressId]);
    const orderId = orderRes.insertId;

    for (const item of cartList) {
      await conn.query("INSERT INTO order_item(order_id,goods_id,price,num) VALUES(?,?,?,?)", [orderId, item.goods_id, item.price, item.num]);
      // 扣减库存并累加销量
      await conn.query("UPDATE goods SET stock=stock-?, sales=sales+? WHERE id=?", [item.num, item.num, item.goods_id]);
    }

    await conn.query("DELETE FROM cart WHERE user_id=?", [uid]);
    await conn.commit();
    res.json({ code: 200, msg: "下单成功", data: { orderId, total_price: total } });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ code: 500, msg: "下单失败", err: e.message });
  } finally {
    conn.release();
  }
});

// 订单列表 GET /api/order
router.get("/", auth, async (req, res) => {
  const [list] = await pool.query(
    "SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC, id DESC",
    [req.user.id]
  );
  res.json({ code: 200, data: list });
});

// 订单详情（含商品明细） GET /api/order/:id
router.get("/:id", auth, async (req, res) => {
  const [orders] = await pool.query("SELECT * FROM orders WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
  if (orders.length === 0) return res.status(404).json({ code: 404, msg: "订单不存在" });

  const [items] = await pool.query(
    `SELECT oi.id,oi.goods_id,oi.price,oi.num,g.title,g.cover
       FROM order_item oi LEFT JOIN goods g ON oi.goods_id=g.id
      WHERE oi.order_id=?`,
    [req.params.id]
  );
  res.json({ code: 200, data: { ...orders[0], items } });
});

module.exports = router;
