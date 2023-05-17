var express = require('express');
var router = express.Router();
/** 引用 */
var { TOKEN, RES } = require('../utils');
var Create = require('../class/create');
const CREATE = new Create();
var { ARTICLE } = require('../class');
/**
 * 中间件
 * 检测登录状态，并获取当前用户信息 TOKEN_USER_INFO
 */
let TOKEN_USER_INFO = null;
router.use((req, res, next) => {
  next();
});
/**
 * article
 */
 router.get('/article', function (req, res) {
  ARTICLE.create()
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});
router.get('/article/index', function (req, res) {
  CREATE.articleList()
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});
router.get('/photo/index', function (req, res) {
  CREATE.photoList()
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

router.get('/friend/index', function (req, res) {
  CREATE.linkList()
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

router.get('/book/index', function (req, res) {
  CREATE.bookList()
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});



 router.get('/article/:id', function (req, res) {
  ARTICLE.create(req.params.id)
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});
router.get('/index', function (req, res) {
  CREATE.pageIndex()
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});



router.get('/404', function (req, res) {
  CREATE.page404()
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

router.get('/map', function (req, res) {
  CREATE.siteMap()
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});





module.exports = router;
