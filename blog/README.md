# 个人博客系统

前后端分离的个人博客，在基础博客功能上增加了两个自定义扩展：**文章置顶（`posts.is_top`）**、**文章收藏（`user_favorites` 表 + 收藏页）**。

- 后端：Node.js + Express 5 + MySQL（mysql2）+ JWT + bcryptjs
- 前端：React 19 + TypeScript + Vite + React Router 7 + axios + react-markdown

## 目录结构

```
temp_20261101_01/
├── blog-backend/
│   ├── app.js                 # 入口：cors、json、路由挂载、监听 3001
│   ├── config/db.js           # mysql2 连接池
│   ├── middleware/auth.js     # JWT 校验，挂载 req.user
│   ├── routes/
│   │   ├── auth.js            # 注册、登录
│   │   ├── posts.js           # 文章增删改查（置顶、分页、搜索）
│   │   ├── favorite.js        # 收藏 / 取消收藏 / 收藏列表
│   │   └── category.js        # 分类列表
│   ├── sql/init.sql           # 建库建表 + 分类数据 + 演示账号
│   └── .env                   # 端口、MySQL、JWT 配置
└── blog-frontend/
    ├── src/pages/             # Home / Login / Register / PostDetail / WritePost / Favorites
    ├── src/utils/request.ts   # axios 实例，自动带 Bearer token
    ├── src/context/AuthContext.tsx
    ├── src/types/index.ts
    └── .env                   # VITE_API_BASE_URL
```

## 运行步骤

### 0. 一键启动（Windows）

双击根目录的 `start.bat`（或在 PowerShell 执行 `.\start.ps1`），脚本会：

- 检查 Node.js 是否安装；
- 提示 `blog-backend\.env` 的 `DB_PASSWORD` 是否仍是占位符；
- 首次运行时自动 `npm install`；
- 分别为后端、前端打开独立窗口并执行 `npm run dev`。

关闭对应窗口即可停止服务（前置条件仍是：MySQL 已启动 + 已执行 `sql/init.sql`）。

### 1. 数据库

确认 MySQL 已启动，然后执行初始化脚本：

```bash
mysql -u root -p < blog-backend/sql/init.sql
```

脚本会创建 `blog_db`、4 张表（`users`、`categories`、`posts`、`user_favorites`），并写入 3 个分类和演示账号。

> `posts.tags` 为 JSON 列，需要 MySQL 5.7 及以上。

### 2. 后端

修改 `blog-backend/.env` 中的 `DB_PASSWORD` 为你的 MySQL 密码：

```
PORT=3001
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=你的mysql密码
DB_DATABASE=blog_db
JWT_SECRET=blog_secret_2026
JWT_EXPIRES_IN=7d
```

启动：

```bash
cd blog-backend
npm install
npm run dev          # node --watch app.js
```

成功会打印 `后端服务启动 http://127.0.0.1:3001`。

### 3. 前端

`blog-frontend/.env` 已配置接口地址：

```
VITE_API_BASE_URL=http://127.0.0.1:3001/api
```

启动：

```bash
cd blog-frontend
npm install
npm run dev          # 默认 http://localhost:5173
```

### 4. 演示账号

```
用户名：demo
密码：123456
```

（注册自己账号也可以，用户名 3-20 字符、密码至少 6 位）

## 页面与功能

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | Home | 文章列表，置顶文章排最前；登录后显示"我的收藏"与"退出登录" |
| `/login` | Login | 登录，成功后存 token 并跳首页 |
| `/register` | Register | 注册，成功后跳登录 |
| `/post/:id` | PostDetail | Markdown 渲染、浏览量 +1、收藏/取消收藏 |
| `/write` | WritePost | 发布文章：标题、分类、标签、封面、正文、**设为置顶** |
| `/favorites` | Favorites | 我的收藏列表，可取消收藏 |

## 接口清单

统一响应格式 `{ code, msg, data }`，`code = 200` 为成功。

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/auth/register` | 否 | 注册，返回 `data.userId` |
| POST | `/api/auth/login` | 否 | 登录，返回 `data.token` + `data.user` |
| GET | `/api/posts` | 否 | 列表，支持 `page`、`pageSize`、`keyword`、`category` |
| POST | `/api/posts` | 是 | 发布，返回顶层 `postId` |
| GET | `/api/posts/:id` | 否 | 详情（浏览量 +1） |
| PUT | `/api/posts/:id` | 是 | 更新（仅作者，全量更新） |
| DELETE | `/api/posts/:id` | 是 | 删除（仅作者） |
| POST | `/api/favorite/:postId` | 是 | 收藏（重复收藏幂等成功） |
| DELETE | `/api/favorite/:postId` | 是 | 取消收藏 |
| GET | `/api/favorite/list` | 是 | 我的收藏列表 |
| GET | `/api/categories` | 否 | 分类列表（写作页下拉用） |

鉴权方式：请求头 `Authorization: Bearer <token>`，token 载荷为 `{ id, username }`。

## 自定义扩展说明

1. **是否置顶**：`posts.is_top`（1 置顶 / 0 普通），列表排序为 `ORDER BY is_top DESC, created_at DESC`，前端标题前显示红色【置顶】。
2. **文章收藏**：`user_favorites` 表以 `uk_user_post(user_id, post_id)` 唯一键保证幂等；详情页按收藏列表判断当前文章状态，收藏页可管理。

## 已知限制

- 文章只有新建入口，编辑/删除接口已就绪但前端还没有入口。
- token 过期时收藏等接口返回 401，仅提示错误，不会自动清登录态跳转 `/login`。
- 收藏状态判断依赖拉取整个收藏列表，数据量大时建议增加单篇状态接口。
- 列表接口返回 `content` 全文（前端用于摘要），文章量大时可改为摘要字段。
