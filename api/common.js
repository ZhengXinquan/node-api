var express = require('express');
var router = express.Router();

var { TOKEN, RES, request, getLocalInfo, moment } = require('../utils');
var { USER, ARTICLE, COMMENT } = require('../class');

/**
 * 中间件
 * 检测登录状态，并获取当前用户信息 TOKEN_USER_INFO
 */
let TOKEN_USER_INFO = null;
router.use((req, res, next) => {
  USER.getUserByToken(req.headers.authorization||'')
    .then(user => {
      TOKEN_USER_INFO = user;
      // console.log('then', user);
    })
    .catch(err => {
      console.log('err', err);
    })
    .finally(e => {
      console.log('finally', e);
      next();
    });
});

/**
 * isImg
 */
router.get('/isImg', function (req, res) {
  const URL = req.query.t;
  request(
    {
      url: URL, //请求路径
      method: 'GET', //请求方式，默认为get
    },
    function (error, response, body) {
      if (error) {
        res.send(RES.error(error));
      } else {
        if (response.headers['content-type'].includes('image/')) {
          res.send(RES.success(response.headers['content-type']));
        } else {
          res.send(RES.error(response.headers['content-type']));
        }
      }
    },
  );
 
});
router.get('/get/comment/:id', function (req, res) {
  COMMENT.getByArticleId(req.params.id)
  .then(result => {
    if (result) {
      res.send(RES.success(result));
    } else {
      res.send(RES.error('失败'));
    }
  })
  .catch(err => {
    res.send(RES.error(err));
  });
});

router.post('/insertComment', function (req, res) {
  const article_id = req.body.article_id;
  const content = req.body.content;
  const under_id = req.body.under_id || 0;
  const create_name = TOKEN_USER_INFO ? TOKEN_USER_INFO.user : 'guest';
  const create_time = moment().format('YYYY-MM-DD HH:mm:ss');

  getLocalInfo(req, localInfo => {
    const DATA = {
      article_id,
      content,
      under_id,
      create_name,
      create_time,
      ip: localInfo.ip,
      location: localInfo.location,
    };

    COMMENT.add(DATA)
      .then(result => {
        if (result) {
          res.send(RES.success(result));
        } else {
          res.send(RES.error('失败'));
        }
      })
      .catch(err => {
        res.send(RES.error(err));
      });
  });
});

module.exports = router;
