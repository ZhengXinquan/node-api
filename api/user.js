var express = require('express');
var router = express.Router();
/** 引用 */
var { moment, moment, TOKEN, RES, getLocalInfo } = require('../utils');
var { USER, ARTICLE, LOGIN, PIC, COMMENT, BOOK } = require('../class');

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
    res.status(401).send(RES.error('Sorry, you are not login! (1)'));
    return;
  }
  USER.getUserByToken(req.headers.authorization)
    .then(user => {
      TOKEN_USER_INFO = {
        ...user,
        create_time: moment(user.create_time).format('YYYY-MM-DD HH:mm:ss'),
      };
      next();
    })
    .catch(err => {
      res.status(401).send(RES.error('Sorry, you are not login! (2)'));
    });
});

/**
 * 登出
 */
router.get('/logout', function (req, res) {
  USER.update({ token: '0', id: TOKEN_USER_INFO.id })
    .then(result => {
      res.send(RES.success('Logout Success !'));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 列表
 */
router.get('/list', function (req, res) {
  USER.list()
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

/**
 * 个人信息
 */
router.get('/info', function (req, res) {
  res.send(RES.success(TOKEN_USER_INFO));
});

/**
 *  登陆
 *  user
 *  pwd
 */
router.post('/login', function (req, res) {
  USER.login(req.body.user, req.body.pwd)
    .then(user => {
      // 登录日志
      getLocalInfo(req, localInfo => {
        LOGIN.add({
          user: user.user,
          ip: localInfo.ip,
          location: localInfo.location,
        });
      });

      res.send(RES.success(user));
      return;
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/** 修改密码
 *  user
 *  pwdOld
 *  pwd
 */
router.post('/update/password', function (req, res) {
  if (req.body.user != TOKEN_USER_INFO.user) {
    res.send(RES.error('err user'));
    return;
  }
  if (USER.passwordMd5(req.body.pwdOld, TOKEN_USER_INFO.salt) != TOKEN_USER_INFO.pwd) {
    res.send(RES.error('err pwd'));
    return;
  }
  USER.update({
    user: req.body.user,
    pwd: req.body.pwd,
  })
    .then(result => {
      res.send(RES.success(result));
      return;
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 修改一项
 */
router.post('/edit', function (req, res) {
  const KEY = req.body.what;
  const VALUE = req.body.value;
  const DATA = { id: TOKEN_USER_INFO.id };
  DATA[KEY] = VALUE;
  USER.update(DATA)
    .then(result => {
      if (result) {
        USER.getById(TOKEN_USER_INFO.id).then(result => {
          TOKEN_USER_INFO = result;
          res.send(RES.success(result));
        });
      } else {
        res.send(RES.error('修改未生效'));
      }
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 校验密码
 */
router.post('/check/password', function (req, res) {
  const PWD = req.body.pwd;
  if (TOKEN_USER_INFO.pwd === USER.passwordMd5(PWD, TOKEN_USER_INFO.salt)) {
    res.send(RES.success(true));
    return;
  } else {
    res.send(RES.error(false));
    return;
  }
});

/**
 * 获取登录用户的文章
 */

router.post('/article', function (req, res) {
  let Params = null;
  if (TOKEN_USER_INFO.user !== 'gr') {
    Params = { create_name: TOKEN_USER_INFO.user };
  }
  ARTICLE.list(Params)
    .then(result => {
      result = result.map(e => {
        return {
          self: e.create_name == TOKEN_USER_INFO.user || TOKEN_USER_INFO.user == 'gr',
          create_name: e.create_name,
          create_time: moment(e.create_time).format('YYYY-MM-DD HH:mm:ss'),
          id: e.id,
          type: e.type,
          public: e.public,
          title: e.title,
        };
      });
      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 登录记录
 */
router.get('/login/records', function (req, res) {
  LOGIN.list({ user: TOKEN_USER_INFO.user })
    .then(result => {
      result = result.map(e => {
        return {
          create_time: moment(e.create_time).format('YYYY-MM-DD HH:mm:ss'),
          ip: e.ip,
          location: e.location,
        };
      });

      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 评论记录
 */
router.get('/comment', function (req, res) {
  COMMENT.getUserComments(TOKEN_USER_INFO.user)
    .then(result => {
      result = result.map(e => {
        return {
          ...e,
          create_time: moment(e.create_time).format('YYYY-MM-DD HH:mm:ss'),
        };
      });

      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 我的书架上传记录
 */
router.get('/book', function (req, res) {
  BOOK.list({ create_name: TOKEN_USER_INFO.user })
    .then(result => {
      result = result.map(e => {
        return {
          id: e.id,
          name: e.name,
          author: e.author,
          type: e.type,
          create_time: moment(e.create_time).format('YYYY-MM-DD HH:mm:ss'),
        };
      });

      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 我的相册
 */
router.get('/photo', function (req, res) {
  PIC.list({ create_name: TOKEN_USER_INFO.user, from: 'photo' })
    .then(result => {
      result = result.map(e => {
        return {
          id: e.id,
          url: e.url,
          alt: e.alt,
          group: e.group,
          create_time: moment(e.create_time).format('YYYY-MM-DD HH:mm:ss'),
        };
      });

      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 我的消息——别人评论我的文章
 */
router.get('/news', function (req, res) {
  COMMENT.getUserNews(TOKEN_USER_INFO.user)
    .then(result => {
      result = result.map(e => {
        return {
          ...e,
          create_time: moment(e.create_time).format('YYYY-MM-DD HH:mm:ss'),
        };
      });

      res.send(RES.success(result));
    })
    .catch(err => {
      res.send(RES.error(err));
    });
});

/**
 * 删除
 */
router.delete('/:table/:id', function (req, res) {
  const table = req.params.table;
  const id = req.params.id;

  let temp_promise = null;
  switch (table) {
    case 'article':
      temp_promise = ARTICLE.delete(id);
      break;
    case 'comment':
      temp_promise = COMMENT.delete(id);
      break;
    case 'user':
      temp_promise = USER.delete(id);
      break;
    case 'book':
      temp_promise = BOOK.delete(id);
      break;
    case 'photo':
      temp_promise = PIC.delete(id);
      break;
    default:
  }
  if (temp_promise) {
    temp_promise
      .then(result => {
        res.send(RES.success(result));
      })
      .catch(err => {
        res.send(RES.error(err));
      });
  } else {
    res.send(RES.error(table + '  is Error'));
  }
});

module.exports = router;
