class HtmlSpecialChars {
  constructor() {
    this.myCodeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
  }
  // 编码
  encoded(text) {
    for (let key in this.myCodeMap) {
      let value = this.myCodeMap[key];
      text = text.replace(new RegExp(key,"gm"), value);
    }
    return text;
  }
  // 解码
  decode(text) {
    for (let key in this.myCodeMap) {
      let value = this.myCodeMap[key];
      text = text.replace(new RegExp(value,"gm"), key);
    }
    return text;
  }
}
module.exports = new HtmlSpecialChars();
