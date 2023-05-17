var express = require('express');
var app = express();

// 解决跨域问题
// var cors = require('cors');
// app.use(cors());
// app.all('/*', function (req, res, next) {
//   // 跨域处理
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type,Access-Token');
//   res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
//   res.header('X-Powered-By', ' 3.2.1');
//   res.header('Content-Type', 'application/json;charset=utf-8');
//   next(); // 执行下一个路由
// });

app.use(express.json({ limit: 1024 * 1024 * 50 }));
app.use(
  express.urlencoded({
    limit: 1024 * 1024 * 50,
    extended: true,
    parameterLimit: 1024 * 1024 * 50,
  }),
);

/**
 * 接口转发
 */
const PROXY_FLAG = '/proxy';
// 转发到 http://api.xxx.com
const httpProxy = require('express-http-proxy');
const userServiceProxy = httpProxy('http://api.xxx.com', {
  proxyReqPathResolver: function (req) {
    return req.url.replace(PROXY_FLAG, ''); //   请求路径解析，去掉标识串 /proxy
  },
});
app.all(PROXY_FLAG + '/*', (req, res, next) => {
  userServiceProxy(req, res, next);
});

app.get('/test.html', function (req, res) {
  res.sendFile(__dirname + '/' + 'test.html');
});

/**
 * common 接口
 */
var commonApi = require('./api/common');
app.use('/api/common', commonApi);

/**
 * User 接口
 */
var userApi = require('./api/user');
app.use('/api/user', userApi);

/**
 * Article 接口
 */
var articleApi = require('./api/article');
app.use('/api/article', articleApi);
/**
 * Book 接口
 */
var bookApi = require('./api/book');
app.use('/api/book', bookApi);

/**
 * Pic 接口
 */
var picApi = require('./api/pic');
app.use('/api/pic', picApi);
app.use('/test-api/pic', picApi);

/**
 * nsq前端根目录 /public
 */
app.use('/', express.static('nsq'));

/**
 * 登录页面前端根目录 /login
 */
app.use('/login', express.static('login'));

/**
 * create 接口
 */
var createApi = require('./api/create');
app.use('/api/create', createApi);

app.get(/['/img','/img.pnp']/, function (req, res) {
  const { fs, path, images, config } = require('./utils/index');
  const QUERY_STRING = req._parsedUrl.query || '';
  const QUERY_ARRAY = QUERY_STRING.split('&');
  let filename = QUERY_ARRAY[0];
  let type = path.extname(filename).toLocaleLowerCase();
  let root_path = path.join(config.NSQ_DIR, filename);
  if (!fs.existsSync(root_path) || !fs.statSync(root_path).isFile()) {
    root_path = path.join(config.NSQ_UPLOAD_IMG_DIR, filename);
  }
  if (!fs.existsSync(root_path) || !fs.statSync(root_path).isFile()) {
    // data:image/jpg;base64,
    const base64Img = `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`;
    let buffer = Buffer.from(base64Img, 'base64');
    res.end(buffer);
    return;
  } else {
    const file_orig = images(root_path);
    const width_orig = file_orig.width();
    const height_orig = file_orig.height();
    const width = QUERY_ARRAY[1] ? QUERY_ARRAY[1] : width_orig;
    const height = QUERY_ARRAY[2] ? QUERY_ARRAY[2] : height_orig;
    let buffer = file_orig
      .size(Number(width), Number(height))
      .encode(type || 'jpg', { operation: 100 });
    res.end(buffer);
  }
});

/**
 * 404
 */
app.get('*', function (req, res) {
  res.status(404).send('404');
});

/**
 * 启动
 */
var server = app.listen(9587, '0.0.0.0', function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('应用实例，访问地址为 http://%s:%s', host, port);
});
