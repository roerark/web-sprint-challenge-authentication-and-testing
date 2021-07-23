const Users = require("../users/users-model");

const validateUserBody = (req, res, next) => {
  if (
    !req.body.username ||
    req.body.username === "" ||
    !req.body.password ||
    req.body.password === ""
  ) {
    next({ message: "username and password are required", status: 400 });
  } else {
    next();
  }
};

const checkUniqueUsername = async (req, res, next) => {
  const { username } = req.body;
  const [user] = await Users.findBy({ username });
  if (!user) {
    next();
  } else {
    next({ message: "username taken", status: 400 });
  }
};

const checkUsernameExists = async (req, res, next) => {
  const { username } = req.body;
  const [user] = await Users.findBy({ username });
  if (!user) {
    next({ message: "invalid credentials", status: 401 });
  } else {
    req.body.user = user;
    next();
  }
};

module.exports = {
  validateUserBody,
  checkUniqueUsername,
  checkUsernameExists,
};
