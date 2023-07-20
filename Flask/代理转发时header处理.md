> Flask version 2.3.2

Flask request.headers 是不可修改的，需要新创建一个才能操作

request.environ 和 request.headers.copy() 不能用

```python

from flask import request
import json
from werkzeug.datastructures import Headers


def reset_header():
    new_headers = Headers(request.headers)
    new_headers.add('X-Real-IP', request.remote_addr)
    new_headers.add('X-Real-UA', request.user_agent.string)
    return new_headers


def reset_body():
    data = request.data
    try:
        body = json.loads(data)
    except:
        return {"code": 1, "message": "参数格式错误"}

    return body


async def base_post(url):
    host = get_proxy_host()
    target_url = "{}:{}{}".format(host, appconf.api_port, url)
    headers = reset_header()
    body = reset_body()
    print("BasePost:", target_url, body)
	# todo 这里是开了个线程做转发，不应该await,代码待更新
	# todo 实现SSE的转发
    response = await asyncio.to_thread(requests.post, url=target_url, headers=headers, json=body)
    print("Response", response.text)
    return response.text



# 通用 Post Proxy
# 默认所有的 “^/api/**/*” 的请求都会走统一的代理转发逻辑，如果有转发逻辑优先级较高，需要在此之前定义
@app.route('/api/<path:path>', methods=['POST'])
async def common_proxy_post(path):
    print("Proxy Post Path:", path)
    return await base_post("/api/{}".format(path))

```
