http2 不再支持 statusText, 如果代码里判断了 status === 200 && statusText === "OK" ,可能会出问题
