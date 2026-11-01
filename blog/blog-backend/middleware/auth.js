const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if(!token){
    return res.status(401).json({code:401,msg:"未登录，请登录"});
  }
  try {
    const payload = jwt.verify(token,process.env.JWT_SECRET);
    req.user = payload;
    next();
  }catch(err){
    return res.status(401).json({code:401,msg:"token失效，请重新登录"});
  }
}

module.exports = authMiddleware;
