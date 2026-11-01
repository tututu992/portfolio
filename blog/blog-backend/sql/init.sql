CREATE DATABASE IF NOT EXISTS blog_db DEFAULT CHARACTER SET utf8mb4;
USE blog_db;

-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  gender TINYINT DEFAULT 0, -- 0未知 1男 2女【自定义字段】
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 分类表
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

-- 文章表 ✨自定义is_top是否置顶
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content LONGTEXT,
  cover VARCHAR(255),
  category INT,
  tags JSON,
  author_id INT NOT NULL,
  views INT DEFAULT 0,
  is_top TINYINT DEFAULT 0, -- 1置顶 0不置顶【自定义新增】
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (category) REFERENCES categories(id)
);

-- ✨自定义：用户收藏文章表
CREATE TABLE user_favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_post(user_id,post_id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(post_id) REFERENCES posts(id)
);

-- 初始化分类数据
INSERT INTO categories (name, description) VALUES
('前端', 'React / Vue / 工程化'),
('后端', 'Node.js / 数据库 / 服务端'),
('随笔', '日常记录与思考');

-- 可选：演示账号 demo / 123456（密码为 bcrypt(10) 哈希，可直接用于登录联调）
INSERT INTO users (username, email, password, gender)
VALUES ('demo', 'demo@blog.local', '$2b$10$GXD289QLdsDvcNuXk027kO.EtXA/NbrgiTz0f6w1C/8CsEmx5Rz7W', 0)
ON DUPLICATE KEY UPDATE username = username;
