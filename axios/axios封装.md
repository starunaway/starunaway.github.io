# axios 封装

## axios 请求时的配置优先级

请求时的配置 > 自定义实例的配置 > axios 默认配置

请求时的配置

```js
// 优先级最高
axios.get({
  baseURL: '',
  timeout: 5000,
});
```

自定义实例的配置

```js
// 优先级次之
const instance = axios.create({
  baseURL: '',
  timeout: 3000,
});
```

axios [默认配置](https://axios-http.com/docs/req_config)

```js
// 优先级最低
{

  // `baseURL` will be prepended to `url` unless `url` is absolute.
  // It can be convenient to set `baseURL` for an instance of axios to pass relative URLs
  // to methods of that instance.
  baseURL: 'https://some-domain.com/api',

  // `transformRequest` allows changes to the request data before it is sent to the server
  // This is only applicable for request methods 'PUT', 'POST', 'PATCH' and 'DELETE'
  // The last function in the array must return a string or an instance of Buffer, ArrayBuffer,
  // FormData or Stream
  // You may modify the headers object.
  transformRequest: [function (data, headers) {
    // Do whatever you want to transform the data

    return data;
  }],

}

```

## 实例配置

```js
import axios from 'axios';

export const instance = createAxiosInstance();

function createAxiosInstance(options = {}) {
  const instance = axios.create({
    // 可以在webpack进行配置，运行在浏览器，注入为全局变量
    baseURL: process.env.REACT_APP_BASE_URL,
    timeout: options.timeout || 5000,
    headers: {
      // 可定义统一的请求头部
      'Content-Type': 'application/json',
    },
  });

  // 添加请求拦截器(在发送请求之前做些什么)
  instance.interceptors.request.use((config) => {
    //可以显示loading
    // 比如依赖全局的vuex / redux ，可以将对应的action丢进来
    // 或者其他的全局loading函数
    options.loading.open();
    //token 存在就添加到请求头里
    // token 可以从 cookie 或 localStorage 读取
    token && (config.headers.Authorization = token);
    // 过滤请求参数中的 null undefined ''的函数
    // todo：需要实现
    cleanObject();
    return config;
  });

  // 添加响应拦截器(对响应数据做点什么)
  instance.interceptors.response.use(
    (response) => {
      //可添加关闭loading效果的函数
      options.loading.close();
      //解构出返回结果的数据
      const res = response.data;
      //对自定义code码进行判断,将成功的数据返回出去
      const validateStatus = /^(2|3)\d{2}$/; //code为2或3开头的视作请求成功
      if (validateStatus.test(res.code)) {
        return res.data;
      }
      //判断失败的code码并作出提示等操作
      if (res.code === 401) {
        message.error(res.msg);
      } else {
        message.warning(res.msg);
      }
      return Promise.reject(res);
    },
    (error) => {
      options.loading.close(); //可添加关闭loading效果的函数
      if (error.response.status === 401) {
        message.error('token失效，请重新登录！');
        // TODO: 移除cookie或localStorage 的token
        removeStorageToken();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        if (!window.navigator.onLine) {
          message.warning('网络异常，请检查网络是否正常连接');
        } else if (error.code === 'ECONNABORTED') {
          message.warning('请求超时');
        } else {
          message.warning('服务器异常，请联系管理员');
        }
      }
      return Promise.reject(error); // 将错误继续返回给到具体页面
    }
  );

  return instance;
}
```

## 可以约定的目录

```
   |-src
     ├─apis
	    ├─ request.js // axios的封装代码
		├─ index.js
		├─ user
		|   └─ index.js
		└─ database
		    └─ index.js
```

在 user/index.js 里

```javascript
import request from './request.js'; // 封装好的axios实例

export function getUserInfo(user) {
  return request.get(`/api/userinfo?id=${user.id}`);
}
```

在 apis/index.js 里

```javascript
import * as userApis from './user';
import * as database from './user';

export default {
  ...userApis, // 需要手动保障不能重名
  ...database,
};
```
