# 变量声明及数据类型

## 变量声明

### `var`

1. 声明一个变量。无论在哪个位置声明，都会在代码真正执行前声明（变量提升）

   ```javascript
   console.log(a); // undefined
   var a = 10;
   ```

   等价于

   ```javascript
   var a;
   console.log(a);
   a = 10;
   ```

2. 可重复声明

   ```javascript
   var a = 1;
   var a = 2;
   var a = 3;
   console.log(a); // 3
   ```

   在严格模式下，有如下的行为,不会报错

   ```javascript
   'use strict';

   var a = {
     b: 1,
     b: 2,
   };
   console.log(a.b); // 2
   ```

   但是`function`不行

   ```javascript
   'use strict'; // 非严格模式不会报错
   function test(a, a) {
     // SyntaxError: Duplicate parameter name not allowed in this context
     console.log(a);
   }

   test(1, 2);
   ```

3. 声明变量的作用域是其上下文，未声明的是全局

   ```javascript
   function test() {
     a = 1;
     var b = 2;
   }

   test();
   console.log(a); //1
   console.log(window.a); //1
   console.log(b); //ReferenceError: b is not defined
   ```

   另一个例子

   ```javascript
   function test() {
     var a = (b = 1);
   }

   test();
   console.log(b); // 1
   console.log(a); // ReferenceError: a is not defined
   ```

### `let`

1. 变量会提升，但不会被初始化，不能被引用(_暂存死区_)

   ```javascript
   console.log(a); // ReferenceError: Cannot access 'a' before initialization
   let a = 10;
   ```

   作为对比：

   ```javascript
   console.log(a); // ReferenceError: a is not defined
   ```

   如果像`var`一样，初始化为`undefined`，那么`const`在初始化时先赋值为`undefined`，再修改为定义的值，相当于改变了`const`。[标准](https://www.ecma-international.org/ecma-262/6.0/index.html#sec-let-and-const-declarations)规定 `let` 和 `const` 会发生变量提升，但没有初始值。

   与*暂存死区*相关的例子

   ```javascript
   // example 1
   console.log(typeof a); //undefined
   // --------------
   console.log(typeof b); //ReferenceError: Cannot access 'b' before initialization
   let b = 10;
   ```

   ```javascript
   // example 2
   function test() {
     let a = 10;
     if (a) {
       let a = a + 1; //ReferenceError: Cannot access 'a' before initialization
     }
   }

   test();
   ```

   `example 2` 中，`if`判断完成后，`{}`生成了新的块级作用域，此时内部的`a`触发暂时死区，赋值时因为无法访问报错

   ```javascript
   // example 3
   function go(n) {
     console.log(n); // Object {a: [1,2,3]}

     for (let n of n.a) {
       console.log(n); //ReferenceError: Cannot access 'n' before initialization
     }
   }

   go({a: [1, 2, 3]});
   ```

   `example 3` 中,执行`for`循环时 `let n of n.a` 已经处在`for`的作用域内了，所以 `n.a` 取的是`let n` 的 `n`

2. 不允许重复声明

   ```javascript
   let a = 10;
   let a = 20; //SyntaxError: Identifier 'a' has already been declared
   ```

3. `let` 声明的变量作用域会限制在块内

   ```javascript
   var a = 1;
   var b = 2;

   if (a === 1) {
     var a = 11; // 覆盖全局的1
     let b = 22; // 作用域只在最近的{}内

     console.log(a); // 11
     console.log(b); // 22
   }

   console.log(a); // 11
   console.log(b); // 2
   ```

   条件声明时，`let` 声明变量是其块级作用域

   ```javascript
   if (true) {
     var a = 1;
     let b = 2;
     console.log(a, b); // 1,2
   }

   console.log(a, b); // ReferenceError: b is not defined
   ```

### `const`

1. 变量会提升，但不会被初始化,参考 `let`，也有*暂存死区*

   ```javascript
   console.log(a); // ReferenceError: Cannot access 'a' before initialization
   const a = 10;
   ```

2. 不允许重复声明

3. `const` 声明的变量作用域会限制在块内

4. `const` 只限制它指向的变量，如果`const` 变量本身是个引用类型，可以修改变量的内部属性

   ```javascript
   const a = {};
   a.name = '1';
   const b = [1];
   b[0] = 5;
   ```

### 经典的取值问题

```javascript
function test() {
  var arr = [];
  for (var i = 0; i < 5; i++) {
    arr.push(() => console.log(i));
  }
  return arr;
}

var result = test();
result.forEach((r) => r()); // 5 5 5 5 5
```

如果把 `var i = 0;` 改成 `let i = 0;`结果就会符合预期。上面的代码中的`test`等同于

```javascript
function test() {
  var arr = [];
  var i = 0;
  for (; i < 5; i++) {
    arr.push(() => console.log(i));
  }
  return arr;
}
```

变量`i`的作用域是`test`,当执行完`for`循环返回时，`test`内的`i`已经递增到 `5`。`arr`在外面调用时，依旧取的是 `test` 内的`i`。

解决方法是使用 [`IIFE(Immediately Invoked Function Expression)`](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) 或者使用 `let`

### 总结

JS 引擎一段一段地分析执行，编译后立即执行刚刚编译过的内容。声明优先级，函数 > 变量，同一作用域下存在多个同名函数声明，后面的会替换前面的函数声明。

函数提升

```js
foo(); // foo2
function foo() {
  console.log('foo1');
}

foo(); // foo2

function foo() {
  console.log('foo2');
}

foo(); // foo2
```

函数优先级 > 变量优先级

```js
foo(); // foo2
var foo = function () {
  console.log('foo1');
};

foo(); // foo1，foo重新赋值

function foo() {
  console.log('foo2');
}

foo(); // foo1
```

## 数据类型

- 基本数据类型

  - `Boolean`
  - `Number`
  - `String`
  - `Undefinend`
  - `Null`
  - `Symbol` (`ES6` 新增)
  - `BigInt` (`ES10` 新增)

- 引用数据类型(万物皆可对象)

  - **`Object`**
  - `Function`
  - `Array`
  - `Date`
  - `RegExp`
  - ...

### 数据类型的检测

```javascript
let num1 = 1;
let num2 = new Number(1);
let num3 = Number(1);
let str1 = '1';
let str2 = new String('1');
let str3 = String('1');
let i_am_undefiend = undefined;
let i_am_null = null;
let bool1 = true;
let bool2 = new Boolean(1);
let bool3 = Boolean(0);
let symbol = Symbol(1);
let bigInt1 = 11n;
let bigInt2 = BigInt(11);
let obj1 = {i: 1};
let obj2 = new Object();
let obj3 = Object();
let arr1 = [];
let arr2 = new Array();
let arr3 = Array();
let date1 = new Date();
let date2 = Date();
let fun1 = function () {};
let fun2 = new Function();
let reg1 = /A/;
let reg2 = new RegExp('A');
let reg3 = RegExp('A');
let map = new Map();
let weakMap = new WeakMap();
let set = new Set();
let weakSet = new WeakSet();
```

#### `typeof`

```javascript
console.log(typeof num1); // number
console.log(typeof num2); // object
console.log(typeof num3); // number
console.log(typeof str1); // string
console.log(typeof str2); // object
console.log(typeof str3); // string
console.log(typeof i_am_undefiend); // undefined
console.log(typeof i_am_null); // object
console.log(typeof bool1); // boolean
console.log(typeof bool2); // object
console.log(typeof bool3); // boolean
console.log(typeof symbol); // symbol
console.log(typeof bigInt1); // bigInt
console.log(typeof bigInt2); // bigInt
console.log(typeof obj1); // object
console.log(typeof obj2); // object
console.log(typeof obj3); // object
console.log(typeof arr1); // object
console.log(typeof arr2); // object
console.log(typeof arr3); // object
console.log(typeof date1); // object
console.log(typeof date2); // string
console.log(typeof fun1); // function
console.log(typeof fun2); // function
console.log(typeof reg1); // object
console.log(typeof reg2); // object
console.log(typeof reg3); // object
console.log(typeof map); // object
console.log(typeof weakMap); // object
console.log(typeof set); // object
console.log(typeof weakSet); // object
```

分别使用`字面量`和`实例方式`创建变量，其类型是不同的。另外，由于历史原因， `typeof null`的结果是 `object`。

可以看到，所有使用 `new` 操作符创建的值，其类型均为 `object`。_(万物皆对象)_

其他需要注意的点，连续使用 `typeof`,得到的结果是 ***类型*的类型**,**_类型_** 是字符串，所以有以下结果：

```javascript
typeof typeof undefined_variable; // string
```

#### `instanceof`

[`instanceof` 运算符用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上。](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof)

```javascript
1 instanceof Number; // false
Number(1) instanceof Number; // false
new Number(1) instanceof Number; // true
```

只要当前实列的**原型链**上存在`prototype`，都可以检测出来：

```javascript
[] instanceof Array; // true
[] instanceof Object; // true
```

`instanceof` 操作符判断的条件是

```javascript
while (intance.__proto__) {
  if (intance.__proto__ === TYPE.prototype) {
    return true;
  }

  intance.__proto__ = intance.__proto__.__proto__;
}
return false;
```

不过，`instanceof`无法检测 `null` 和 `undefined`

```javascript
null instanceof Null; // ReferenceError: Null is not defined
null instanceof null; // Right-hand side of 'instanceof' is not an object
```

#### **Object.prototype.toString.call()**(推荐)

```javascript
console.log(Object.prototype.toString.call(num1)); // [object Number]
console.log(Object.prototype.toString.call(num2)); // [object Number]
console.log(Object.prototype.toString.call(num3)); // [object Number]
console.log(Object.prototype.toString.call(str1)); // [object String]
console.log(Object.prototype.toString.call(str2)); // [object String]
console.log(Object.prototype.toString.call(str3)); // [object String]
console.log(Object.prototype.toString.call(i_am_undefiend)); // [object Undefined]
console.log(Object.prototype.toString.call(i_am_null)); // [object Null]
console.log(Object.prototype.toString.call(bool1)); // [object Boolean]
console.log(Object.prototype.toString.call(bool2)); // [object Boolean]
console.log(Object.prototype.toString.call(bool3)); // [object Boolean]
console.log(Object.prototype.toString.call(symbol)); // [object Symbol]
console.log(Object.prototype.toString.call(bigInt1)); // [object BigInt]
console.log(Object.prototype.toString.call(bigInt2)); // [object BigInt]
console.log(Object.prototype.toString.call(obj1)); // [object Object]
console.log(Object.prototype.toString.call(obj2)); // [object Object]
console.log(Object.prototype.toString.call(obj3)); // [object Object]
console.log(Object.prototype.toString.call(arr1)); // [object Array]
console.log(Object.prototype.toString.call(arr2)); // [object Array]
console.log(Object.prototype.toString.call(arr3)); // [object Array]
console.log(Object.prototype.toString.call(date1)); // [object Date]
console.log(Object.prototype.toString.call(date2)); // [object String]
console.log(Object.prototype.toString.call(fun1)); // [object Function]
console.log(Object.prototype.toString.call(fun2)); // [object Function]
console.log(Object.prototype.toString.call(reg1)); // [object RegExp]
console.log(Object.prototype.toString.call(reg2)); // [object RegExp]
console.log(Object.prototype.toString.call(reg3)); // [object RegExp]
console.log(Object.prototype.toString.call(map)); // [object Map]
console.log(Object.prototype.toString.call(weakMap)); // [object WeakMap]
console.log(Object.prototype.toString.call(set)); // [object Set]
console.log(Object.prototype.toString.call(weakSet)); // [object WeakSet]
```

可以完美的获取数据的类型。需要注意的是，`Date()`返回的是字符串，而不是一个日期对象。  
这种方法明显的看出一个变量是不是包装类(`String`,`Number`,`Boolean`)，需要结合 `typeof`

为什么`Object.prototype.toString.call()`可以获取 `JavaScript` 对象的类型呢？原因在于 `JavaScript`内置了一个 `symbol` [`Symbol.toStringTag`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag),作为对象的一个键使用，其值主要是被`Object.prototype.toString`方法读取，作为其返回值。

有些类型可以被 `toString()`直接识别，有些则是因为 `JavaScript` 引擎设置了`Symbol.toStringTag`。

```javascript
let a = new Map();
a.__proto__[Symbol.toStringTag]; // Map
```

但是自己创建的类型不会被赋予该值：

```javascript
class A {}
Object.prototype.toString.call(new A()); // "[object Object]"
// ---- 或者
function B() {}
Object.prototype.toString.call(new B()); // "[object Object]"
```

但是可以自己指定自定义标签：

```javascript
class A {
  get [Symbol.toStringTag]() {
    return 'A';
  }
}
Object.prototype.toString.call(new A()); // "[object A]"
// ---- 或者
function B() {}
B.prototype[Symbol.toStringTag] = 'B';
Object.prototype.toString.call(new B()); // "[object B]"
```

## 数据类型转换

### 强制类型转换

通过调用类型转换方法转换数据类型

#### `toString()` 和 `String()` 转换成 `String`

> `null` 和 `undefined` 没有 `toString` 方法，并且每种类型都重写了原型上的 `toString`

```javascript
null.toString(); // Cannot read property 'null' of undefined
undefined.toString(); // Cannot read property 'toString' of undefined
```

但是直接使用`String()`进行转换没有问题

```javascript
String(null); // 'null'
String(undefined); // 'undefined'
```

```javascript
String({a: 1}); // "[object Object]" => 不管啥对象都是转换成这个
String([1, 2, 3]); // "1,2,3"
String([1]); // "1"
[
  [1, 2],
  [{a: 5}, 4],
].toString(); // "1,2,[object Object],4"
String(new Map()); // "[object Map]"
String(new Set()); // "[object Set]"

// => 特殊情况
class A {}.toString(); // 'class A {}'
function () {}.toString(); // 'function () {}' / 返回该函数的全部代码

// 正则 -> 返回一个正则表达式字符串
const a = new RegExp("/d/")
a.toString() //  "/\/d\/g/"
/(\[|\])/g.toString(); // '/(\[|\])/g'
new Date().toString(); // 'Fri Mar 27 2020 12:33:16 GMT+0800 (中国标准时间)'
```

#### `Number()`| `parseInt()` | `parseFloat()` `+` `-` 转换成 `Number`

```javascript
Number(false) + // 0
  false; // 0
parseInt(false); // NaN
parseFloat(false); // NaN
```

#### `Boolean()` `!` 转换成 `Boolean`

`null`, `undefined`, `0`, `NaN`, `''`(空字符串)转为 false,其余都会 true

#### 引用类型转为其他类型

```mermaid
graph TD
    start(引用类型)-->toStringId(转换为字符串)
    start(引用类型)-->toNumber(转换为数值)
 toStringId-- 调用toString方法 -->isToStringIsProto{是否为原始类型}
 isToStringIsProto-->|yes| id1(转换成字符串并返回)
    isToStringIsProto--  no --调用valueOf方法 -->isToStringIsValueProto{是否为原始类型}
 isToStringIsValueProto-->|yes|id2(转换成字符串并返回)
 isToStringIsValueProto-->|no|id3(报错)
 toNumber --调用valueOf方法 --> isToNumberIsProto{是否为原始类型}
 isToNumberIsProto-->|yes| id(转换成数值并返回)
    isToNumberIsProto--  no --调用toString方法 -->isToNumberIsStringProto{是否为原始类型}
 isToNumberIsStringProto-->|yes|id4(转换成数值并返回)
 isToNumberIsStringProto-->|no|id5(报错)
```

面试题：

```js
let a ?
if (a == 1 && a == 2 && a == 3) {
  console.log(true);
}
```

答案：可以通过定义`a`的 `valueOf` 和 `toString` 方法实现

```js
let a = {
  value: 0,
  valueOf() {
    return ++this.value;
  },
};

// 或者定义toString
let a = {
  value: 0,
  toString() {
    return ++this.value;
  },
};
```

不过这个问题也只在非严格模式下有效。严格模式不会做隐式类型转换的

### 隐式转换

这边应该有罪恶滔天的 JS 判断图，后续补上

记住，触发隐式转换的条件有两种

> 1. `==` or `&&` or `||` 等逻辑操作符
> 2. `+` `-` `*` `/` 运算符

优先级: 字符串 > 数字 > `Boolean`,出现字符串，优先转字符串
两边类型不同，优先转换为数字进行计算

`-` `*` `/`: 数字 ，转成数字进行计算，不合规则则返回 `NaN`
任何数和 NaN 运算都是 NaN

特殊情况

```js
+undefined // NaN
+[] // 0
+{} // NaN
-[] // -0
-{} //NaN
+null // 0
+false // 0

undefined+null // MaN
false+null // 0

[]+{} // "[object Object]"
[]-{} // NaN
{}+[] // 0
{}-[] // -0
[]+undefined // "undefined"
[]+false // "false"
[]+null // "null"
{}+undefined //NaN
{}+false // 0
{}+null // 0

//大坑！！！
![] == 0 // true
[] ==0 //true
[] == [] //false
![] ==[] // true
```
