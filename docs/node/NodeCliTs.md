# 使用 TS 写一个 Cli 工具

需要的环境: `typescript` + `node`

## 创建项目

```bash
mkdir ts-cli && cd ts-cli
npm init --yes
```

## 修改 package.json

```json
{
  "name": "package-name",
  "version": "x.x.xx",
  "description": "description",
  "main": "index.js",
  "bin": {
    "ts-cli": "./bin/index.js"
  },
  "files": ["/bin"],
  "scripts": {
    "start": "concurrently \"tsc -w\" \"tsc-alias -w\"",
    "build": "tsc && tsc-alias",
    "test": "jest"
  },
  "dependencies": {
    "@demo-tool/cli": "^0.1.28",
    "chalk": "4.1.2",
    "commander": "^9.3.0",
    "cross-spawn": "^7.0.3",
    "fs-extra": "^10.1.0",
    "inquirer": "^8.2.4",
    "semver": "^7.3.7"
  },
  "jest": {
    "transform": {
      ".(ts)": "ts-jest"
    },
    "moduleFileExtensions": ["ts", "js"],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    },
    "testPathIgnorePatterns": ["/bin/"],
    "collectCoverageFrom": ["/src/*.{ts}", "/src/**/*.{ts}"],
    "collectCoverage": true
  }
}
```

| 属性    | 说明                                                                              |
| ------- | --------------------------------------------------------------------------------- |
| name    | 发布时用到的名字,也是 npm link 时的名字                                           |
| version | 版本                                                                              |
| main    | packge 入口,直接 import/require 时的入口文件                                      |
| bin     | 定义 cli 的名称                                                                   |
| files   | 发布到 npm 时需要包含的文件, .npmignore 默认使用.gitignore,导致一些文件不会被发布 |

## 修改 tsconfig.json

`node` 本身是不能使用 `ts` 的,所以需要一些工具对源码进行编译,输出到另一个目录。一般会将输出目录添加到`.gitignore`,导致 `npm publish` 的时候会跳过该目录,所以需要在[files](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#files)里面添加一下

编译源码的工具可以选择 `tsc`/`babel`/`vite`/`webpack`/`rollup`... 等,一般来讲只需要将 `.ts` 转化成 `.js` 文件就可以了,不需要压缩/混淆等功能,`tsc` 就足够用。

> `tsc` 本身没有依赖收集能力,只会把 `ts` 文件输出到 `js` 文件,如果需要依赖收集/tree_shaking/代码混淆... 还是上构建工具吧

> 可以使用[ts-node](https://typestrong.org/ts-node/api/interfaces/RegisterOptions.html)
>
> ```js
> #!/usr/bin/env node
> require('ts-node').register({
>   /* options */
> });
> // 真正的入口文件
> require('./index.ts');
> ```

> 也可以使用[esbuild-register](https://github.com/egoist/esbuild-register)
>
> ```js
> #!/usr/bin/env node
> require('esbuild-register/dist/node');
> // 真正的入口文件
> require('./index.ts');
> ```

这里需要设置一下 `tsconfig`

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "declaration": true,
    "outDir": "bin",
    "strict": true,
    "sourceMap": false,
    "composite": false,
    "skipLibCheck": true,
    "noImplicitAny": false,
    "declarationMap": true,
    "esModuleInterop": true,
    "inlineSources": false,
    "noUnusedLocals": false,
    "moduleResolution": "node",
    "noUnusedParameters": false,
    "preserveWatchOutput": true,
    "forceConsistentCasingInFileNames": true,
    "downlevelIteration": true,
    "resolveJsonModule": true,
    "lib": ["es2015", "es2016", "es2017"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
```

有几个关键属性需要说一下

| 属性        | 说明                                              |
| ----------- | ------------------------------------------------- |
| target      | 输出的代码版本, 编译后的版本需要**Node 版本**支持 |
| module      | 输出后的 module 类型,node 端用 commonjs 就行      |
| declaration | 生产.d.ts 文件                                    |
| outDir      | 输出的目录                                        |
| lib         | ts 预定义了不同版本 ES 的 type,按需取用           |
| baseUrl     | 和 paths 一起,可以定义别名                        |
| paths       | 和 baseUrl 一起,可以定义别名                      |

## 别名问题

使用 `tsc` 对源码进行编译的时候,需要注意 `alias` 的问题,除了在编译时进行配置,也需要更新产物里面对应的 `alias`,替换回相对路径形式。  
我们可以使用 `tsc-alias` 在编译后进行替换,配置 `build` 命令为:

```json
{
  "scripts": {
    "build": "tsc && tsc-alias",
    "build:watch": "concurrently \"tsc -w\" \"tsc-alias -w\""
  }
}
```

同时安装 `concurrently` 库, 运行 `npm run build:watch` 命令,可以做到每次更改代码的时候实时更新

## 开始编写代码

```js
#! /usr/bin/env node
```

需要在入口文件的顶部添加这行代码,在 `tsc` 编译的时候将这行代码生成到目标文件下,告诉 `node` 这是一个 `cli` 应用程序

上面提到,`tsc` 没有依赖收集的能力,如果代码中有 `path.resolve(__dirname,"xxx.xx.json")`文件等类似的代码,需要在 `ts` 文件内主动引入,告诉 `tsc` 编译时需要将 `json` 文件一并输出

```js
import './config.json';
```

附上一些常用的库:

- 输出美化:`chalk`
- 参数解析:`commander` `、yargs`
- 交互输入:`inquirer`
- 加载动画:`ora`
- 版本解析:`semver`
- 目录解析:`fast-glob` (\*\*_/_\*.js)

## link

需要安装一些 `ts` 的类型依赖, `npm i -D @types/node`
开发时只需要在当前 `ts-cli` 目录下执行 `npm link` 即可,

```bash
#ts-cli
npm link
```

在需要使用的目录下执行 `npm link YOUR_CLI_NAME` 即可,这里的 `YOUR_CLI_NAME` 就是 `package.json` 文件里面定义的 `name`.

```bash
#ts-cli
npm link YOUR_CLI_NAME
```

运行 `npm run build:watch` 命令,每次修改代码的时候都会编译,在 `link` 后的目录也会实时更新,本质上相当于 `YOUR_CLI_NAME` 链接到了 `package.json` 下 `bin` 指定的目录

## 编写测试用例

需要安装 `jest` 以及 `@types/jest`,具体可以参考上文的 `package.json` 里面 `jest` 属性,需要注意的是,我们的代码是用 `ts` 书写的,`jest` 本身不支持,需要额外安装 `ts-jest`
