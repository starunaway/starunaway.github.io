# Promise

基于 [Promise/A+](https://promisesaplus.com/#point-46) 规范实现一个 Promise.

## 术语

规范里有一些术语,这里简单描述一下:

> - `promise` 拥有`then`方法的对象或函数,该对象或函数的行为符合`Promise/A+`规范.
> - `thenable` 是一个定义了 `then`方法的对象或函数,
> - `value` 是一个合法的 `JavaScript` 值(可以是`undefined`,`thenable` 的对象/函数,或者`promise`)
> - `exception` 是当异常时 Promise 抛出来的值.
> - `reason`是 Promise 改变为 reject 状态的原因.

## Promise 状态

`Promise` 的[状态](https://promisesaplus.com/#promise-states)有 3 种: `pending`, `fulfilled`和 `rejected`. `Promise` 的初始状态为`pending`, 且只能由 `pending`改变为`fulfilled`, 或由 `pending`改变为`rejected`. 状态一旦改变,无法再次更改

## [then](https://promisesaplus.com/#the-then-method)

Promise 必须提供一个 then 方法来访问塔当前/最终的值或者 reject 的原因. then 方法接收两个参数

```js
promise.then(onFulfilled, onRejected);
```

then 方法的两个参数均是可选的, 如果 onFulfilled/onRejected 不是函数, 则忽略并将当前 promise 的 value 直接返回(resolve 可以被下一个 then 接收, reject 被下一个 catch 拿到)

```js
Promise.reject('1').then().then(console.log, console.error);
// console.error('1')
```

### 如果 onFulfilled 是函数

1. 必须且只能在 promise 执行结束(resolve)之后被调用
2. 参数为 promise 状态改变之后的 value 值(resolve 的 value)
3. 调用次数不能超过 1 次

### 如果 onRejected 是函数

1. 必须且只能在 promise 拒绝执行(reject)之后被调用
2. 参数为 promise 状态改变之后的 reason 值(reject 的 reason)
3. 调用次数不能超过 1 次

then 方法多次注册并被调用, 则当 promise 的状态改变为 fulfilled 时, 所有的 onFulfilled 函数按注册顺序依次执行;当 promise 的状态改变为 rejected 时, 所有的 onRejected 函数按注册顺序依次执行

### then 的返回值

then 方法返回一个新的 promise, 新 promise 的状态依据 promise1.then 的 onFulfilled/onRejected 的返回值来确定,具体的规范可以看[这里](https://promisesaplus.com/#the-promise-resolution-procedure), 在后文实现 then 方法的时候再详细解释

```js
promise2 = promise1.then(onFulfilled, onRejected);
```

## 开始实现一个 promise

### 先搭个架子

创建 promise 的常用方法是`new Promise((resolve,rejcet)=>{ /*...*/})`, 这里使用 es6 的 class 语法来实现,使用的时候可以通过 `new MyPromise((resolve,rejcet)=>{})`来创建我们自己的符合 Promise/A+规范的实例

首先定义 Promise 的状态

```JS
const Pending = Symbol('Pending');
const Fulfilled = Symbol('Fulfilled');
const Rejected = Symbol('Rejected');

```

搭建起 MyPromise 的基本壳子:

```JS

class MyPromise {
  constructor(executor) {
      // 初始状态为Pending
    this.status = Pending;
	executor(this.resolve,this.reject);
  }

  resolve = (value) =>{}
  reject = (reason) =>{}

}

```

### resolve/reject

这里可以直接使用箭头函数定义 resolve/reject, 将 this 指向绑定到 MyPromise 的实例上即可. resolve/reject 的作用是接收一个参数作为 value/reason 作为 promise 的值, 并修改 promise 的状态, 切记 promise 的状态只能修改一次

```JS

class MyPromise {
  constructor(executor) {
      // 初始状态为Pending
    this.status = Pending;
	// promise的初始值
	this.result = null
	executor(this.resolve,this.reject);
  }

  resolve = (value) =>{
    if (this.status === Pending) {
      // 状态在 resolve 的时候才改变
      this.status = Fulfilled;
      this.result = value;
    });
  }
  reject = (reason) =>{
	if (this.status === Pending) {
      // 状态在 reject 的时候才改变
      this.status = Rejected;
      this.result = reason;
    }
  }
}
```

new Promise()的时候, 如果遇到错误, promise 的需要直接 reject, 这里直接在 constructor 里 try/catch 即可

```JS
  constructor(executor) {
      // 初始状态为Pending
    this.status = Pending;
	// promise的初始值
	this.result = null
    try {
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
	// ....
  }
```

### then 方法

接下来实现 then 方法. then 方法接收两个参数. 回想一下 then 方法的执行过程及 onFulfilled/ onRejected 的执行过程, 首先需要对 onFulfilled/ onRejected 进行处理

```JS
class MyPromise {
	//...

  then = (onFulfilled, onRejected) => {
	  // 如果onFulfilled/ onRejected 不是函数,则直接将当前Promise的值返回
	//Promise.reject('1').then().then(console.log, console.error);
    // console.error('1')
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled :(value) => value;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason;
          };

  }
}

```

对 then 的参数做完处理, 就要执行下 then 的逻辑了. then 方法用来访问塔当前/最终的值或者 reject 的原因, 这里要注意只有在 promise 的状态已经改变之后, then 方法才能获取到 promise 的结果. 如果还是 pending 状态, 需要等待状态变化

```JS
  then = (onFulfilled, onRejected) => {
	//...

	//+++
    if (this.status === Fulfilled) {
      onFulfilled(this.result)
	}

    if (this.status === Rejected) {
      onRejected(this.result)
	}
 }
```

等等！通常的用法可能是`new Promise(fn).then(onFulfilled)`, 在 new Promise 的过程中, resolve 可能是一个异步任务, 比如网络请求/setTimeout 等, new 之后直接调用 then 方法, Promise 的状态可能还没有发生改变, then 可能直接就空过了. 怎么让 then 不走空呢？仔细想一下, then 的执行需要在 resolve/reject 之后, 那么就可在 then 的时候将 onFulfilled/onRejected 保存下来, 在 resolve/reject 改变 promise 状态之后执行就可以了. 同时由于 then 可以多次注册/调用, 所以保存的 onFulfilled/onRejected 应该是一个数组.

```JS
class MyPromise {
  constructor(executor) {
	// 保存 then 的参数
    this.fulfilledFns = [];
    this.rejectedFns = [];
  }

  resolve = (value) => {
    if (this.status === Pending) {
	  // 状态在 resolve 的时候才改变
	  this.status = Fulfilled;
	  this.result = value;
	  // ++
	  this.fulfilledFns.forEach((fn) => fn(value));
    }
  };


  reject = (reason) => {
    if (this.status === Pending) {
	  // 状态在 resolve 的时候才改变
	  this.status = Rejected;
	  this.result = reason;
	  // ++
      this.rejectedFns.forEach((fn) => fn(reason));
    }
  };

  then = (onFulfilled, onRejected) => {

    //...

	//+++
    if (this.status === Pending) {
      this.fulfilledFns.push(onFulfilled)
      this.rejectedFns.push(onRejected)
	}
  }

}

```

#### 实现异步

then 的执行需要在 resolve/reject 之后才执行, 是一个异步的状态. 在 promise A+ 规范中,2.2.4 规定 onFulfilled / onRejected 只有在执行环境的堆栈中只有"平台代码"时才可被调用, 在 3.1 中有详细的解释,需要在 then 方法被调用的某次事件循环之后, 在新的任务栈中执行 onFulfilled / onRejected. 具体是宏任务/微任务并没有具体的要求, 为了方便直接用 setTimeout 实现了

首先, new Promise((resolve,reject)=>{}) 在执行构造函数的时候是同步的, 在 resolve/reject 时是异步的, 所以需要先让 resolve/reject 在 setTimeout 内执行

```JS
  resolve = (value) => {
    if (this.status === Pending) {
      // 确保 resolve 是异步执行的
      setTimeout(() => {
        // 状态在 resolve 的时候才改变
        this.status = Fulfilled;
        this.result = value;
        this.fulfilledFns.forEach((fn) => fn(value));
      });
    }
  };
```

reject 同理

```JS
  reject = (reason) => {
    if (this.status === Pending) {
      // 确保 reject 是异步执行的
      setTimeout(() => {
        // 状态在 reject 的时候才改变
        this.status = Rejected;
        this.result = reason;
        this.rejectedFns.forEach((fn) => fn(reason));
      });
    }
  };
```

接下来要实现 then 的异步. 前文提到一个 promise 可能注册多个 then 方法, 每个 then 方法的 onFulfilled / onRejected 都得是异步执行的方法, 这里需要再包装一下.

```JS
  then = (onFulfilled, onRejected) => {
	//...

	//+++
      if (this.status === Pending) {

        this.fulfilledFns.push(() => {
          // then 是一个异步方法
          setTimeout(() => {
            onFulfilled(this.result);
          });
        });
        this.rejectedFns.push(() => {
          // then 是一个异步方法
          setTimeout(() => {
            onRejected(this.result);
          });
        });
      }

      if (this.status === Fulfilled) {
        // 2.2.4  -> 3.1 必须异步执行
        setTimeout(() => {
         onFulfilled(this.result);
        });
      }

      if (this.status === Rejected) {
        // 2.2.4  -> 3.1 必须异步执行
        setTimeout(() => {
          onRejected(this.result);
        });
      }
 }
```

### then 方法的链式调用

规范 2.2.7 规定了 then 方法必须返回一个 promise 对象, 同时对 onFulfilled / onRejected 有一定的约束:

1.  如果 onFulfilled / onRejected 返回一个值 x, 则运行**Promise 解决过程**
2.  如果 onFulfilled / onRejected 抛出异常 e, 则返回的 promise2 必须 reject(e)
3.  如果 onFulfilled 不是函数且原 promise1 成功执行, 则返回的 promise2 需要 resolve promise1 resolve 的值',这里已经在上文的 then 方法中包装过了
4.  如果 onRejected 不是函数且原 promise reject 了, 则返回的 promise2 需要 reject promise1 reject 的值', 这里已经在上文的 then 方法中包装过了

举个例子

```JS
new Promise((resolve,reject) => {
	resolve('xxx')
})
// 位置1
.then(null,null)
.then((res)=>{
	// 位置2
   console.log(res)
},()=>{});
```

位置 1 的 then 方法不是函数, 但原 promise 是 resolve 的, 所以 then 方法返回 promise 是一个 resolve 状态, 并且 resolve 的值是原 promise resolve 的值
在位置 2 输出的值就是 promise resolve 的值

### Promise 解决过程

在上文中, onFulfilled / onRejected 的返回值 x 可能是各种类型的, 针对不同的类型, promise 有不同的处理方法, 就是所谓的 Promise 解决过程. 规范有以下几点约束, 这里约定 then 返回的新 promise 为 promise2:

1. (2.3.1)如果 x 和 promise2 相等, 则直接 reject, 原因是一个 TypeError

2. (2.3.2)如果 x 是 promise,则

   - 如果 x 是 pending, 则 promise2 需保持为 pending, 直至 x 状态改变
   - 如果 x 是 fullfilled, promise2 也执行 x 的值
   - 如果 x 是 rejected, promise2 也 reject x 的 原因

3. (2.3.3)如果 x 是对象或函数 则

   - 先把 x.then 赋值给 一个新的 then 变量
   - 如果出错, 则 then reject 这个错误
   - 如果 then 变量是函数, 则将 x 作为 then 变量函数的 this, 并且调用. 接收两个参数 resolvePromise 和 rejectPromise 作为 then 变量的 onFulfilled / onRejected
     - 如果 promise2 resolve y, 则继续运行 **Promise 解决过程** (resolvePromise)
     - 如果 promise2 reject, 则直接 reject (rejectPromise)
     - resolvePromise 和 rejectPromise 只能被调用一次,剩下的忽略
     - 如果 then 变量函数调用时抛出异常, 且 resolvePromise 或 rejectPromise 已经被调用, 则忽略; 否则 reject promise2
   - 如果 then 不是函数, 则 promise2 resolve x

4. (2.3.4) 如果 x 不是对象或函数, 则 promise2 resolve x

#### 实现 Promise 解决过程

```JS

/**
 *
 * @param {promise1.then 返回的一个新promise} promise2
 * @param {promise1.then(onFulfilled,onRejected) 中 onFulfilled,onRejected 返回的值 } x
 * @param {promise2的resolve} resolve
 * @param {promise2的reject} reject
 */
function resolvePromise(promise2, x, resolve, reject) {
  //2.3.1 如果 x 和 promise2指向同一个对象,reject 一个 TypeError.
  if (x === promise2) {
    reject(new TypeError('promise and x refer to the same object'));
  }

  // 2.3.2 -> 3.4 如果 x 为 Promise ,则使 promise2 接受 x 的状态
  if (x instanceof MyPromise) {
    //2.3.2.1 如果 x 是 pending 状态, 则当x的状态改变的时候继续执行 .
    if (x.status === Pending) {
      // x 状态改变时,是promise1.then() resolve /reject 的结果,还是需要 resolvePromise
      x.then((y) => {
        resolvePromise(promise2, y, resolve, reject);
      }, reject);
    }
    //2.3.2.2 如果 x 是 fulfilled, 则 promise2 改变fulfilled, 值为 x的 resolve 值 .
    if (x.status === Fulfilled) {
      resolve(x.result);
    }
    // 2.3.2.3  如果 x 是 rejected, 则 promise2 改变 rejected, 值为 x的 reason 值 .

    if (x.status === Rejected) {
      reject(x.result);
    }
  } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let then;
    try {
      // 2.3.3.1 把 x.then 赋值给 then
      then = x.then;
    } catch (e) {
      // 2.3.3.2 如果取 x.then 的值时抛出错误 e ,则以 e 为据因拒绝 promise, promise结束
      reject(e);
      return;
    }

    // 2.3.3.3 如果 then 是个函数, 则 x 作为 this 进行调用, 第一个参数是 resolve 函数, 第二个参数是 reject 函数

    if (typeof then === 'function') {
      // 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 均被调用,或者被同一参数调用了多次,则优先采用首次调用并忽略剩下的调用
      let called = false;
      try {
        then.call(
          x,
          // 2.3.3.3.1 如果 resolvePromise 以值 y 为参数被调用,则运行 [[Resolve]](promise, y)
          (y) => {
            if (!called) {
              called = true;
              resolvePromise(promise2, y, resolve, reject);
            }
          },
          (r) => {
            if (!called) {
              called = true;
              reject(r);
            }
          }
        );
      } catch (e) {
        /**
         * 2.3.3.3.4 如果调用 then 方法出错
         * 2.3.3.3.4.1 如果 resolvePromise 或 rejectPromise 已经被调用,则忽略之
         */

        if (!called) {
          called = true;
          // 2.3.3.3.4.2
          reject(e);
        }
      }
    } else {
      // 2.3.3.4 如果 then 不是函数,以 x 为参数执行 promise
      resolve(x);
    }
  }
  //2.3.4 如果 then 不是函数, 直接resolve(x).
  else {
    resolve(x);
  }
}
```

### 改造 then 方法

根据规范 2.2.7, then 方法返回一个 promise

```JS

  then = (onFulfilled, onRejected) => {
      // 2.2.1 onFulfilled, onRejected 是可选的,如果不是函数,则忽略(将value原样返回)
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason;
          };

	return new MyPromise((resolve,reject) =>{
		//..
	})

 }

```

根据规范,

1. 如果 then 的 onFulfilled/onRejected 执行过程出错, 则 promise2 直接 reject. 只需要在 onFulfilled/ onRejected 外面包一层 try catch 即可
2. 需要对 onFulfilled/ onRejected 的 返回值做处理, 即 resolvePromise(promise2,返回值,resolve, reject)

```JS
  then = (onFulfilled, onRejected) => {
    // 2.2.1 onFulfilled, onRejected 是可选的,如果不是函数,则忽略(将value原样返回)
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason;
          };

    // 2.2.7 then 返回一个Promise
    //       promise2 = promise1.then(onFulfilled, onRejected);
    //  |-> 3. 如果 onFulfilled 不是 function,且 promise1 是 fulfilled,则 promise2 改变为 fulfilled 时,与 promise1 值相同
    //  |-> 4. 如果 onRejected 不是 function,且 promise1 是 rejected,则 promise2 改变为 rejected 时,与 promise1 值相同
    const promise2 = new MyPromise((resolve, reject) => {
      // 异步执行时,状态如果还是pending,需要保存下onFulfilled和onRejected,在状态改变(resolve,reject)之后执行
      if (this.status === Pending) {
        // 2.2.6 then 可能会被调用多次,状态改变之后,onFulfilled, onRejected必须按原始调用顺序依次执行
        // 比如 promise.then();promise.then();promise.then(); 注册多个then方法
        this.fulfilledFns.push(() => {
          // then 是一个异步方法
          setTimeout(() => {
            // 也需要满足 2.2.7.1. onFulfilled, onRejected 如果return一个value,则需要resolve promise2 value
            try {
              let x = onFulfilled(this.result);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
        this.rejectedFns.push(() => {
          // then 是一个异步方法
          setTimeout(() => {
            // 也需要满足 2.2.7.1. onFulfilled, onRejected 如果return一个value,则需要resolve promise2 value
            try {
              let x = onRejected(this.result);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }

      if (this.status === Fulfilled) {
        // 2.2.4  -> 3.1 必须异步执行
        setTimeout(() => {
          // 2.2.2  Promise状态改变之后才能执行,且只能执行一次
          try {
            let x = onFulfilled(this.result);
            //  2.2.7.1. onFulfilled, onRejected 如果return一个value,则需要resolve promise2 value
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            //  2.2.7.2. 如果throw err, 则 promise2.reject(err)
            reject(e);
          }
        });
      }

      if (this.status === Rejected) {
        // 2.2.4  -> 3.1 必须异步执行
        setTimeout(() => {
          // 2.2.3 Promise状态改变之后才能执行,且只能执行一次
          try {
            let x = onRejected(this.result);
            //  2.2.7.1. onFulfilled, onRejected 如果return一个value,则需要resolve promise2 value
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
    });

    return promise2;
  };
```

[完整代码](./MyPromise.js)

## Promise A+ 测试

安装测试工具

```bash
npm install promises-aplus-tests -D
```

导出 MyPromise

```JS
class MyPromise {
	...
}


module.exports = MyPromise;

```

[测试工具](https://github.com/promises-aplus/promises-tests#readme)要求实现`deferred`方法,

- deferred(): creates an object consisting of { promise, resolve, reject }:

  - promise is a promise that is currently in the pending state.
  - resolve(value) resolves the promise with value.
  - reject(reason) moves the promise from the pending state to the rejected state, with rejection reason reason.

  导出一个对象,包括 3 个元素:

  1. pending 状态的 promise
  2. resolve(value) 用来 resolve 1. 的 promise
  3. reject(reason) reject 1. 的 promise

```JS
MyPromise.deferred = function () {
  let result = {};
  result.promise = new MyPromise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
};

```

在 package.json 中配置脚本:

```JSON
  "scripts": {
    "test": "promises-aplus-tests MyPromise"
  }

```
