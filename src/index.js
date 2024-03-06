// 引入配置文件 或者是读取配置文件 mini-webpack.config.js
// 读取入口文件
// 读取输出文件
// 读取模块

const config = require('../mini-webpack.config');
const Compiler = require('./miniCompiler.js');
function webpack(config) {
  const compiler = new Compiler(config);

  compiler.run();
}

webpack(config);
