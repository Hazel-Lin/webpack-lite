// mini-webpack-config 配置文件
// 导出一个对象
// webpack 的配置文件是 JavaScript 文件，文件内导出了一个 webpack 配置的对象。 
// webpack 会根据该配置定义的属性进行处理。
// webpack 遵循 CommonJS 模块规范，所以配置文件可以使用 require

const path = require('path');

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
      // 先执行 changeLoader  再执行 myLoader 在这个配置中 use 中的元素应该是字符串的形式
      {
        test: /\.js$/,
        use: [
          path.resolve(__dirname, 'example/changeLoader.js'),
          path.resolve(__dirname, 'example/myLoader.js')
        ]
      },
      {
        test: /\.json$/,
        use: [path.resolve(__dirname, 'example/jsonLoader.js')]
      },
    ]
  }
}
