## getUserInfo

 info字段的值

* toLogin   /api/user/login
* info      /api/user/info
* setUser   /api/user/edit
* checkPWD  /api/user/check/password

* article   /api/user/check/password



## POST 请求
* 'Content-Type': 'application/json'
*  body: JSON.stringify(data)


```js
function decodeEntities(encodedString) {
  var textArea = document.createElement('textarea');
  textArea.innerHTML = encodedString;
  return textArea.value;
}
```