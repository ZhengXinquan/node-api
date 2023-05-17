var request = require('request');
var get = function (req, callback) {
  const ip = req.ip;

  request(
    {
      url: 'https://ip.taobao.com/outGetIpInfo?ip=' + ip + '&accessKey=alibaba-inc', //请求路径
      method: 'POST', //请求方式，默认为get
      headers: {
        //设置请求头
        'content-type': 'application/json',
      },
      // body: JSON.stringify(requestData)//post参数字符串
    },
    function (error, response, body) {
      let city = 'Mars';
      if (body.code == 0) {
        if (body.data.country) {
          city = body.data.city;
        }
        if (body.data.city) {
          city = body.data.city;
        }
      }
      if (city == '内网IP') {
        city = 'Mars';
      }
      callback({
        ip,
        location: city,
      });
    },
  );
};

module.exports = get;
