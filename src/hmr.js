// 实现一个 热更新 功能
// 1. 启动 webpack 后发起一个 websocket 连接 webpack 和浏览器之间通过 websocket 通信
// 2. 监听文件变化，当文件变化后，通过 websocket 发送消息到客户端 浏览器
// 3. 客户端接收到消息后，刷新页面 浏览器中的模块热替换处理器会向服务端发起请求，获取最新的模块代码
// 4. 服务端返回最新的模块代码，浏览器中的模块热替换处理器会将最新的模块代码替换到页面中

// 1. 实现一个简单的 websocket 服务
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log("WebSocket 连接成功");

  ws.on('message', function incoming(data) {
    console.log('received: %s', data);
    const msg = JSON.parse(data);

    if (msg.type === 'moduleUpdate') {
      // 模块更新
      console.log('模块更新');
      const moduleId = msg.payload.moduleId;
      const newModuleCode = msg.payload.code;

      // 更新模块代码
      moduleCache[moduleId] = new Function("module", "exports", newModuleCode);

      // 通知客户端更新完成
      ws.send(JSON.stringify({ type: "moduleUpdated", moduleId }));
    }
  });
})




