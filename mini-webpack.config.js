// mini-webpack-config 配置文件
// 导出一个对象
// webpack 的配置文件是 JavaScript 文件，文件内导出了一个 webpack 配置的对象。 
// webpack 会根据该配置定义的属性进行处理。
// webpack 遵循 CommonJS 模块规范，所以配置文件可以使用 require
// export default {
//   // 定义入口文件
//   entry: './src/index.js',
//   // 定义输出文件
//   output: {
//     filename: 'bundle.js',
//     path: path.resolve(__dirname, 'dist')
//   }
// }
const path = require('path');
const jsonLoader = require('./example/jsonLoader');
const myLoader = require('./example/myLoader.js');
module.exports = {
  // 定义入口文件
  entry: './example/hi.js',
  // 定义输出文件
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist')
  },
  module: {
    rules: [
      { test: /\.json$/, loader: jsonLoader },
      { test: /\.js$/, loader:myLoader},
    ]
  }
}
