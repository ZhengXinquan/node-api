var {utilsSql,moment,crypto,TOKEN,config} = require('../utils');
class ClassName {
  constructor() {
    this.tableName = 'zz_user';
  }
  login(account, pwd) {

    return new Promise((resolve, reject) => {
      this.getUserByLoginName(account)
        .then(user => {
          if (this.passwordMd5(pwd, user.salt) !== user.pwd) {
            reject({ message: 'account or pwd wrong' });
          }
          const token = new TOKEN().sign(user.id, user.user, user.name);
          this.update({ id: user.id, token: token }).then(e => {
            console.log('update user token',e);
          });
          user['token'] = token;
          console.log('user.token', token);
          resolve(user);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  randomSalt() {
    const timestamp = +new Date() + '';
    const randomNum = parseInt((1 + Math.random()) * 65536) + '';
    return (+(randomNum + timestamp)).toString(32);
  }
  passwordMd5(pwd, salt) {
    let content = pwd + config.DEFAULT_SALT;
    content = crypto.createHash('md5').update(content).digest('hex');
    content = content + salt;
    let md5_pwd = crypto.createHash('md5').update(content).digest('hex');
    return md5_pwd;
  }
  getUserByToken(token='') {
    token=token.replace('Bearer ','');
    return new Promise((resolve, reject) => {
      new TOKEN()
        .verify(token)
        .then(e => {
          this.getById(e.id)
            .then(user => {
              if (user.token === token) {
                resolve(user);
              } else {
                reject('token 过期');
              }
            })
            .catch(e => reject(e));
        })
        .catch(e => {
          console.log('getUserByToken TOKEN.verify => ERR');
          reject('TOKEN ERR');
        });
    });
  }
  getUserByLoginName(loginName) {
    return new Promise((resolve, reject) => {
      this.list({ user: loginName })
        .then(result => {
          if (!Array.isArray(result)) {
            reject(result);
          }
          if (result.length != 1) {
            reject(result);
          }
          let user = result[0];
          resolve(user);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  getById(id) {
    return new Promise((resolve, reject) => {
      this.list({ id: id })
        .then(result => {
          if (!Array.isArray(result)) {
            reject(result);
          }
          if (result.length != 1) {
            reject(result);
          }
          let user = result[0];
          resolve(user);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  add(o) {
    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();

      const sqlString = `INSERT INTO ${this.tableName}(user, ip, location, create_time) VALUES (?,?,?,?)`;
      const sqlParams = [o.user, o.ip, o.location, moment().format('YYYY-MM-DD HH:mm:ss')];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          console.log('[INSERT ERROR] - ', err.message);
          reject('INSERT ERROR');
          return;
        }
        resolve(result.insertId);
      });

      connection.end();
    });
  }

  list(o = {}) {
    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      let condition = { keys: [], values: [] };
      for (let key in o) {
        condition.keys.push(`\`${key}\` = ?`);
        condition.values.push(o[key]);
      }
      const conditionString = condition.keys.length ? condition.keys.join(' AND ') : '1=1';

      const sqlString = `SELECT * FROM ${this.tableName} WHERE  ${conditionString} ORDER BY id DESC`;
      const sqlParams = [...condition.values];

      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
      connection.end();
    });
  }
  update(o = {}) {
    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      let setter = { keys: [], values: [] };
      let condition = { keys: [], values: [] };
      for (let key in o) {
        if (key == 'id' || key == 'user') {
          condition.keys.push(`\`${key}\` = ?`);
          condition.values.push(o[key]);
        } else if (key == 'pwd') {
          let salt = this.randomSalt();
          setter.keys.push(`salt = ?`);
          setter.values.push(salt);
          let pwd = this.passwordMd5(o[key], salt);
          setter.keys.push(`pwd = ?`);
          setter.values.push(pwd);
        } else {
          setter.keys.push(`\`${key}\` = ?`);
          setter.values.push(o[key]);
        }
      }
      const sqlString = `
      UPDATE  ${this.tableName} 
      SET  ${setter.keys.join(',')} 
      WHERE ${condition.keys.join(',')}`;

      const sqlParams = [...setter.values, ...condition.values];
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows);
        }
      });
      connection.end();
    });
  }
  delete() {
    return new Promise((resolve, reject) => {
      reject('delete function is undefine');
    });
  }
}

module.exports = ClassName;
