Next.js

# 提供服务能力

Next 提供了服务能力，需要在 route.ts 文件下导出 POST / GET / PUT 等函数实现对应的功能

但其对应的 [NextRequest](https://nextjs.org/docs/app/api-reference/functions/next-request) 扩展至 [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)

处理提供的 cookie 的操作方法，其他的读取 query / body 的方法都是原生的，需要自行实现.

## query

需要使用 `URL` 实例的 `searchParams` 方法获取

```javascript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: any
): Promise<any> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const config = await getConfigByName(id || '');

    return NextResponse.json({
      message: 'success',
      data: config,
    });
  } catch (error) {
    return NextResponse.json({
      message: error as string,
      data: [],
    });
  }
}
```

## body

### 通过 request.json() 获取

```typescript
export async function POST(request: NextRequest): Promise<NextResponse<any>> {
  const body = request.body;

  const json = await request.json();
  console.log(json);

  return NextResponse.json({
    message: 'success',
    data: json,
  });
}
```

### 通过 ReadableStream 获取

适用于 Stream 处理，比如 LLM 的消息回复

request.body 是一个 [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) 对象，可以在通过 getReader 方法返回 `ReadableStreamDefaultReader`(默认)。

reader.read 方法会返回一个 Promise<{done:boolean,value:Uint8Array|undefiend}> ，其中 done 代表是否读取完成

value 是一个 `Uint8Array` 类型，可以通过 `String.fromCharCode` 将 bit 转化成字符，拿到完整的字符传之后再转成 JSON

```javascript
import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  const reader = request.body?.getReader();

  let bodyStr: string = '';

  try {
    if (reader) {
      while (true) {
        const { done, value } = await reader?.read();
        if (done) break;

        value.forEach((i) => {
          const char = String.fromCharCode(i);
          bodyStr += char;
        });
      }
    }

    const bodyJson = JSON.parse(bodyStr);

    console.log(bodyJson);

    return NextResponse.json({
      message: 'success',
      data: bodyJson,
    });
  } catch (error) {
    console.error('Update Config error', error);
    return NextResponse.json({
      message: error,
      data: null,
    });
  }
}
```

## TODO：

实现 Alob Stream Uint8Array Buffer ArrayBuffer 互转

使用 next 作为 express 中间件
