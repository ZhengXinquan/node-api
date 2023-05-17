var { utilsSql, moment, fs, config } = require('../utils');

class ClassName {
  constructor(TOKEN_USER_INFO) {
    this.tableName = 'zz_comment';
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

      // if(!o.hasOwnProperty(under_id))o['under_id'] = 0;
      // if(!this.TOKEN_USER_INFO){
      //   o['create_name'] = 'guest'
      // }else{
      //   o['create_name'] = this.TOKEN_USER_INFO.user;
      // }
      // o['create_time']=moment().format('YYYY-MM-DD HH:mm:ss');

      const sqlString = `INSERT INTO ${this.tableName} (article_id, under_id, content,create_name,create_time,ip,location) VALUES (?,?,?,?,?,?,?)`;
      const sqlParams = [
        o.article_id,
        o.under_id,
        o.content,
        o.create_name,
        o.create_time,
        o.ip,
        o.location,
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
        resolve(result.insertId);
      });

      connection.end();
    });
  }
  getByArticleId(article_id) {
    //     const User = require('../class/user');
    // const USER = new User();

    // USER.getUserByLoginName()
    return new Promise((resolve, reject) => {
      if (!article_id) reject();

      const connection = utilsSql();
      const sqlString = `SELECT ${this.tableName}.*,zz_user.name,zz_user.tx FROM ${this.tableName} LEFT JOIN zz_user ON (zz_user.user = ${this.tableName}.create_name ) WHERE article_id=?  order by create_time`;
      const sqlParams = [article_id, 0];
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
        } else {
          if (Array.isArray(result)) {
            const all = result
              .filter(e => e.under_id == 0)
              .map(row => {
                const UNDER_LIST = result
                  .filter(e => e.under_id == row.id)
                  .map(e => {
                    return {
                      id: e.id,
                      location: e.location,
                      tx: e.tx,
                      content: e.content,
                      name: e.name,
                      time: moment(e.create_time).format('YYYY-MM-DD HH:mm:ss'),
                    };
                  });
                return {
                  id: row.id,
                  location: row.location,
                  tx: row.tx,
                  content: row.content,
                  name: row.name,
                  time: moment(row.create_time).format('YYYY-MM-DD HH:mm:ss'),
                  under: UNDER_LIST,
                };
              });
            resolve(all);
          } else {
            resolve([]);
          }
        }
      });
      connection.end();
    });
  }
  getUserComments(user) {
    return new Promise((resolve, reject) => {
      const connection = utilsSql();

      const sqlString = `SELECT zz_comment.*,zz_article.title FROM ${this.tableName} join  zz_article on (zz_article.id=zz_comment.article_id and zz_comment.create_name=? )  ORDER BY id DESC`;
      const sqlParams = [user || this.TOKEN_USER_INFO.user];

      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
        } else {
          result = result.map(e => {
            return {
              id: e.id,
              article_id: e.article_id,
              title: e.title,
              content: e.content,
              create_time: e.create_time,
            };
          });
          resolve(result);
        }
      });
      connection.end();
    });
  }
  getUserNews(user) {
    return new Promise((resolve, reject) => {
      user = user || this.TOKEN_USER_INFO.user;
      const connection = utilsSql();
      const sqlString = `SELECT haha.*,uu.name FROM 
      (SELECT a.id as article_id,
             a.title as title,
             bb.content as content,
             bb.create_time as create_time,
             bb.id as id,
             bb.create_name as create_name
        FROM zz_article AS a, zz_comment AS bb
       WHERE(a.id= bb.article_id
         and a.create_name= ?)
       UNION
      SELECT a.article_id as article_id,
             a.content as content,
             b.content as content,
             b.create_time as create_time,
             b.id as id,
             b.create_name as create_name
        FROM zz_comment AS a,
             zz_comment AS b
       WHERE(a.id= b.under_id
         and a.create_name= ?)
       order by create_time desc) as haha JOIN zz_user as uu on haha.create_name = uu.user`;
      const sqlParams = [user, user];

      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
        } else {
          result = result.map(e => {
            return {
              article_id: e.article_id,
              from: e.title,
              who: e.name,
              content: e.content,
              create_time: e.create_time,
            };
          });
          resolve(result);
        }
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
      // console.log(sqlString);
      // console.log(sqlParams);
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
