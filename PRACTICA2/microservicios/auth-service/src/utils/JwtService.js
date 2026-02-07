
const jwt = require('jsonwebtoken');

class JwtService {
  generate(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
  }
}

module.exports = JwtService;


/*
const jwt = require('jsonwebtoken');

class JwtService {
  generate(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  }
}

module.exports = JwtService;
*/