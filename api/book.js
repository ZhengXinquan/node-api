var express = require('express');
var router = express.Router();
/** 引用 */
var { TOKEN, RES } = require('../utils');
var { USER, ARTICLE, BOOK, PIC } = require('../class');

/**
 * 中间件
 * 检测登录状态，并获取当前用户信息 TOKEN_USER_INFO
 */
let TOKEN_USER_INFO = null;
router.use((req, res, next) => {
  if (req.path == '/login') {
    next();
    return;
  }
  if (!req.headers.authorization) {
    // console.log(req.headers);
    res.status(401).send(RES.error('Sorry, you are not login! (1)'));
    return;
  }
  USER.getUserByToken(req.headers.authorization)
    .then(user => {
      TOKEN_USER_INFO = user;
      next();
    })
    .catch(err => {
      res.status(401).send(RES.error('Sorry, you are not login! (2)'));
    });
});

/**
 * 类别
 */
router.get('/types', function (req, res) {
  BOOK.getTypes()
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});
/**
 * 详情
 */
router.get('/:id', function (req, res) {
  if (!req.params.id) {
    res.send(RES.error('err id'));
  }
  BOOK.getById(req.params.id)
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});
/**
 * 删除
 */
router.delete('/:id', function (req, res) {
  if (!req.params.id) {
    res.send(RES.error('err id'));
  }
  BOOK.delete(req.params.i)
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});
/**
 * 新增
 */
router.post('/add', function (req, res) {
  BOOK.setToken(TOKEN_USER_INFO);
  BOOK.add(req.body)
    .then(result => {
      res.send(RES.success('发布成功'));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});
/**
 * 更新
 */
router.post('/update', function (req, res) {
  BOOK.setToken(TOKEN_USER_INFO);
  BOOK.update(req.body)
    .then(result => {
      res.send(RES.success('更新成功'));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});
/**
 * 列表
 */
router.get('/list', function (req, res) {
  BOOK.list()
    .then(result => {
      result.forEach(row => {
        delete row.tx;
      });
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

module.exports = router;
