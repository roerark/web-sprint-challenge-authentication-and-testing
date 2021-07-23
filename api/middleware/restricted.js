const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../secrets");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    next({ message: "token required", status: 401 });
  } else {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        next({ message: "token invalid", status: 401 });
      } else {
        req.decodedToken = decoded;
        next();
      }
    });
  }
};
