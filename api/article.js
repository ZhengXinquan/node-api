var express = require('express');
var router = express.Router();
/** 引用 */
var { TOKEN, RES } = require('../utils');
var { USER, ARTICLE, PIC } = require('../class');

/**
 * 中间件
 * 检测登录状态，并获取当前用户信息 TOKEN_USER_INFO
 */
let TOKEN_USER_INFO = null;
router.use((req, res, next) => {
  if (
    req.path == '/login' ||
    req.path === '/search' ||
    req.path.indexOf('/try/public/content/') == 0
  ) {
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
 * test
 */
router.get('/test', function (req, res) {
  ARTICLE.getById(104)
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 插图
 * n : file name
 * u : base64 string
 */
router.post('/pic/add', function (req, res) {
  // 保存图片
  PIC.addBase64(req.body.u)
    .then(result => {
      // console.log(' PIC.addBase64 then=> FILE_NAME', result);
      const o = {
        url: result.url,
        alt: req.body.n,
      };
      // 写入数据库
      PIC.setToken(TOKEN_USER_INFO);
      PIC.add(o)
        .then(result => {
          // console.log(' PIC.add then=> result', result);
          res.send(RES.success({ url: o.url, alt: o.alt }));
        })
        .catch(err => {
          res.send(RES.error(err));
        });
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});
/**
 * 类别
 */
router.get('/types', function (req, res) {
  ARTICLE.getTypes()
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});
/**
 * 设置公开
 */
router.put('/public/:id/:type', function (req, res) {
  const id = req.params.id;
  const type = req.params.type;
  ARTICLE.update({
    id: id,
    public: type,
  })
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
  ARTICLE.getById(req.params.id)
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
  ARTICLE.delete(req.params.i)
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
  ARTICLE.setToken(TOKEN_USER_INFO);
  ARTICLE.add(req.body)
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
  ARTICLE.setToken(TOKEN_USER_INFO);
  ARTICLE.update(req.body)
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
  ARTICLE.list()
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 列表
 */
router.post('/search', function (req, res) {
  ARTICLE.search(req.body.word)
    .then(result => {
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 判断 登录与隐私 获取文章内容
 */
router.get('/try/public/content/:id', function (req, res) {
  if (!req.params.id) {
    res.send(RES.error('err id'));
  }

  USER.getUserByToken(req.headers.authorization)
    .then(user => {
      TOKEN_USER_INFO = user;

      ARTICLE.isPublic(req.params.id, TOKEN_USER_INFO.user)
        .then(result => {
          res.send(RES.success(result));
        })
        .catch(err => {
          res.send(RES.error(err));
        });
    })
    .catch(err => {
      res.send(RES.error('err  not login'));
    });
});

module.exports = router;
