const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// 注册 POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ code: 400, msg: "用户名、邮箱、密码不能为空" });
    if (username.length < 3 || username.length > 20) return res.status(400).json({ code: 400, msg: "用户名需 3-20 个字符" });
    if (password.length < 6) return res.status(400).json({ code: 400, msg: "密码至少 6 位" });

    const [exist] = await pool.query("SELECT id FROM users WHERE username=? OR email=?", [username, email]);
    if (exist.length > 0) return res.status(400).json({ code: 400, msg: "用户名或邮箱已存在" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query("INSERT INTO users(username,email,password) VALUES(?,?,?)", [username, email, hash]);
    res.json({ code: 200, msg: "注册成功", data: { userId: result.insertId } });
  } catch (e) {
    res.status(500).json({ code: 500, msg: "服务器错误", err: e.message });
  }
});

// 登录 POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ code: 400, msg: "用户名和密码不能为空" });

    const [users] = await pool.query("SELECT * FROM users WHERE username=?", [username]);
    if (users.length === 0) return res.status(400).json({ code: 400, msg: "用户不存在" });

    const user = users[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ code: 400, msg: "密码错误" });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({
      code: 200,
      msg: "登录成功",
      data: { token, user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar } }
    });
  } catch (e) {
    res.status(500).json({ code: 500, msg: "服务器错误", err: e.message });
  }
});

module.exports = router;
