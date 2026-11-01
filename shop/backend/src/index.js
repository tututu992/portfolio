const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authRouter = require('./routes/auth');
const goodsRouter = require('./routes/goods');
const favRouter = require('./routes/favorite');
const cartRouter = require('./routes/cart');
const addrRouter = require('./routes/address');
const orderRouter = require('./routes/order');

// 健康检查（用于确认服务与数据库连通性）
app.get("/api/health", async (_req, res) => {
  try {
    await require('./config/db').query('SELECT 1');
    res.json({ code: 200, msg: "ok", data: { db: true } });
  } catch (e) {
    res.status(500).json({ code: 500, msg: "数据库连接失败", err: e.code || e.message });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/goods", goodsRouter);
app.use("/api/favorite", favRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addrRouter);
app.use("/api/order", orderRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ code: 404, msg: "接口不存在" });
});

// 全局异常（Express 5 会自动把 async 路由抛出的错误交给这里）
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ code: 500, msg: "服务器错误", err: err.message });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`后端启动 http://127.0.0.1:${PORT}`));
