const {utilsSql,moment,fs,crypto,config,path} = require('../utils');


class ClassName {
  constructor(TOKEN_USER_INFO) {
    this.BASE64_MARK = ';base64,';
    this.tableName = 'zz_pic';
    this.defaultAlt = '关尔先生';
    this.defaultFrom = 'article';
    this.group = '0';
    if (TOKEN_USER_INFO) {
      this.TOKEN_USER_INFO = TOKEN_USER_INFO;
    }
  }
  setToken(TOKEN_USER_INFO) {
    this.TOKEN_USER_INFO = TOKEN_USER_INFO;
  }
  isExistsUrl(url) {
    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();

      const sqlString = `SELECT * FROM  ${this.tableName} WHERE url =? `;
      const sqlParams = [url];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
        } else {
          if (result.length > 0) {
            resolve(result[0]);
          } else {
            resolve(false);
          }
        }
      });
      connection.end();
    });
  }


  getTypes(o) {
    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();

      let condition = { keys: [], values: [] };
      for (let key in o) {
          condition.keys.push(`\`${key}\` = ?`);
          condition.values.push(o[key]);
      }

      let conditionString = ' 1=1 '
      if(condition.keys.length){
        conditionString = condition.keys.join(' AND ');
      }
      const sqlString = ` SELECT DISTINCT  \`group\` From  ${this.tableName} WHERE ${conditionString}`;
      const sqlParams = [...condition.values];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
          return;
        }
        resolve(result.map(e => e.group));
      });
      connection.end();
    });
  }

  add(o) {
    return new Promise(async (resolve, reject) => {
      const connection = utilsSql();
      connection.connect();

      // try {
        const FLAG = await this.isExistsUrl(o.url);
        console.log('await this.isExistsUrl(e.url) : FLAG', FLAG);
        if (FLAG) {
          resolve(FLAG.id);
          return;
        }
      // } catch (error) {
      //   console.log('await this.isExistsUrl(e.url) ERROR', error);
      // }
      //   url
      o['alt'] = o.alt || this.defaultAlt;
      o['from'] = o.from || this.defaultFrom;
      o['group'] = o.group || this.group;
      o['create_name'] = o.create_name || this.TOKEN_USER_INFO.user;
      o['create_time'] = moment().format('YYYY-MM-DD HH:mm:ss');
      const sqlString = `INSERT INTO ${this.tableName} (\`url\`, \`alt\`, \`from\`, \`group\`, \`create_name\`, \`create_time\`) VALUES (?,?,?,?,?,?)`;
      const sqlParams = [o.url, o.alt, o.from, o.group, o.create_name, o.create_time];
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
      console.log(sqlString);
      console.log(sqlParams);
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

                   //删除 id ,未删除文件
                   const connection = utilsSql();
                   connection.connect();
                   const sqlString = ` DELETE FROM  ${this.tableName} WHERE id = ?`;
                   const sqlParams = [id];
                   connection.query(sqlString, sqlParams, function (err, result) {
                     if (err) {
                       reject(err);
                       return;
                     }
                     resolve(result);
                   });
                   connection.end();
    });
  }
  /**
   *
   * @param {*} base64url //  data:image/jpeg;base64,/9j/4AAQ
   */
  addBase64(base64url) {
    return new Promise((resolve, reject) => {
      const baseIndex = base64url.indexOf(this.BASE64_MARK);
      if (baseIndex > 12 && baseIndex < 18) {
        let [basePicType, basePicData] = base64url.split(this.BASE64_MARK);
        basePicType = basePicType.replace('data:image/', '');
        let dataBuffer = new Buffer.from(basePicData, 'base64');

        const FILE_NAME =
          moment().format('YYYYMMDD') +
          crypto.createHash('md5').update(dataBuffer).digest('hex') +
          '.' +
          basePicType;


        const FULL_PATH = path.join(config.NSQ_UPLOAD_IMG_DIR , FILE_NAME);

        // console.log(FULL_PATH);

        fs.writeFile(FULL_PATH, dataBuffer, err => {
          if (err) {
            reject(err);
          } else {
            const WEB_URL = config.NSQ_IMG_WEB_URL + FILE_NAME;
            resolve({ name: FILE_NAME, path: FULL_PATH, url: WEB_URL });
          }
        });
      } else {
        reject('It is not base64 image');
      }
    });
  }
}

module.exports = ClassName;
