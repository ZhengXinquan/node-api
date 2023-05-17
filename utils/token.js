var jwt = require('jsonwebtoken');
class TOKEN {
  constructor(h = 1) {
    this.secretOrPrivateKey = 'guan_er_xian_sheng_2021-12-2 17:44:30';
    this.expiresIn = 60 * 60* h; //1 小时
    return this;
  }
  sign(id, user, name) {
    let content = { id, user, name }; // 要生成token的主题信息
    let token = jwt.sign(content, this.secretOrPrivateKey, {
      expiresIn: 60 * 60 * 1, // 1小时过期
    });
    this.token = token;
    return token;
  }
  // 同步
  verifySyn(token) {
    token = token.replace('Bearer ', '');
    try {
      return jwt.verify(token, this.secretOrPrivateKey);
    } catch (err) {
      return false;
    }
  }
  // 异步
  verifyAsy(token) {
    return this.verify(token);
  }
  verify(token) {
    token = token.replace('Bearer ', '');
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secretOrPrivateKey, function (err, decode) {
        if (err) {
          //  时间失效的时候/ 伪造的token
          reject(false);
        } else {
          resolve(decode);
        }
      });
    });
  }
}

module.exports = TOKEN;
