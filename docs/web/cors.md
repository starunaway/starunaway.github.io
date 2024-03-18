# cors

## jsonp

利用浏览器的 `script` 标签，在请求数据的时候把回调函数名添加到 `query` 里面

```js
// 客户端代码
function jsonp() {
  var script = document.createElement('script');
  script.type = 'text/javascript';

  // 传参并指定回调执行函数为backFn
  script.src = 'http://localhost:8100/getUserInfo?uid=100&callback=backFn';
  document.head.appendChild(script);
}

// 回调执行函数
function backFn(res) {
  alert(JSON.stringify(res));
}

document.getElementById('btn_get_data').addEventListener('click', () => {
  jsonp();
});
```

```js
let uid = ctx.query.uid;
let callback = ctx.query.callback;
ctx.body = 'backFn({"code": 0, "user": "admin"})';
```

当浏览器加载完成服务端返回的数据后，会执行`backFn({"code": 0, "user": "admin"})`这段代码

## CORS

浏览器将 `CORS` 请求分成两类：简单请求（`simple request`）和非简单请求（预检请求）（`not-so-simple request`）

简单请求：

(1) 请求方法是以下三种方法之一: `HEAD` `GET` `POST`

(2)`HTTP` 请求头信息不超出以下几种字段：

`Accept`
`Accept-Language`
`Content-Language`
`Last-Event-ID`
`Content-Type`：只限于三个值 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`

不满足简单请求的就是复杂请求了

### 简单请求

对于简单请求，浏览器直接发出 `CORS` 请求。具体来说，就是在头信息之中，增加一个 `Origin` 字段

服务器会检查 `Origin`字段，如果允许，服务器返回的响应，会多出几个头信息字段：

```js
Access-Control-Allow-Origin: BROWSER-ORIGIN || * //必须
Access-Control-Allow-Credentials: true //可选, 是否允许发送Cookie.如果服务器不允许发送Cookie，删除即可
Access-Control-Expose-Headers: YOUR-HEADER-KEY //可选  CORS请求时，XMLHttpRequest对象的getResponseHeader()方法只能拿到6个基本字段：Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma。如果想拿到其他字段，就必须在Access-Control-Expose-Headers里面指定
Content-Type: text/html;
charset=utf-8
```

### withCredentials

如果要把 Cookie 发到服务器，一方面要服务器同意，指定 Access-Control-Allow-Credentials 字段。客户端也要打开 withCredentials:

```js
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;
```

如果要发送 Cookie，Access-Control-Allow-Origin 就不能设为星号，必须指定明确的、与请求网页一致的域名

如果服务端不允许跨域，则不返回 Access-Control-Allow-Origin 字段 ，客户端不会报错（status 可能是 200），但会被 XHR 的 onerror 捕获

## 注意

1. 服务端返回可能有多层代理，比如 nginx -> gateway -> 后端服务，只能设置一层 header，重复设置也会导致失败
2. cors 先发起 Option 请求，有些后端服务里并没有处理 Option, 导致失败
3. 一些后端服务会返回 201 等状态码，这种情况下浏览器不识别，也会报 cors 错误。 Option 必须要是 200 才行
