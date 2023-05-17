var {utilsSql,moment,fs,config} = require('../utils');
const Pic = require('../class/pic');
const PIC = new Pic();
class ClassName {
  constructor(TOKEN_USER_INFO) {
    this.tableName = 'zz_book';
    this.defaultSalt = 'grxs';
    if (TOKEN_USER_INFO) {
      this.TOKEN_USER_INFO = TOKEN_USER_INFO;
    }
  }
  setToken(TOKEN_USER_INFO) {
    this.TOKEN_USER_INFO = TOKEN_USER_INFO;
  }
  getTypes() {
    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();

      const sqlString = ` SELECT DISTINCT  type From  ${this.tableName}`;
      const sqlParams = [];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
          return;
        }

        resolve(result.map(e => e.type));
      });
      connection.end();
    });
  }

  add(o) {
    const THIS_CLASS = this;
    return new Promise(async (resolve, reject) => {
      let URL_TEMP = o.url;
      // 保存Base6图片
      try {
      const  uploadPic = await PIC.addBase64(o.url);
        URL_TEMP = uploadPic.url;
      } catch (error) {
        console.log(error);
      }

      // book insert
      const connection = utilsSql();
      connection.connect();
      const sqlString = `INSERT INTO ${this.tableName} (\`url\`, \`name\`, \`type\`, \`introduction\`, \`author\`, \`create_name\`,\`create_time\`) VALUES (?,?,?,?,?,?,?)`;
      const sqlParams = [
        URL_TEMP,
        o.name,
        o.type,
        o.introduction,
        o.author,
        THIS_CLASS.TOKEN_USER_INFO.user,
        moment().format('YYYY-MM-DD HH:mm:ss'),
      ];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          console.log('[INSERT ERROR] - ', err.message);
          reject('INSERT ERROR');
          return;
        }

        console.log('--------------------------INSERT----------------------------');
        //console.log('INSERT ID:',result.insertId);
        console.log('INSERT ID:', result);
        console.log('-----------------------------------------------------------------\n\n');

        const oo = {
          url: URL_TEMP,
          alt: o.name,
          from: 'book',
          group: result.insertId,
          create_name: THIS_CLASS.TOKEN_USER_INFO.user,
        };
        // 写入数据库
        PIC.add(oo).then(result => {
          // console.log('Article update => PIC.addBase64 => add result');
          // console.log(result);
        });

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

  getById(id) {
    return new Promise((resolve, reject) => {
      this.list({ id: id })
        .then(result => {
          if (Array.isArray(result) && result.length == 1) {
            resolve(result[0]);
          } else {
            reject(result);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  update(o = {}) {
    return new Promise(async (resolve, reject) => {
      const connection = utilsSql();
      let setter = { keys: [], values: [] };
      let condition = { keys: [], values: [] };
      for (let key in o) {
        if (key == 'id' || key == 'user') {
          condition.keys.push(`\`${key}\` = ?`);
          condition.values.push(o[key]);
        } else if (key == 'url') {
          // 保存Base6图片
          let URL_TEMP = o[key];
          try {
           const uploadPic = await PIC.addBase64(o.url);
            URL_TEMP = uploadPic.url;
          } catch (error) {
            console.log(error);
          }
          setter.keys.push(`\`${key}\` = ?`);
          setter.values.push(URL_TEMP);
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
  delete(id) {
    return new Promise((resolve, reject) => {
      // 随机定义备份文件名
      const PATH =
        config.NSQ_BACKUP_DIR +
        '/delete_' +
        this.tableName +
        '_' +
        moment().format('YYYY-MM-DD_HHmmss') +
        '.txt';
      //获取备份信息
      this.getById(id)
        .then(result => {
          const TXT = JSON.stringify(result);

          //备份
          fs.writeFile(PATH, TXT, err => {
            if (err) {
              reject(err);
            } else {
              //删除 id
              const connection = utilsSql();
              connection.connect();
              const sqlString = ` DELETE FROM  ${this.tableName} WHERE id = ?`;
              const sqlParams = [id];
              //查
              connection.query(sqlString, sqlParams, function (err, result) {
                if (err) {
                  reject(err);
                  return;
                }
                resolve(result);
              });
              connection.end();
            }
            resolve(PATH);
          });
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}

module.exports = ClassName;
