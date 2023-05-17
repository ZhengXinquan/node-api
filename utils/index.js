const moment = require('moment');
const fs = require('fs');
const crypto = require('crypto');
const request = require('request');
const config = require('config-lite')(__dirname);
const path = require('path');
const images = require('images');
//  utils
const utilsSql = require('./sql.js');
const TOKEN = require('./token');
const HtmlSpecialChars = require('./HtmlSpecialChars');
const RES = require('./res');
const getLocalInfo = require('./localInfo.js');
const cryptId = require('./cryptId.js');


tryCreate('NSQ_UPLOAD_IMG_DIR');
tryCreate('NSQ_BACKUP_DIR');
tryCreate('NSQ_ARTICLE_DEFAULT_DIR');
tryCreate('NSQ_BOOK_DEFAULT_DIR');
tryCreate('NSQ_PHOTO_DEFAULT_DIR');
tryCreate('NSQ_FRIEND_DEFAULT_DIR');



function tryCreate(DIR) {
  const dir = config[DIR];
  if (!fs.existsSync(dir)) {
    let NEW_FULL_DIR = fs.mkdirSync(dir, { recursive: true });
    if (!NEW_FULL_DIR) {
      console.log(`目录${dir}不存在,并创建失败`);
    } else {
      console.log('NEW_FULL_DIR', NEW_FULL_DIR);
    }
  } else {
    console.log(`目录${dir}存在`);
  }
}

module.exports = {
  moment,
  fs,
  images,
  crypto,
  request,
  config,
  path,
  utilsSql,
  TOKEN,
  HtmlSpecialChars,
  RES,
  getLocalInfo,
};
