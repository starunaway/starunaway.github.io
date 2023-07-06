import axios from 'axios';

export const request = createAxiosInstance();

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
