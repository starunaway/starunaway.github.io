/**
 * https://promisesaplus.com/
 */

/* Promise 有3种状态： Pending, Fulfilled,Rejected
    Pending -> Fulfilled
        |----> Rejected	
	一旦改变，就不可更改	
*/

const Pending = Symbol('Pending');
const Fulfilled = Symbol('Fulfilled');
const Rejected = Symbol('Rejected');

class MyPromise {
  constructor(executor) {
    // 初始状态为Pending
    this.status = Pending;
    // 初始值为null，只有在 resolve/reject 之后才会改变，和status一样，只能变一次
    this.result = null;

    this.fulfilledFns = [];
    this.rejectedFns = [];

    // 2.3.3.3.4 如果执行的时候报错
    //   --> 如果状态已经改变，则忽略
    //   --> 否则, reject
    try {
      // new Promise((resolve,reject) =>{}) 时接收两个参数
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  resolve = (value) => {
    if (this.status === Pending) {
      this.status = Fulfilled;
      this.result = value;
      // 确保 resolve 是异步执行的
      setTimeout(() => {
        this.fulfilledFns.forEach((fn) => fn(value));
      });
    }
  };
  reject = (reason) => {
    if (this.status === Pending) {
      this.status = Rejected;
      this.result = reason;
      // 确保 reject 是异步执行的
      setTimeout(() => {
        this.rejectedFns.forEach((fn) => fn(reason));
      });
    }
  };

  // 2.2.5 不能包含this

  then = (onFulfilled, onRejected) => {
    // 2.2.1 onFulfilled, onRejected 是可选的，如果不是函数，则忽略(将value原样返回)
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
        // 2.2.6 then 可能会被调用多次，状态改变之后，onFulfilled, onRejected必须按原始调用顺序依次执行
        // 比如 promise.then();promise.then();promise.then(); 注册多个then方法
        this.fulfilledFns.push(() => {
          // 也需要满足 2.2.7.1. onFulfilled, onRejected 如果return一个value，则需要resolve promise2 value
          //todo: 是否需要 setTimeout?
          try {
            let x = onFulfilled(this.result);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        this.rejectedFns.push(() => {
          // 也需要满足 2.2.7.1. onFulfilled, onRejected 如果return一个value，则需要resolve promise2 value
          //todo: 是否需要 setTimeout?
          try {
            let x = onRejected(this.result);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.status === Fulfilled) {
        // 2.2.4  -> 3.1 必须异步执行
        setTimeout(() => {
          // 2.2.2  Promise状态改变之后才能执行，且只能执行一次
          try {
            let x = onFulfilled(this.result);
            //  2.2.7.1. onFulfilled, onRejected 如果return一个value，则需要resolve promise2 value
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            //  2.2.7.2. 如果throw err， 则 promise2.reject(err)
            reject(e);
          }
        });
      }

      if (this.status === Rejected) {
        // 2.2.4  -> 3.1 必须异步执行
        setTimeout(() => {
          // 2.2.3 Promise状态改变之后才能执行，且只能执行一次
          try {
            let x = onRejected(this.result);
            //  2.2.7.1. onFulfilled, onRejected 如果return一个value，则需要resolve promise2 value
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
    });

    return promise2;
  };
}

/**
 *
 * @param {promise1.then 返回的一个新promise} promise2
 * @param {promise1.then(onFulfilled,onRejected) 中 onFulfilled,onRejected 返回的值 } x
 * @param {promise2的resolve} resolve
 * @param {promise2的reject} reject
 */
function resolvePromise(promise2, x, resolve, reject) {
  //2.3.1 如果 x 和 promise2指向同一个对象，reject 一个 TypeError.
  if (x === promise2) {
    reject(new TypeError('promise and x refer to the same object'));
  }

  // 2.3.2 -> 3.4 如果 x 为 Promise ，则使 promise2 接受 x 的状态
  if (x instanceof MyPromise) {
    //2.3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
    if (x.status === Pending) {
      // x 状态改变时，更新
      //todo ?
      x.then(resolve, reject);
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
      // 2.3.3.2 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      reject(e);
    }

    // 2.3.3.3 如果 then 是个函数, 则 x 作为 this 进行调用, 第一个参数是 resolve 函数, 第二个参数是 reject 函数

    if (typeof then === 'function') {
      // 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
      let called = false;
      try {
        then.call(
          x,
          // 2.3.3.3.1 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
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
         * 2.3.3.3.4.1 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
         */

        if (!called) {
          called = true;
          // 2.3.3.3.4.2
          reject(e);
        }
      }
    } else {
      // 2.3.3.4 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x);
    }
  }
  //2.3.4 如果 then 不是函数, 直接resolve(x).
  else {
    resolve(x);
  }
}

// Promises/A+官方的测试工具
// npm install promises-aplus-tests -D

MyPromise.deferred = function () {
  let result = {};
  result.promise = new MyPromise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
};

module.exports = MyPromise;
