1. 客户端向服务器发起 HTTPS 请求，连接到服务器的 443 端口，告诉服务端自己支持的加密算法
2. 服务器端有一个密钥对，即公钥和私钥，是用来进行非对称加密使用的.服务端将公钥+ 加密算法发送给客户端
3. 服务端发送自己的证书给客户端

4. Server 把自己的公钥、域名等信息发送给 CA
5. CA 拿到后用自己的私钥进行加密(服务端公钥 域名 过期时间等)
6. 权威机构的公钥不需要传输，因为权威机构会跟主流的浏览器或操作系统合作，将他们的公钥内置到浏览器或操作系统环境中
7. Client 收到数字证书后，从数字证书中找到权威机构的信息，从本地找到权威机构的公钥，就能正确解密 Server 的公钥
8. Client 使用 CA 公钥解密，得到服务器的公钥、证书的数字签名、签名计算方法。重新计算签名，对比签名是否一致。判断证书是否被中间人篡改。

---

1. Client 发送 Client Hello 报文给 Server 开启 SSL 通信，报文中包含 Random_1 和自己支持的加密算法
2. 服务器支持 SSL 通信的话，发送 Server Hello 报文回应，报文中包含 Random_2
3. 服务器之后发送 Certificate 报文，报文中包含数字证书
4. 服务器再发送 Server Hello Done 通知 Client，最初的 SSL 握手阶段协商部分结束
5. Client 对数字证书校验，正确后，解密得到服务器的公钥。通过 RSA 算法随机生成 Pre-Master Secret，并且用服务器的公钥进行加密，包含在 Client Key Exchange 报文中，发送给 Server
