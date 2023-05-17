class RES {
  success(data, message) {
    return {
      tip: 1,
      d: data,
      msg: message || 'default success',
    };
  }
  error(data, message) {
    let msg = 'default error';
    if (data.message) {
      msg = data.message;
    }
    if (message) {
      msg = message;
    }
    return {
      tip: 0,
      d: data,
      msg: msg,
    };
  }
}
module.exports = new RES();
