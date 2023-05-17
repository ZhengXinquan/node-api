const mysql = require('mysql');
const config=require('config-lite')(__dirname)
console.log(__dirname)
const connection = function () {
  return mysql.createConnection({
    host: config.HOST,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DATABASE,
    charset: 'utf8mb4'//编码
  });
};
module.exports = connection;
