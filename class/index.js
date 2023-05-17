
// class 里不能再调用此文件，防止掉入循环
const User = require('../class/user');
const USER = new User();
const Article = require('../class/article');
const ARTICLE = new Article();
const Login = require('../class/login');
const LOGIN = new Login();
const Pic = require('../class/pic');
const PIC = new Pic();
const Comment = require('../class/comment');
const COMMENT = new Comment();
const Book = require('../class/book');
const BOOK = new Book();


module.exports = {
    USER,ARTICLE,LOGIN,PIC,COMMENT,BOOK
};