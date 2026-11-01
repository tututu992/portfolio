const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// 地址列表 GET /api/address
router.get("/", auth, async (req, res) => {
  const [list] = await pool.query(
    "SELECT * FROM address WHERE user_id=? ORDER BY is_default DESC, id DESC",
    [req.user.id]
  );
  res.json({ code: 200, data: list });
});

// 新增地址 POST /api/address
router.post("/", auth, async (req, res) => {
  const uid = req.user.id;
  const { receiver_name, phone, address_detail, is_default } = req.body;
  if (!receiver_name || !phone || !address_detail) {
    return res.status(400).json({ code: 400, msg: "收件人、手机号、详细地址不能为空" });
  }
  const isDefault = is_default ? 1 : 0;
  if (isDefault) {
    // 一个用户只保留一个默认地址
    await pool.query("UPDATE address SET is_default=0 WHERE user_id=?", [uid]);
  }
  const [result] = await pool.query(
    "INSERT INTO address(user_id,receiver_name,phone,address_detail,is_default) VALUES(?,?,?,?,?)",
    [uid, receiver_name, phone, address_detail, isDefault]
  );
  res.json({ code: 200, msg: "新增地址成功", data: { id: result.insertId } });
});

// 删除地址 DELETE /api/address/:id
router.delete("/:id", auth, async (req, res) => {
  await pool.query("DELETE FROM address WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
  res.json({ code: 200, msg: "删除成功" });
});

module.exports = router;
