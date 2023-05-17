var express = require('express');
var router = express.Router();
/** 引用 */
var { TOKEN, RES } = require('../utils');
var { USER, PIC } = require('../class');

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
  PIC.getTypes({ from: 'photo' })
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
  PIC.delete(req.params.i)
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
  const alt = req.body.alt;
  const group = req.body.group;
  const URL_LIST = req.body.url;

  const PROMISE_LIST = [];
  URL_LIST.forEach(async url => {
    let URL_TEMP = url;
    // 保存Base6图片
    try {
      const uploadPic = await PIC.addBase64(url);
      URL_TEMP = uploadPic.url;
    } catch (error) {
      console.log(error);
    }

    const oo = {
      url: URL_TEMP,
      alt: alt,
      from: 'photo',
      group: group,
      create_name: TOKEN_USER_INFO.user,
    };
    // 写入数据库
    PROMISE_LIST.push(PIC.add(oo));
  });

  // 保存图片
  Promise.all(PROMISE_LIST).then(result => {
    console.log(' 保存图片 Promise.all(PROMISE_LIST)',result)
    res.send(RES.success('upload success'));
  }).catch(err => {
    res.send(RES.error(err));
  });
});
/**
 * 更新
 */
router.post('/update', function (req, res) {
  PIC.setToken(TOKEN_USER_INFO);
  PIC.update(req.body)
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
  PIC.list()
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
