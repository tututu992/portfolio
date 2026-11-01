CREATE DATABASE IF NOT EXISTS shop_db DEFAULT CHARACTER SET utf8mb4;
USE shop_db;

-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 商品分类
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

-- 商品表 ✨自定义tags标签
CREATE TABLE goods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  cover VARCHAR(255),
  category_id INT,
  tags JSON,
  description TEXT,
  sales INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ✨自定义：商品收藏表
CREATE TABLE goods_favorite (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  goods_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_goods(user_id,goods_id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(goods_id) REFERENCES goods(id)
);

-- 购物车
CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  goods_id INT NOT NULL,
  num INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(goods_id) REFERENCES goods(id)
);

-- ✨自定义：收货地址表
CREATE TABLE address (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  receiver_name VARCHAR(50),
  phone VARCHAR(20),
  address_detail TEXT,
  is_default TINYINT DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 订单表
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_price DECIMAL(10,2),
  status TINYINT DEFAULT 0, -- 0待支付 1已支付 2已发货 3已完成
  address_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 订单详情
CREATE TABLE order_item (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  goods_id INT NOT NULL,
  price DECIMAL(10,2),
  num INT,
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(goods_id) REFERENCES goods(id)
);

-- 演示数据：分类
INSERT INTO categories(id,name,description) VALUES
(1,'数码产品','手机、耳机等数码设备'),
(2,'家居生活','居家日用品'),
(3,'图书文具','书籍与办公文具');

-- 演示数据：演示账号 demo / 123456
INSERT INTO users(id,username,email,password) VALUES
(1,'demo','demo@shop.com','$2b$10$LUs/ZRWKXq7Fwrthk3R0OetxANlzFKTliQwxdOiBaS5s72o7nEvRC');

-- 演示数据：商品
INSERT INTO goods(id,title,price,stock,category_id,tags,description,sales) VALUES
(1,'无线蓝牙耳机',199.00,50,1,'["数码","耳机","热销"]','入耳式降噪蓝牙耳机，续航 24 小时。',120),
(2,'机械键盘 87 键',329.00,30,1,'["数码","键盘","办公"]','青轴手感，支持热插拔。',60),
(3,'陶瓷马克杯',39.90,100,2,'["家居","杯子"]','330ml 釉下彩陶瓷杯，可微波。',210),
(4,'纯棉四件套',269.00,20,2,'["家居","床品"]','60 支长绒棉，1.8m 床适用。',45),
(5,'《深入理解计算机系统》',128.00,15,3,'["图书","编程"]','原书第 3 版，计算机专业经典教材。',33),
(6,'A5 硬面笔记本',19.90,200,3,'["文具","笔记本"]','120 页道林纸，可平摊书写。',180);

-- 演示数据：demo 用户默认地址
INSERT INTO address(id,user_id,receiver_name,phone,address_detail,is_default) VALUES
(1,1,'张三','13800138000','北京市朝阳区xx路1号',1);
