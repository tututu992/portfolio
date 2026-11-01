const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

//注册路由
const authRouter = require('./routes/auth');
const postRouter = require('./routes/posts');
const favRouter = require('./routes/favorite');
const categoryRouter = require('./routes/category');

app.use("/api/auth",authRouter);
app.use("/api/posts",postRouter);
app.use("/api/favorite",favRouter);
app.use("/api/categories",categoryRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT,()=>{
  console.log(`后端服务启动 http://127.0.0.1:${PORT}`);
})
