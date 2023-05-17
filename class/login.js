var {utilsSql,moment} = require('../utils');
class Login {
  constructor(TOKEN_USER_INFO) {
    this.tableName = 'zz_login';
    this.defaultSalt = 'grxs';
    if (TOKEN_USER_INFO) {
      this.TOKEN_USER_INFO = TOKEN_USER_INFO;
    }
  }
  setToken(TOKEN_USER_INFO) {
    this.TOKEN_USER_INFO = TOKEN_USER_INFO;
  }
  add(o) {
    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();

      const sqlString = `INSERT INTO ${this.tableName} (user, ip, location,create_time) VALUES (?,?,?,?)`;
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

module.exports = Login;
